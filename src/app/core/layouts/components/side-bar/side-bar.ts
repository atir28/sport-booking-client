import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-side-bar',
  imports: [RouterLink],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss',
})
export class SideBar {
  private authService = inject(AuthService);

  get isSuperAdmin(): boolean {
    return this.authService.currentUser()?.role === 'super-admin';
  }

  get isVenueOwner(): boolean {
    return this.authService.currentUser()?.role === 'venue-owner';
  }

  venueOwnerMenu = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/user/dashboard' },
    { label: 'My Venues', icon: 'pi pi-building', route: '#' },
    { label: 'Bookings', icon: 'pi pi-calendar', route: '/user/bookings' },
    { label: 'Analytics', icon: 'pi pi-chart-bar', route: '#' },
    { label: 'Settings', icon: 'pi pi-cog', route: '#' },
  ];

  superAdminMenu = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/user/dashboard' },
    { label: 'All Venues', icon: 'pi pi-building', route: '#' },
    { label: 'All Users', icon: 'pi pi-users', route: '#' },
    { label: 'Bookings', icon: 'pi pi-calendar', route: '/user/bookings' },
    { label: 'Reports', icon: 'pi pi-chart-line', route: '#' },
    { label: 'Settings', icon: 'pi pi-cog', route: '#' },
  ];

  logout() {
    this.authService.logout();
  }
}
