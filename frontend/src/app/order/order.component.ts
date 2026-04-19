import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Product } from '../../core/models/product.model';
import { CreateOrderRequest, OrderItemRequest } from '../../core/models/order.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="page-header">
      <h1 class="page-title">销售开单</h1>
      <p class="page-subtitle">创建新的销售订单</p>
    </div>

    <div class="card-container">
      <form [formGroup]="orderForm" class="form-container">
        <h3 class="section-title">客户信息</h3>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>客户姓名</mat-label>
            <input matInput formControlName="customerName" placeholder="可选">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>联系电话</mat-label>
            <input matInput formControlName="customerPhone" placeholder="可选">
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>备注</mat-label>
          <textarea matInput formControlName="remark" rows="2" placeholder="订单备注..."></textarea>
        </mat-form-field>

        <h3 class="section-title">商品明细</h3>
        
        <div class="add-item-row">
          <mat-form-field appearance="outline" class="product-select">
            <mat-label>选择商品</mat-label>
            <mat-select [formControl]="productSelect" (selectionChange)="onProductSelect($event)">
              <mat-option>-- 请选择商品 --</mat-option>
              <mat-option *ngFor="let product of availableProducts" [value]="product">
                {{ product.name }} (库存: {{ product.stock }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="quantity-input">
            <mat-label>数量</mat-label>
            <input matInput type="number" [formControl]="quantityControl" min="1">
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="addItem()" [disabled]="!canAddItem">
            <mat-icon>add</mat-icon>
            添加
          </button>
        </div>

        <div class="table-container" *ngIf="itemsFormArray.length > 0">
          <table mat-table [dataSource]="itemsDataSource">
            
            <ng-container matColumnDef="productName">
              <th mat-header-cell *matHeaderCellDef>商品名称</th>
              <td mat-cell *matCellDef="let element; let i = index">
                {{ getProductName(element.value.productId) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>单价</th>
              <td mat-cell *matCellDef="let element; let i = index">
                <mat-form-field appearance="fill" class="inline-field">
                  <input matInput type="number" [formControl]="getPriceControl(i)" step="0.01" min="0">
                  <span matTextPrefix>¥&nbsp;</span>
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>数量</th>
              <td mat-cell *matCellDef="let element; let i = index">
                <mat-form-field appearance="fill" class="inline-field">
                  <input matInput type="number" [formControl]="getQuantityControl(i)" min="1">
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>小计</th>
              <td mat-cell *matCellDef="let element; let i = index">
                <strong class="amount-text">¥{{ calculateItemAmount(i) }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>操作</th>
              <td mat-cell *matCellDef="let element; let i = index">
                <button mat-icon-button color="warn" (click)="removeItem(i)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
          </table>
        </div>

        <div class="empty-state" *ngIf="itemsFormArray.length === 0">
          <mat-icon color="primary">shopping_cart</mat-icon>
          <p>请从上方选择商品添加到订单</p>
        </div>

        <mat-divider></mat-divider>

        <div class="summary-section">
          <div class="summary-row">
            <span class="summary-label">商品数量：</span>
            <span class="summary-value">{{ totalItems }} 件</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">订单金额：</span>
            <span class="summary-value total-amount">¥{{ totalAmount }}</span>
          </div>
        </div>

        <div class="action-row">
          <button mat-button (click)="resetForm()">
            <mat-icon>refresh</mat-icon>
            重置
          </button>
          <button mat-raised-button color="primary" (click)="submitOrder()" [disabled]="!canSubmit">
            <mat-icon>check</mat-icon>
            确认开单
          </button>
        </div>
      </form>
    </div>

    <div class="card-container" *ngIf="recentOrders.length > 0">
      <h3 class="section-title">最近订单</h3>
      <div class="table-container">
        <table mat-table [dataSource]="recentOrdersDataSource">
          
          <ng-container matColumnDef="orderNo">
            <th mat-header-cell *matHeaderCellDef>订单号</th>
            <td mat-cell *matCellDef="let element">{{ element.orderNo }}</td>
          </ng-container>

          <ng-container matColumnDef="customerName">
            <th mat-header-cell *matHeaderCellDef>客户</th>
            <td mat-cell *matCellDef="let element">{{ element.customerName || '散客' }}</td>
          </ng-container>

          <ng-container matColumnDef="totalAmount">
            <th mat-header-cell *matHeaderCellDef>金额</th>
            <td mat-cell *matCellDef="let element">
              <strong>¥{{ element.totalAmount?.toFixed(2) }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="createTime">
            <th mat-header-cell *matHeaderCellDef>下单时间</th>
            <td mat-cell *matCellDef="let element">{{ formatDateTime(element.createTime) }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="orderColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: orderColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #424242;
      margin: 24px 0 16px 0;
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
    }
    .add-item-row {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 16px;
    }
    .product-select {
      flex: 2;
    }
    .quantity-input {
      flex: 1;
    }
    .inline-field {
      width: 120px;
    }
    .inline-field .mat-form-field-wrapper {
      padding-bottom: 0;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      color: #757575;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .summary-section {
      margin: 24px 0;
      padding: 20px;
      background-color: #fafafa;
      border-radius: 8px;
    }
    .summary-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 12px;
    }
    .summary-label {
      font-size: 14px;
      color: #757575;
    }
    .summary-value {
      font-size: 16px;
      font-weight: 500;
      margin-left: 8px;
      min-width: 120px;
      text-align: right;
    }
    .total-amount {
      font-size: 24px;
      font-weight: 700;
      color: #d32f2f;
    }
    .amount-text {
      color: #d32f2f;
      font-size: 15px;
    }
    .action-row {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
    }
  `]
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  itemsDataSource = new MatTableDataSource<any>();
  recentOrdersDataSource = new MatTableDataSource<any>();
  
  itemColumns = ['productName', 'price', 'quantity', 'amount', 'actions'];
  orderColumns = ['orderNo', 'customerName', 'totalAmount', 'createTime'];
  
  allProducts: Product[] = [];
  availableProducts: Product[] = [];
  selectedProduct: Product | null = null;
  recentOrders: any[] = [];
  
  productSelect = this.fb.control(null);
  quantityControl = this.fb.control(1);
  
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private orderService = inject(OrderService);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.orderForm = this.fb.group({
      customerName: [''],
      customerPhone: [''],
      remark: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadRecentOrders();
  }

  get itemsFormArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get canAddItem(): boolean {
    return this.selectedProduct !== null && this.quantityControl.valid && this.quantityControl.value > 0;
  }

  get canSubmit(): boolean {
    return this.itemsFormArray.length > 0;
  }

  get totalItems(): number {
    let count = 0;
    this.itemsFormArray.controls.forEach((ctrl) => {
      count += ctrl.get('quantity')?.value || 0;
    });
    return count;
  }

  get totalAmount(): string {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.calculateItemAmount(i);
    }
    return total.toFixed(2);
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.allProducts = products.filter(p => p.stock > 0);
        this.availableProducts = [...this.allProducts];
      }
    });
  }

  loadRecentOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders.slice(0, 10);
        this.recentOrdersDataSource.data = this.recentOrders;
      }
    });
  }

  onProductSelect(event: MatSelectChange): void {
    this.selectedProduct = event.value;
  }

  addItem(): void {
    if (!this.selectedProduct || !this.quantityControl.value) return;
    
    const productId = this.selectedProduct.id;
    const quantity = this.quantityControl.value;
    const price = this.selectedProduct.salePrice || 0;
    
    const existingIndex = this.itemsFormArray.controls.findIndex(
      (ctrl) => ctrl.get('productId')?.value === productId
    );
    
    if (existingIndex >= 0) {
      const existingQty = this.itemsFormArray.at(existingIndex).get('quantity')?.value || 0;
      const newQty = existingQty + quantity;
      this.itemsFormArray.at(existingIndex).get('quantity')?.setValue(newQty);
    } else {
      this.itemsFormArray.push(this.fb.group({
        productId: [productId, Validators.required],
        quantity: [quantity, [Validators.required, Validators.min(1)]],
        price: [price, [Validators.required, Validators.min(0)]]
      }));
    }
    
    this.itemsDataSource.data = [...this.itemsFormArray.controls];
    this.productSelect.reset();
    this.quantityControl.setValue(1);
    this.selectedProduct = null;
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
    this.itemsDataSource.data = [...this.itemsFormArray.controls];
  }

  getProductName(productId: number): string {
    const product = this.allProducts.find(p => p.id === productId);
    return product?.name || '';
  }

  getPriceControl(index: number) {
    return this.itemsFormArray.at(index).get('price')!;
  }

  getQuantityControl(index: number) {
    return this.itemsFormArray.at(index).get('quantity')!;
  }

  calculateItemAmount(index: number): number {
    const control = this.itemsFormArray.at(index);
    const price = control.get('price')?.value || 0;
    const quantity = control.get('quantity')?.value || 0;
    return price * quantity;
  }

  submitOrder(): void {
    if (this.itemsFormArray.length === 0) return;
    
    const orderData: CreateOrderRequest = {
      customerName: this.orderForm.get('customerName')?.value || '',
      customerPhone: this.orderForm.get('customerPhone')?.value || '',
      remark: this.orderForm.get('remark')?.value || '',
      items: this.itemsFormArray.value as OrderItemRequest[]
    };
    
    this.orderService.createOrder(orderData).subscribe({
      next: () => {
        this.showMessage('订单创建成功！', 'success');
        this.resetForm();
        this.loadProducts();
        this.loadRecentOrders();
      },
      error: (err) => {
        this.showMessage(err.message || '订单创建失败', 'error');
      }
    });
  }

  resetForm(): void {
    this.orderForm.reset();
    this.itemsFormArray.clear();
    this.itemsDataSource.data = [];
    this.productSelect.reset();
    this.quantityControl.setValue(1);
    this.selectedProduct = null;
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

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}