export class OrderListEntity {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: Date;
  paidAt?: Date;
}