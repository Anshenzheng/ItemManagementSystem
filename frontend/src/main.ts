import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { ProductListComponent } from './app/product/product-list/product-list.component';
import { OrderComponent } from './app/order/order.component';
import { InventoryComponent } from './app/inventory/inventory.component';
import { HomeComponent } from './app/home/home.component';

const routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'orders', component: OrderComponent },
  { path: 'inventory', component: InventoryComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      ReactiveFormsModule,
      RouterModule.forRoot(routes),
      MatToolbarModule,
      MatSidenavModule,
      MatListModule,
      MatIconModule,
      MatButtonModule,
      MatCardModule,
      MatTableModule,
      MatPaginatorModule,
      MatSortModule,
      MatInputModule,
      MatFormFieldModule,
      MatDialogModule,
      MatSelectModule,
      MatSnackBarModule,
      MatBadgeModule
    )
  ]
}).catch(err => console.error(err));