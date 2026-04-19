import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SaleOrder, CreateOrderRequest, ApiResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  private http = inject(HttpClient);

  getOrders(): Observable<SaleOrder[]> {
    return this.http.get<ApiResponse<SaleOrder[]>>(this.apiUrl).pipe(
      map(res => res.data)
    );
  }

  createOrder(order: CreateOrderRequest): Observable<SaleOrder> {
    return this.http.post<ApiResponse<SaleOrder>>(this.apiUrl, order).pipe(
      map(res => res.data)
    );
  }
}