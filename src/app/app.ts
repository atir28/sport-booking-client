import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { Header } from './core/layouts/components/header/header';
import { SideBar } from './core/layouts/components/side-bar/side-bar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Header, SideBar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private authService = inject(AuthService);

  protected readonly isSidebarVisible = signal(false);
  protected readonly isAuthPage = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const e = event as NavigationEnd;
        this.isAuthPage.set(e.urlAfterRedirects.startsWith('/auth'));
        this.isSidebarVisible.set(false);
      });
  }

  get showHeader(): boolean {
    return !this.isAuthPage();
  }

  get showSidebar(): boolean {
    return this.isSidebarVisible() && this.authService.isVenueOwnerOrAdmin;
  }

  get showToggle(): boolean {
    return this.authService.isVenueOwnerOrAdmin;
  }
}
