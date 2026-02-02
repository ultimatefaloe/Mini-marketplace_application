import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Address, AddressDocument } from 'src/models/address.schema';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { Cart, CartDocument } from 'src/models/cart.schema';
import { OpencageProvider } from 'src/providers/opencage.provider';
import { Vendor, VendorDocument } from 'src/models/vendor.schema';

export type AddressType = {
  addressLine1: string,
  addressLine2: string,
  city: string,
  state: string,
  country: string,
  postalCode: string
}

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    private logger: Logger,
    private opencageProvider: OpencageProvider,
  ) { }

  async create(user: JwtPayload, dto: CreateAddressDto) {
    try {

      if (dto.isDefault) {
        await this.addressModel.findOneAndUpdate({ userId: user.auth_id, isDefault: true }, { isDefault: false })
      }
      const address = await this.addressModel.create({
        ...dto,
        userId: user.auth_id,
        isDefault: dto.isDefault ?? false,
      })

      return {
        success: true,
        message: 'Address added, successfully',
        data: this.toEntity(address)
      }

    } catch (error: any) {
      this.logger.error(error?.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async update(addressId: string, user: JwtPayload, dto: UpdateAddressDto) {
    if (!new Types.ObjectId(addressId)) throw new BadRequestException('Invalid address Id')
    try {
      await this.addressModel.findOneAndUpdate({ _id: addressId, userId: user.auth_id }, {
        ...dto
      })

      return {
        success: true,
        message: 'Address updateed',
      }

    } catch (error: any) {
      this.logger.error(error?.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll(user: JwtPayload,) {
    try {

      const addresses = await this.addressModel.find({ userId: user.auth_id })

      return {
        success: true,
        message: 'successful',
        data: addresses.map(a => this.toEntity(a))
      }

    } catch (error: any) {
      this.logger.error(error?.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async findOne(addressId: string, user: JwtPayload,) {
    try {
      if (!new Types.ObjectId(addressId)) throw new BadRequestException('Invalid address Id')

      const address = await this.addressModel.findOne({ _id: addressId, userId: user.auth_id })

      if (!address) throw new NotFoundException("Address not found")

      return {
        success: true,
        message: 'successful',
        data: this.toEntity(address)
      }

    } catch (error: any) {
      this.logger.error(error?.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async delete(addressId: string, user: JwtPayload,) {
    try {
      if (!new Types.ObjectId(addressId)) throw new BadRequestException('Invalid address Id')

      const address = await this.addressModel.deleteOne({ _id: addressId, userId: user.auth_id })

      if (!address) throw new NotFoundException("invalid user reference or address does not exist")

      return {
        success: true,
        message: 'Address deleted, successfully',
      }

    } catch (error: any) {
      this.logger.error(error?.message)
      throw new InternalServerErrorException(error.message)
    }
  }

  async calculateDeliveryFee(addressId: string, user: JwtPayload) {
    const address = await this.addressModel.findOne({
      _id: addressId,
      userId: user.auth_id,
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    const cart = await this.cartModel
      .findOne({ userId: user.auth_id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const formatAddress = this.formatAddress(address)

    const userCoords = await this.resolveCoordinates({ address: formatAddress });

    const vendorsMap = this.groupByVendor(cart.items);
    const vendorFees: any = [];

    for (const vendorId of Object.keys(vendorsMap)) {
      const vendor = await this.vendorModel.findById(vendorId);

      if (!vendor?.location) continue;

      const vendorCoords = await this.resolveCoordinates(vendor.location);

      const distanceKm = this.haversineDistance(
        vendorCoords.lat,
        vendorCoords.lng,
        userCoords.lat,
        userCoords.lng,
      );

      const fee = this.calculateFee(distanceKm);

      vendorFees.push({
        vendorId,
        distanceKm: Number(distanceKm.toFixed(2)),
        fee,
      });
    }

    const totalDeliveryFee = vendorFees.reduce(
      (sum, v) => sum + v.fee,
      0,
    );

    return {

      addressId,
      vendors: vendorFees,
      totalDeliveryFee,
      currency: 'NGN',

    };
  }

  /* ============================
   * Helpers
   * ============================ */

  private calculateFee(distanceKm: number): number {
    if (distanceKm <= 20) return 1000;

    const extraKm = distanceKm - 20;
    const blocks = Math.ceil(extraKm / 10);

    return 1000 + blocks * 500;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(lat1)) *
      Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private async resolveCoordinates(source: {
    lat?: number;
    lng?: number;
    address?: string;
  }): Promise<{ lat: number; lng: number }> {
    if (source.lat && source.lng) {
      return { lat: source.lat, lng: source.lng };
    }

    if (!source.address) {
      throw new BadRequestException('Invalid location data');
    }

    return this.opencageProvider.geocode(source.address);
  }

  private groupByVendor(items: any[]) {
    return items.reduce((acc, item) => {
      const vendorId = item.product.vendor.toString();
      acc[vendorId] = acc[vendorId] || [];
      acc[vendorId].push(item);
      return acc;
    }, {});
  }

  private formatAddress(data: { street?: string; city?: string; province?: string; country?: string; }): string { return [data.street, data.city, data.province, data.country].filter(Boolean).join(', '); }

  private toEntity(data: AddressType): AddressType {
    return data
  }
}
