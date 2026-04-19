import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    MatChipModule,
    MatBadgeModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">库存查询</h1>
      <p class="page-subtitle">查看和管理商品库存状态</p>
    </div>

    <div class="stats-grid" *ngIf="lowStockProducts.length > 0">
      <div class="stat-card warning-card">
        <mat-icon color="warn">warning</mat-icon>
        <div class="stat-content">
          <div class="stat-number">{{ lowStockProducts.length }}</div>
          <div class="stat-label">库存预警商品</div>
        </div>
      </div>
    </div>

    <div class="card-container">
      <div class="action-bar">
        <mat-form-field class="search-field" appearance="outline">
          <mat-label>搜索商品</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="输入商品名称或编码...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-raised-button (click)="toggleLowStockOnly()">
          <mat-icon *ngIf="!showLowStockOnly">filter_alt</mat-icon>
          <mat-icon *ngIf="showLowStockOnly">filter_list_off</mat-icon>
          {{ showLowStockOnly ? '显示全部' : '仅显示库存不足' }}
        </button>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="dataSource" matSort>
          
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let element">{{ element.id }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>商品名称</th>
            <td mat-cell *matCellDef="let element">
              <div class="product-info">
                <strong>{{ element.name }}</strong>
                <span class="product-code" *ngIf="element.code">{{ element.code }}</span>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>分类</th>
            <td mat-cell *matCellDef="let element">{{ element.category || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>当前库存</th>
            <td mat-cell *matCellDef="let element">
              <div class="stock-status" [class.low-stock]="isLowStock(element)">
                <span class="stock-number">{{ element.stock }}</span>
                <span class="stock-unit">{{ element.unit || '个' }}</span>
                <mat-icon *ngIf="isLowStock(element)" color="warn" class="warning-icon">warning</mat-icon>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="minStock">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>预警线</th>
            <td mat-cell *matCellDef="let element">{{ element.minStock }} {{ element.unit || '个' }}</td>
          </ng-container>

          <ng-container matColumnDef="stockStatus">
            <th mat-header-cell *matHeaderCellDef>库存状态</th>
            <td mat-cell *matCellDef="let element">
              <span class="status-chip" [class.status-warning]="isLowStock(element)" [class.status-normal]="!isLowStock(element)">
                <mat-icon *ngIf="isLowStock(element)">warning</mat-icon>
                <mat-icon *ngIf="!isLowStock(element)">check_circle</mat-icon>
                {{ isLowStock(element) ? '库存不足' : '库存充足' }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="salePrice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>售价</th>
            <td mat-cell *matCellDef="let element">¥{{ element.salePrice?.toFixed(2) || '0.00' }}</td>
          </ng-container>

          <ng-container matColumnDef="stockValue">
            <th mat-header-cell *matHeaderCellDef>库存价值</th>
            <td mat-cell *matCellDef="let element">
              <strong>¥{{ (element.stock * element.salePrice)?.toFixed(2) || '0.00' }}</strong>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 20, 50, 100]" showFirstLastButtons></mat-paginator>
      </div>
    </div>

    <div class="card-container" *ngIf="lowStockProducts.length > 0">
      <h3 class="section-title">
        <mat-icon color="warn">warning</mat-icon>
        库存预警清单
      </h3>
      <div class="warning-list">
        <div class="warning-item" *ngFor="let product of lowStockProducts">
          <div class="warning-item-info">
            <div class="warning-item-name">{{ product.name }}</div>
            <div class="warning-item-meta">
              <span>当前库存：<strong>{{ product.stock }}</strong> {{ product.unit || '个' }}</span>
              <span>预警线：{{ product.minStock }} {{ product.unit || '个' }}</span>
            </div>
          </div>
          <div class="warning-item-action">
            <button mat-raised-button color="primary" (click)="openStockAdjustDialog(product)">
              <mat-icon>add</mat-icon>
              补货
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .warning-card {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }
    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-number {
      font-size: 36px;
      font-weight: 700;
      color: #d32f2f;
    }
    .stat-label {
      font-size: 14px;
      color: #757575;
      margin-top: 4px;
    }
    .product-info {
      display: flex;
      flex-direction: column;
    }
    .product-code {
      font-size: 12px;
      color: #9e9e9e;
    }
    .stock-status {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .stock-number {
      font-size: 16px;
      font-weight: 600;
    }
    .stock-unit {
      font-size: 12px;
      color: #757575;
    }
    .low-stock .stock-number {
      color: #d32f2f;
    }
    .warning-icon {
      margin-left: 8px;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
    }
    .status-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .status-warning {
      background-color: #fff3e0;
      color: #ef6c00;
    }
    .status-normal {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #424242;
      margin: 0 0 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
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
      padding: 16px;
      background-color: #fff8e1;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }
    .warning-item-name {
      font-size: 15px;
      font-weight: 600;
      color: #424242;
    }
    .warning-item-meta {
      display: flex;
      gap: 24px;
      margin-top: 4px;
      font-size: 13px;
      color: #757575;
    }
    .warning-item-meta strong {
      color: #d32f2f;
    }
  `]
})
export class InventoryComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'category', 'stock', 'minStock', 'stockStatus', 'salePrice', 'stockValue'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>();
  allProducts: Product[] = [];
  lowStockProducts: Product[] = [];
  showLowStockOnly = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadProducts();
    this.setupSearch();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.lowStockProducts = products.filter(p => this.isLowStock(p));
        this.filterProducts();
      },
      error: () => {
        this.showMessage('加载库存数据失败', 'error');
      }
    });
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe({
      next: (searchTerm) => {
        this.filterProducts(searchTerm);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  filterProducts(searchTerm?: string): void {
    let filtered = [...this.allProducts];
    
    if (this.showLowStockOnly) {
      filtered = filtered.filter(p => this.isLowStock(p));
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.code && p.code.toLowerCase().includes(term))
      );
    }
    
    this.dataSource.data = filtered;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleLowStockOnly(): void {
    this.showLowStockOnly = !this.showLowStockOnly;
    this.filterProducts();
  }

  isLowStock(product: Product): boolean {
    return product.stock <= product.minStock;
  }

  openStockAdjustDialog(product: Product): void {
    const dialogRef = this.dialog.open(StockAdjustDialogComponent, {
      width: '400px',
      data: { product }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.adjustment > 0) {
        this.productService.updateStock(product.id, result.adjustment).subscribe({
          next: () => {
            this.loadProducts();
            this.showMessage(`成功补货 ${result.adjustment} ${product.unit || '个'}`, 'success');
          },
          error: () => {
            this.showMessage('补货操作失败', 'error');
          }
        });
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}

@Component({
  selector: 'app-stock-adjust-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    CommonModule
  ],
  template: `
    <h2 mat-dialog-title>库存调整 - 补货</h2>
    <mat-dialog-content>
      <div class="product-info">
        <p><strong>商品：</strong>{{ product.name }}</p>
        <p><strong>当前库存：</strong>{{ product.stock }} {{ product.unit || '个' }}</p>
        <p><strong>预警线：</strong>{{ product.minStock }} {{ product.unit || '个' }}</p>
      </div>
      
      <mat-form-field appearance="outline">
        <mat-label>补货数量</mat-label>
        <input matInput type="number" [(ngModel)]="adjustment" min="1" required>
      </mat-form-field>
      
      <p class="preview">调整后库存：<strong>{{ (product.stock + adjustment) }}</strong> {{ product.unit || '个' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>取消</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="adjustment < 1">
        确认补货
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-info {
      margin-bottom: 20px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    .product-info p {
      margin: 8px 0;
      font-size: 14px;
    }
    mat-form-field {
      width: 100%;
    }
    .preview {
      margin-top: 16px;
      padding: 12px;
      background-color: #e8f5e9;
      border-radius: 8px;
      text-align: center;
    }
    .preview strong {
      color: #388e3c;
      font-size: 18px;
    }
  `]
})
export class StockAdjustDialogComponent {
  product: Product;
  adjustment = 1;
  
  private dialogRef = inject(MatDialog);
  private data = inject<any>();

  constructor() {
    this.product = this.data.product;
  }

  onConfirm(): void {
    if (this.adjustment > 0) {
      this.dialogRef.close({ adjustment: this.adjustment });
    }
  }
}