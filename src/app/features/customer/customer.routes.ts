import { Routes } from '@angular/router';
import { CustomerDashboardComponent } from './pages/customer-dashboard/customer-dashboard';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';

export const CUSTOMER_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: CustomerDashboardComponent },
  { path: 'bookings', component: MyBookingsComponent },
];
