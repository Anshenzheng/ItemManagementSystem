import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterModule } from '@angular/router';
import { ProductService } from './core/services/product.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    RouterModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="'navigation'"
          [mode]="'side'"
          [opened]="true">
        <div class="sidenav-header">
          <h2 class="logo-text">进销存管理</h2>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon color="primary">dashboard</mat-icon>
            <span class="nav-text">首页</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon color="primary">inventory_2</mat-icon>
            <span class="nav-text">商品管理</span>
          </a>
          <a mat-list-item routerLink="/orders" routerLinkActive="active">
            <mat-icon color="primary">receipt_long</mat-icon>
            <span class="nav-text">销售开单</span>
          </a>
          <a mat-list-item routerLink="/inventory" routerLinkActive="active">
            <mat-icon color="primary">storage</mat-icon>
            <span class="nav-text">库存查询</span>
            <span *ngIf="(lowStockCount$ | async) || 0 > 0" class="low-stock-badge">
              <mat-icon [matBadge]="lowStockCount$ | async" matBadgeColor="warn">warning</mat-icon>
            </span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="top-toolbar">
          <span class="toolbar-title">{{ title }}</span>
          <span class="spacer"></span>
          <span class="date-text">{{ currentDate }}</span>
        </mat-toolbar>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 240px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
    }
    .sidenav-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .logo-text {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.5px;
    }
    .nav-text {
      margin-left: 12px;
      font-size: 14px;
      color: #475569;
    }
    mat-nav-list a {
      margin: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    mat-nav-list a:hover {
      background-color: #f1f5f9;
    }
    mat-nav-list a.active {
      background-color: #eef2ff;
      color: #4f46e5;
      font-weight: 500;
    }
    mat-nav-list a.active .nav-text {
      color: #4f46e5;
    }
    .top-toolbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .toolbar-title {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .date-text {
      font-size: 13px;
      color: #64748b;
    }
    .content {
      padding: 24px;
      background-color: #f8fafc;
      min-height: calc(100vh - 64px);
    }
    .low-stock-badge {
      margin-left: auto;
    }
  `]
})
export class AppComponent {
  title = '进销存管理系统';
  currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
  
  private productService = inject(ProductService);
  lowStockCount$: Observable<number>;
  
  constructor() {
    this.lowStockCount$ = this.productService.getLowStockProductsCount();
  }
}
