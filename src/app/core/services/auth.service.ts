import { Injectable, signal } from '@angular/core';

export type UserRole = 'normal' | 'venue-owner' | 'super-admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  get isVenueOwnerOrAdmin(): boolean {
    const user = this.currentUser();
    return user?.role === 'venue-owner' || user?.role === 'super-admin';
  }

  get isNormalUser(): boolean {
    const user = this.currentUser();
    return user !== null && user.role === 'normal';
  }

  login(email: string, password: string, role: UserRole = 'normal'): void {
    this.currentUser.set({
      id: 'U001',
      name: email.split('@')[0],
      email,
      role,
    });
  }

  register(name: string, email: string, phone: string, password: string, role: UserRole = 'normal'): void {
    this.currentUser.set({
      id: 'U001',
      name,
      email,
      role,
    });
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
