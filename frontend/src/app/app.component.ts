import { Component, inject } from '@angular/core';
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
        <mat-toolbar color="primary">
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
      background: linear-gradient(180deg, #fefefe 0%, #f5f5f5 100%);
      border-right: 1px solid #e0e0e0;
    }
    .sidenav-header {
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .logo-text {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      color: #d32f2f;
      letter-spacing: 1px;
    }
    .nav-text {
      margin-left: 12px;
      font-size: 15px;
    }
    mat-nav-list a {
      margin: 8px 12px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    mat-nav-list a:hover {
      background-color: rgba(211, 47, 47, 0.08);
    }
    mat-nav-list a.active {
      background-color: rgba(211, 47, 47, 0.15);
      color: #d32f2f;
      font-weight: 500;
    }
    .toolbar-title {
      font-size: 18px;
      font-weight: 500;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .date-text {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 24px;
      background-color: #fafafa;
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