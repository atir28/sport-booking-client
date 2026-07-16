import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isVenueOwner = false;
  showPassword = false;
  showConfirmPassword = false;

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreedToTerms: [false, [Validators.requiredTrue]],
  }, { validators: this.passwordMatchValidator });

  venueForm: FormGroup = this.fb.group({
    // Account
    ownerName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{7,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreedToTerms: [false, [Validators.requiredTrue]],
    // Venue
    venueName: ['', [Validators.required, Validators.minLength(3)]],
    venueType: [[] as string[], [Validators.required, this.atLeastOneSelected]],
    // Location
    state: ['', [Validators.required]],
    district: ['', [Validators.required]],
    street: ['', [Validators.required]],
    mapLocation: ['', [Validators.required]],
    // Courts (dynamic based on venue type)
    futsalCourts: [0],
    badmintonCourts: [0],
    cricketCourts: [0],
    // Details
    description: ['', [Validators.required, Validators.minLength(10)]],
  }, { validators: [this.passwordMatchValidator, this.courtCountValidator] });

  stateOptions = [
    { label: 'Bagmati', value: 'Bagmati' },
    { label: 'Koshi', value: 'Koshi' },
    { label: 'Madhesh', value: 'Madhesh' },
    { label: 'Gandaki', value: 'Gandaki' },
    { label: 'Lumbini', value: 'Lumbini' },
    { label: 'Karnali', value: 'Karnali' },
    { label: 'Sudurpashchim', value: 'Sudurpashchim' },
  ];

  districtOptions: Record<string, string[]> = {
    Bagmati: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Kavrepalanchok', 'Sindhupalchok'],
    Koshi: ['Ilam', 'Jhapa', 'Morang', 'Sunsari', 'Panchthar', 'Taplejung'],
    Madhesh: ['Dhanusha', 'Mahottari', 'Sarlahi', 'Siraha', 'Bara', 'Parsa'],
    Gandaki: ['Pokhara', 'Kaski', 'Gorkha', 'Tanahu', 'Lamjung', 'Manang'],
    Lumbini: ['Kapilvastu', 'Rupandehi', 'Nawalparasi', 'Parasi', 'Argakhachi', 'Palpa'],
    Karnali: ['Surkhet', 'Jumla', 'Dolpa', 'Humla', 'Mugu', 'Kalikot'],
    Sudurpashchim: ['Dhangadhi', 'Kanchanpur', 'Kailali', 'Doti', 'Achham', 'Bajhang'],
  };

  get districts(): string[] {
    const state = this.venueForm.get('state')?.value;
    return state ? this.districtOptions[state] || [] : [];
  }

  venueTypeOptions = [
    { label: 'Futsal', value: 'Futsal' },
    { label: 'Badminton', value: 'Badminton' },
    { label: 'Cricket', value: 'Cricket' },
    { label: 'All', value: 'All' },
  ];

  amenityOptions = [
    { label: 'Parking', icon: 'pi pi-car', key: 'parking' },
    { label: 'Shower', icon: 'pi pi-filter', key: 'shower' },
    { label: 'Cafeteria', icon: 'pi pi-shopping-cart', key: 'cafeteria' },
    { label: 'WiFi', icon: 'pi pi-wifi', key: 'wifi' },
    { label: 'Changing Room', icon: 'pi pi-user', key: 'changingRoom' },
    { label: 'Spectator Area', icon: 'pi pi-users', key: 'spectatorArea' },
  ];

  amenitiesForm: FormGroup = this.fb.group({
    parking: [false],
    shower: [false],
    cafeteria: [false],
    wifi: [false],
    changingRoom: [false],
    spectatorArea: [false],
  });

  get activeForm(): FormGroup {
    return this.isVenueOwner ? this.venueForm : this.userForm;
  }

  get f() {
    return this.activeForm.controls;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'venue-owner') {
        this.isVenueOwner = true;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  atLeastOneSelected(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value || value.length === 0) {
      return { atLeastOne: true };
    }
    return null;
  }

  courtCountValidator(control: AbstractControl): ValidationErrors | null {
    const venueType: string[] = control.get('venueType')?.value || [];
    const hasAll = venueType.includes('All');
    const hasFutsal = hasAll || venueType.includes('Futsal');
    const hasBadminton = hasAll || venueType.includes('Badminton');
    const hasCricket = hasAll || venueType.includes('Cricket');

    const futsal = control.get('futsalCourts')?.value || 0;
    const badminton = control.get('badmintonCourts')?.value || 0;
    const cricket = control.get('cricketCourts')?.value || 0;

    const errors: string[] = [];
    if (hasFutsal && futsal < 1) errors.push('futsalCourts');
    if (hasBadminton && badminton < 1) errors.push('badmintonCourts');
    if (hasCricket && cricket < 1) errors.push('cricketCourts');

    if (errors.length > 0) {
      return { courtCountRequired: errors };
    }
    return null;
  }

  showCourtField(sport: string): boolean {
    const venueType: string[] = this.venueForm.get('venueType')?.value || [];
    return venueType.includes('All') || venueType.includes(sport);
  }

  onRegister() {
    const form = this.activeForm;
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    const { ownerName, email, phone, password } = form.value;
    const role = this.isVenueOwner ? 'venue-owner' : 'normal';
    this.authService.register(ownerName || form.value.name, email, phone, password, role);
    this.router.navigate(['/']);
  }

  toggleVenueType(type: string) {
    const control = this.venueForm.get('venueType')!;
    const current: string[] = control.value || [];

    if (type === 'All') {
      control.setValue(current.includes('All') ? [] : ['All']);
      control.markAsTouched();
      return;
    }

    const filtered = current.filter(t => t !== 'All');
    const index = filtered.indexOf(type);
    if (index > -1) {
      filtered.splice(index, 1);
    } else {
      filtered.push(type);
    }
    control.setValue([...filtered]);
    control.markAsTouched();
  }

  isVenueTypeSelected(type: string): boolean {
    const value = this.venueForm.get('venueType')?.value || [];
    return value.includes(type);
  }

  toggleAmenity(key: string) {
    const control = this.amenitiesForm.get(key)!;
    control.setValue(!control.value);
  }

  isAmenitySelected(key: string): boolean {
    return this.amenitiesForm.get(key)?.value || false;
  }

  onStateChange() {
    this.venueForm.get('district')?.setValue('');
  }

  hasError(field: string, error: string): boolean {
    const control = this.activeForm.get(field);
    return !!(control && control.touched && control.errors?.[error]);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.activeForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  hasCourtError(sport: string): boolean {
    if (!this.activeForm.touched) return false;
    const errors = this.activeForm.errors?.['courtCountRequired'];
    return errors?.includes(sport + 'Courts');
  }
}
