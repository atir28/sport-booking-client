import { Component, inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService, User } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  user: User | null = null;
  isEditing = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  activeTab: 'profile' | 'password' = 'profile';

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit() {
    this.user = this.authService.currentUser();
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.initForms();
  }

  private initForms() {
    this.profileForm = this.fb.group({
      name: [this.user!.name, [Validators.required, Validators.minLength(2)]],
      email: [this.user!.email, [Validators.required, Validators.email]],
      phone: [this.user!.phone, [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  get userInitial(): string {
    return this.user?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  get roleLabel(): string {
    switch (this.user?.role) {
      case 'venue-owner': return 'Venue Owner';
      case 'super-admin': return 'Admin';
      default: return 'Member';
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue({
        name: this.user!.name,
        email: this.user!.email,
        phone: this.user!.phone,
      });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const { name, email, phone } = this.profileForm.value;
    this.authService.updateProfile({ name, email, phone });
    this.user = this.authService.currentUser();
    this.isEditing = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Profile Updated',
      detail: 'Your profile has been updated successfully.',
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordForm.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return;
    }
    this.authService.changePassword(currentPassword, newPassword);
    this.passwordForm.reset();
    this.messageService.add({
      severity: 'success',
      summary: 'Password Changed',
      detail: 'Your password has been updated successfully.',
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid File',
        detail: 'Please select an image file.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.messageService.add({
        severity: 'warn',
        summary: 'File Too Large',
        detail: 'Image must be under 2MB.',
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result as string;
      this.authService.updateProfile({ avatar });
      this.user = this.authService.currentUser();
      this.messageService.add({
        severity: 'success',
        summary: 'Photo Updated',
        detail: 'Your profile picture has been updated.',
      });
    };
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.authService.updateProfile({ avatar: undefined });
    this.user = this.authService.currentUser();
    this.messageService.add({
      severity: 'info',
      summary: 'Photo Removed',
      detail: 'Your profile picture has been removed.',
    });
  }

  hasError(form: FormGroup, field: string, error: string): boolean {
    const control = form.get(field);
    return !!(control && control.touched && control.errors?.[error]);
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
