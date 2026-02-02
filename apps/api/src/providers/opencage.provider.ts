import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpencageProvider {
  private readonly apiKey = process.env.OPENCAGE_API_KEY;
  private readonly baseUrl =
    'https://api.opencagedata.com/geocode/v1/json';

  constructor(private readonly httpService: HttpService) {}

  async geocode(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(this.baseUrl, {
          params: {
            q: address,
            key: this.apiKey,
            limit: 1,
          },
        }),
      );

      const result = response.data?.results?.[0];

      if (!result) {
        throw new Error('No geocoding result');
      }

      const { lat, lng } = result.geometry;

      return { lat, lng };
    } catch {
      throw new InternalServerErrorException(
        'Failed to resolve location coordinates',
      );
    }
  }
}
