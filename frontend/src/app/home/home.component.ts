import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';
import { SaleOrder } from '../../core/models/order.model';

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
            <span class="order-amount">¥{{ order.totalAmount?.toFixed(2) }}</span>
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
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin: 0 0 8px 0;
    }
    .subtitle {
      font-size: 14px;
      color: #757575;
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
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .stat-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }
    .product-icon {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .warning-icon {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    .normal-icon {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
    .order-icon {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
    .revenue-icon {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #d32f2f;
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
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
      font-size: 28px;
      font-weight: 700;
      color: #333;
    }
    .stat-label {
      font-size: 13px;
      color: #757575;
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
      border-bottom: 1px solid #eee;
    }
    .warning-header {
      background: #fff3e0;
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
      border-radius: 12px 12px 0 0;
      border-bottom: none;
    }
    .success-header {
      background: #e8f5e9;
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
      border-radius: 12px 12px 0 0;
      border-bottom: none;
    }
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #424242;
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
      height: 56px;
      font-size: 15px;
      background: #f5f5f5;
      color: #424242;
    }
    .action-btn.primary {
      background: linear-gradient(135deg, #d32f2f 0%, #c2185b 100%);
      color: white;
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
      padding: 12px 16px;
      background-color: #fff8e1;
      border-radius: 8px;
    }
    .warning-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .product-name {
      font-size: 14px;
      font-weight: 600;
      color: #424242;
    }
    .stock-info {
      font-size: 12px;
      color: #757575;
    }
    .stock-info strong {
      color: #d32f2f;
    }
    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-chip.warning {
      background-color: #ffccbc;
      color: #d84315;
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
      background-color: #fafafa;
      border-radius: 8px;
    }
    .order-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .order-no {
      font-size: 14px;
      font-weight: 600;
      color: #424242;
    }
    .order-customer {
      font-size: 12px;
      color: #757575;
    }
    .order-time {
      font-size: 11px;
      color: #9e9e9e;
    }
    .order-amount {
      font-size: 16px;
      font-weight: 700;
      color: #d32f2f;
    }
    .empty-state {
      text-align: center;
      padding: 32px;
      color: #9e9e9e;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
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