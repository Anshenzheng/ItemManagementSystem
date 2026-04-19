export interface SaleOrder {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  remark: string;
  createTime: string;
  items: SaleOrderItem[];
}

export interface SaleOrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  remark: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
}