import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services/product.service';
import { OrderService } from '../core/services/order.service';
import { Product } from '../core/models/product.model';
import { SaleOrder } from '../core/models/order.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="welcome-section">
      <div class="welcome-text">
        <h1>欢迎使用进销存管理系统</h1>
        <p class="subtitle">简洁、高效、专业的商品管理解决方案</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card" routerLink="/products">
        <div class="stat-icon product-icon">
          <mat-icon>inventory_2</mat-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalProducts }}</div>
          <div class="stat-label">商品总数</div>
        </div>
      </div>

      <div class="stat-card" routerLink="/inventory">
        <div class="stat-icon warning-icon" *ngIf="lowStockCount > 0">
          <mat-icon>warning</mat-icon>
          <span class="badge" *ngIf="lowStockCount > 0">{{ lowStockCount }}</span>
        </div>
        <div class="stat-icon normal-icon" *ngIf="lowStockCount === 0">
          <mat-icon>check_circle</mat-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ lowStockCount }}</div>
          <div class="stat-label">库存预警</div>
        </div>
      </div>

      <div class="stat-card" routerLink="/orders">
        <div class="stat-icon order-icon">
          <mat-icon>receipt_long</mat-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ todayOrders }}</div>
          <div class="stat-label">今日订单</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon revenue-icon">
          <mat-icon>payments</mat-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">¥{{ todayRevenue }}</div>
          <div class="stat-label">今日营收</div>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <div class="card-container">
        <div class="card-header">
          <h3 class="card-title">快捷操作</h3>
        </div>
        <div class="quick-actions">
          <button mat-raised-button routerLink="/products" class="action-btn">
            <mat-icon>add_box</mat-icon>
            <span>新增商品</span>
          </button>
          <button mat-raised-button routerLink="/orders" class="action-btn primary">
            <mat-icon>shopping_cart_checkout</mat-icon>
            <span>开单销售</span>
          </button>
          <button mat-raised-button routerLink="/inventory" class="action-btn">
            <mat-icon>storage</mat-icon>
            <span>查看库存</span>
          </button>
        </div>
      </div>

      <div class="card-container" *ngIf="lowStockProducts.length > 0">
        <div class="card-header warning-header">
          <h3 class="card-title">
            <mat-icon color="warn">warning</mat-icon>
            库存预警提醒
          </h3>
          <button mat-button routerLink="/inventory">查看全部</button>
        </div>
        <div class="warning-list">
          <div class="warning-item" *ngFor="let product of lowStockProducts">
            <div class="warning-info">
              <span class="product-name">{{ product.name }}</span>
              <span class="stock-info">
                当前库存: <strong>{{ product.stock }}</strong> {{ product.unit || '个' }}
              </span>
            </div>
            <span class="status-chip warning">库存不足</span>
          </div>
        </div>
      </div>

      <div class="card-container" *ngIf="lowStockProducts.length === 0">
        <div class="card-header success-header">
          <h3 class="card-title">
            <mat-icon color="primary">check_circle</mat-icon>
            库存状态良好
          </h3>
        </div>
        <div class="empty-state">
          <mat-icon color="primary">check_circle</mat-icon>
          <p>所有商品库存充足，暂无预警商品</p>
        </div>
      </div>

      <div class="card-container">
        <div class="card-header">
          <h3 class="card-title">最近订单</h3>
          <button mat-button routerLink="/orders">查看全部</button>
        </div>
        <div class="order-list" *ngIf="recentOrders.length > 0">
          <div class="order-item" *ngFor="let order of recentOrders">
            <div class="order-info">
              <span class="order-no">{{ order.orderNo }}</span>
              <span class="order-customer">{{ order.customerName || '散客' }}</span>
              <span class="order-time">{{ formatDateTime(order.createTime) }}</span>
            </div>
            <span class="order-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
        <div class="empty-state" *ngIf="recentOrders.length === 0">
          <mat-icon>receipt_long</mat-icon>
          <p>暂无订单记录</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-section {
      margin-bottom: 32px;
    }
    .welcome-text h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 8px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #64748b;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid #e2e8f0;
    }
    .stat-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-2px);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .stat-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: white;
    }
    .product-icon {
      background: #6366f1;
    }
    .warning-icon {
      background: #f59e0b;
    }
    .normal-icon {
      background: #10b981;
    }
    .order-icon {
      background: #8b5cf6;
    }
    .revenue-icon {
      background: #ec4899;
    }
    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #1e293b;
    }
    .stat-label {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .warning-header {
      background: #fffbeb;
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid #fef3c7;
    }
    .success-header {
      background: #ecfdf5;
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
      border-radius: 12px 12px 0 0;
      border-bottom: 1px solid #a7f3d0;
    }
    .card-title {
      font-size: 15px;
      font-weight: 600;
      color: #334155;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .quick-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .action-btn {
      flex: 1;
      min-width: 140px;
      height: 52px;
      font-size: 14px;
      background: #f1f5f9;
      color: #334155;
    }
    .action-btn.primary {
      background: #4f46e5;
      color: white;
    }
    .action-btn.primary:hover {
      background: #4338ca;
    }
    .action-btn mat-icon {
      margin-right: 8px;
    }
    .warning-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .warning-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      background-color: #fffbeb;
      border-radius: 8px;
      border: 1px solid #fef3c7;
    }
    .warning-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .product-name {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }
    .stock-info {
      font-size: 12px;
      color: #64748b;
    }
    .stock-info strong {
      color: #ea580c;
    }
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-chip.warning {
      background-color: #fed7aa;
      color: #c2410c;
    }
    .order-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .order-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .order-no {
      font-size: 14px;
      font-weight: 600;
      color: #334155;
    }
    .order-customer {
      font-size: 12px;
      color: #64748b;
    }
    .order-time {
      font-size: 11px;
      color: #94a3b8;
    }
    .order-amount {
      font-size: 16px;
      font-weight: 700;
      color: #4f46e5;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #94a3b8;
    }
    .empty-state mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
      opacity: 0.4;
    }
    .empty-state p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class HomeComponent implements OnInit {
  totalProducts = 0;
  lowStockCount = 0;
  todayOrders = 0;
  todayRevenue = '0.00';
  lowStockProducts: Product[] = [];
  recentOrders: SaleOrder[] = [];

  private productService = inject(ProductService);
  private orderService = inject(OrderService);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.lowStockProducts = products.filter(p => p.stock <= p.minStock);
        this.lowStockCount = this.lowStockProducts.length;
      }
    });

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrderList = orders.filter(order => {
          const orderDate = new Date(order.createTime);
          return orderDate >= today;
        });
        
        this.todayOrders = todayOrderList.length;
        const totalRevenue = todayOrderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        this.todayRevenue = totalRevenue.toFixed(2);
        
        this.recentOrders = orders.slice(0, 5);
      }
    });
  }

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
