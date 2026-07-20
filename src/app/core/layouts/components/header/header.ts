import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ChipModule } from 'primeng/chip';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, ChipModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  showToggle = input<boolean>(true);
  toggleSidebar = output<void>();

  mobileMenuOpen = false;
  userMenuOpen = false;

  get user() {
    return this.authService.currentUser();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get userInitial(): string {
    return this.user?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  logout() {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
