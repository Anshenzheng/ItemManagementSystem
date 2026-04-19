export interface Product {
  id: number;
  name: string;
  code: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  description: string;
  createTime: string;
  updateTime: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}