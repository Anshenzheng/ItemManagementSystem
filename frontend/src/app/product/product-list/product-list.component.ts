import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">商品管理</h1>
      <p class="page-subtitle">管理您的所有商品信息</p>
    </div>

    <div class="card-container">
      <div class="action-bar">
        <mat-form-field class="search-field" appearance="outline">
          <mat-label>搜索商品</mat-label>
          <input matInput (input)="onSearch($event)" placeholder="输入商品名称...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          新增商品
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
              <strong>{{ element.name }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="code">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>商品编码</th>
            <td mat-cell *matCellDef="let element">{{ element.code || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>分类</th>
            <td mat-cell *matCellDef="let element">{{ element.category || '-' }}</td>
          </ng-container>

          <ng-container matColumnDef="purchasePrice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>进货价</th>
            <td mat-cell *matCellDef="let element">¥{{ element.purchasePrice?.toFixed(2) || '0.00' }}</td>
          </ng-container>

          <ng-container matColumnDef="salePrice">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>销售价</th>
            <td mat-cell *matCellDef="let element">¥{{ element.salePrice?.toFixed(2) || '0.00' }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>库存</th>
            <td mat-cell *matCellDef="let element">
              <span [class.low-stock]="isLowStock(element)" [class.normal-stock]="!isLowStock(element)">
                {{ element.stock }}
                <span *ngIf="isLowStock(element)" class="low-stock-icon">⚠</span>
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="unit">
            <th mat-header-cell *matHeaderCellDef>单位</th>
            <td mat-cell *matCellDef="let element">{{ element.unit || '个' }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>操作</th>
            <td mat-cell *matCellDef="let element">
              <button mat-icon-button color="primary" (click)="openEditDialog(element)" matTooltip="编辑">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteProduct(element)" matTooltip="删除">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .low-stock {
      color: #d32f2f;
      font-weight: 600;
    }
    .normal-stock {
      color: #388e3c;
      font-weight: 500;
    }
    .low-stock-icon {
      margin-left: 4px;
    }
  `]
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'code', 'category', 'purchasePrice', 'salePrice', 'stock', 'unit', 'actions'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>();
  
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
        this.dataSource.data = products;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: () => {
        this.showMessage('加载商品列表失败', 'error');
      }
    });
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe({
      next: (searchTerm) => {
        if (searchTerm) {
          this.productService.searchProducts(searchTerm).subscribe({
            next: (products) => {
              this.dataSource.data = products;
            }
          });
        } else {
          this.loadProducts();
        }
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  isLowStock(product: Product): boolean {
    return product.stock <= product.minStock;
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: () => {
            this.loadProducts();
            this.showMessage('商品添加成功', 'success');
          },
          error: () => {
            this.showMessage('商品添加失败', 'error');
          }
        });
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { mode: 'edit', product }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productService.updateProduct(product.id, result).subscribe({
          next: () => {
            this.loadProducts();
            this.showMessage('商品更新成功', 'success');
          },
          error: () => {
            this.showMessage('商品更新失败', 'error');
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`确定要删除商品「${product.name}」吗？`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
          this.showMessage('商品删除成功', 'success');
        },
        error: () => {
          this.showMessage('商品删除失败', 'error');
        }
      });
    }
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>{{ mode === 'add' ? '新增商品' : '编辑商品' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm" class="form-container">
        <mat-form-field appearance="outline">
          <mat-label>商品名称 *</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="productForm.get('name')?.invalid">请输入商品名称</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>商品编码</mat-label>
            <input matInput formControlName="code">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>分类</mat-label>
            <input matInput formControlName="category">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>单位</mat-label>
            <input matInput formControlName="unit" placeholder="个、件、箱...">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>最低库存预警</mat-label>
            <input matInput type="number" formControlName="minStock">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>进货价</mat-label>
            <input matInput type="number" formControlName="purchasePrice" step="0.01">
            <span matTextPrefix>¥&nbsp;</span>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>销售价</mat-label>
            <input matInput type="number" formControlName="salePrice" step="0.01">
            <span matTextPrefix>¥&nbsp;</span>
          </mat-form-field>
        </div>

        <div class="form-row" *ngIf="mode === 'add'">
          <mat-form-field appearance="outline">
            <mat-label>初始库存</mat-label>
            <input matInput type="number" formControlName="stock">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>商品描述</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>取消</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="productForm.invalid">
        {{ mode === 'add' ? '添加' : '保存' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-container {
      margin-top: 20px;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 8px;
    }
  `]
})
export class ProductDialogComponent {
  productForm: FormGroup;
  mode: 'add' | 'edit';
  
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialog);
  private data = inject<any>();

  constructor() {
    this.mode = this.data?.mode || 'add';
    
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      code: [''],
      category: [''],
      unit: ['个'],
      purchasePrice: [0],
      salePrice: [0],
      stock: [0],
      minStock: [10],
      description: ['']
    });

    if (this.data?.product) {
      this.productForm.patchValue(this.data.product);
    }
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }
}