import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { CustomerDashboardComponent } from './features/customer/pages/customer-dashboard/customer-dashboard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'user',
    loadChildren: () =>
      import('./features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./features/search/search.routes').then((m) => m.SEARCH_ROUTES),
  },
];
