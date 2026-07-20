import { Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.ProfileComponent),
  },
  {
    path: 'dashboard',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
];
