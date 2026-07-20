import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { VenueSearchService } from '../../../search/services/venue-search.service';
import { Venue, TimeSlot } from '../../../search/models/venue.model';
import { AuthService } from '../../../../core/services/auth.service';
import { SearchStore } from '../../../customer/store/search.store';

@Component({
  selector: 'app-venue-details',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TooltipModule,
    ToastModule,
    DatePickerModule,
    RadioButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './venue-details.html',
  styleUrl: './venue-details.scss',
})
export class VenueDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private venueService = inject(VenueSearchService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private searchStore = inject(SearchStore);
  private cdr = inject(ChangeDetectorRef);

  venue: Venue | null = null;
  minDate: Date = new Date();

  // Step tracking
  currentStep = 1;
  totalSteps = 3;

  // Step 1: Booking type
  bookingType: 'specific' | 'recurring' = 'specific';

  // Step 2 (specific): Date & time
  selectedDate: Date | null = null;
  selectedSlots: string[] = [];

  // Step 2 (recurring)
  recurStartDate: Date | null = null;
  recurEndDate: Date | null = null;
  repeatOption: 'weekly' | 'monthly' = 'weekly';
  recurOccurrences: Date[] = [];
  disabledEndDate: Date[] = [];

  // Per-day slot data: { 'Mon': TimeSlot[], 'Tue': TimeSlot[], ... }
  daySlots: { [day: string]: TimeSlot[] } = {};
  // Per-day selected slots: { 'Mon': ['06:00-07:00', '07:00-08:00'], 'Tue': [], ... }
  daySelectedSlots: { [day: string]: string[] } = {};

  // Step 3
  bookingConfirmed = false;

  // Specific date slots
  allSlots: TimeSlot[] = [];
  displayedSlots: TimeSlot[] = [];


  amenities: string[] = [
    'Changing Rooms',
    'Showers',
    'Parking',
    'Cafeteria',
    'First Aid',
    'Water Dispenser',
    'Lockers',
    'Air Conditioning',
    'Wi-Fi',
    'Seating Area',
    'Scoreboard',
    'Floodlights',
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.venue = this.venueService.getVenueById(id) || null;
    }

    const storeDate = this.searchStore.date();
    if (storeDate) {
      this.selectedDate = storeDate;
      this.onSpecificDateSelect();
    }

    this.cdr.detectChanges();
  }

  // --- Step navigation ---

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get hasDateRange(): boolean {
    return !!(this.recurStartDate && this.recurEndDate);
  }

  onStartDateChange() {
    if (!this.recurStartDate) return;

    this.recurEndDate = null;
    this.recurOccurrences = [];
    this.daySlots = {};
    this.daySelectedSlots = {};

    if (this.repeatOption === 'weekly') {
      this.setupWeeklyEndDateConstraints();
    } else {
      this.setupMonthlyEndDateConstraints();
    }

    this.recurEndDate = this.recurEndDateMin;
    if (this.recurEndDate) {
      this.generateOccurrences();
    }
  }

  onEndDateChange() {
    this.generateOccurrences();
  }

  onRepeatOptionChange() {
    this.recurOccurrences = [];
    this.daySlots = {};
    this.daySelectedSlots = {};
    this.recurEndDate = null;
    this.disabledEndDate = [];
    this.recurEndDateMin = null;
    this.recurEndDateMax = null;
    if (this.recurStartDate) {
      if (this.repeatOption === 'weekly') {
        this.setupWeeklyEndDateConstraints();
      } else {
        this.setupMonthlyEndDateConstraints();
      }
      this.recurEndDate = this.recurEndDateMin;
      if (this.recurEndDate) {
        this.generateOccurrences();
      }
    }
  }

  private generateDisabledEndDates() {
    if (!this.recurStartDate) {
      this.disabledEndDate = [];
      return;
    }

    const start = new Date(this.recurStartDate);
    start.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(start);
    rangeEnd.setFullYear(rangeEnd.getFullYear() + 1);

    // Collect valid interval dates as string keys
    const validKeys = new Set<string>();
    const current = new Date(start);
    while (current <= rangeEnd) {
      validKeys.add(this.dateKey(current));
      if (this.repeatOption === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    // Disable all dates NOT in the valid set - build a new array
    const disabled: Date[] = [];
    const d = new Date(start);
    while (d <= rangeEnd) {
      if (!validKeys.has(this.dateKey(d))) {
        disabled.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }

    this.disabledEndDate = disabled;
  }

  private dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  generateOccurrences() {
    this.recurOccurrences = [];
    this.daySlots = {};
    this.daySelectedSlots = {};
    if (!this.recurStartDate || !this.recurEndDate) return;

    const current = new Date(this.recurStartDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(this.recurEndDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      this.recurOccurrences.push(new Date(current));
      // Key by day-of-week name for weekly, or day-of-month for monthly
      const key = this.repeatOption === 'weekly'
        ? this.getDayOfWeekName(current)
        : `Day ${current.getDate()}`;
      if (!this.daySlots[key]) {
        this.daySlots[key] = this.generateSlots();
        this.daySelectedSlots[key] = [];
      }
      if (this.repeatOption === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    this.cdr.detectChanges();
  }

  get groupedDayKeys(): string[] {
    return Object.keys(this.daySlots);
  }

  getGroupOccurrences(dayKey: string): Date[] {
    if (this.repeatOption === 'weekly') {
      return this.recurOccurrences.filter(d => this.getDayOfWeekName(d) === dayKey);
    }
    return this.recurOccurrences.filter(d => `Day ${d.getDate()}` === dayKey);
  }

  private getDayOfWeekName(d: Date): string {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
  }

  get stepTitle(): string {
    switch (this.currentStep) {
      case 1:
        return 'Choose Booking Type';
      case 2:
        return this.bookingType === 'specific' ? 'Select Date & Time' : 'Set Recurring Schedule';
      case 3:
        return 'Review & Confirm';
      default:
        return '';
    }
  }

  canProceedStep1(): boolean {
    return !!this.bookingType;
  }

  canProceedStep2(): boolean {
    if (this.bookingType === 'specific') {
      return !!this.selectedDate && this.selectedSlots.length > 0;
    }
    if (this.bookingType === 'recurring') {
      if (!this.recurStartDate || !this.recurEndDate) return false;
      if (this.recurOccurrences.length === 0) return false;
      return this.groupedDayKeys.every(
        (d) => (this.daySelectedSlots[d] || []).length > 0,
      );
    }
    return false;
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // --- Step 1 ---

  selectBookingType(type: 'specific' | 'recurring') {
    this.bookingType = type;
  }

  // --- Step 2: Specific date ---

  onSpecificDateSelect() {
    this.selectedSlots = [];
    if (this.selectedDate) {
      this.loadSlotsForDate(this.selectedDate);
    }
  }

  loadSlotsForDate(date: Date) {
    this.allSlots = this.generateSlots();
    this.displayedSlots = [...this.allSlots];
    this.cdr.detectChanges();
  }

  selectSlot(slot: TimeSlot) {
    if (!slot.available) return;
    const key = this.slotKey(slot);
    const idx = this.selectedSlots.indexOf(key);
    if (idx > -1) {
      this.selectedSlots.splice(idx, 1);
    } else {
      this.selectedSlots.push(key);
    }
    this.cdr.detectChanges();
  }

  isSlotSelected(slot: TimeSlot): boolean {
    return this.selectedSlots.includes(this.slotKey(slot));
  }

  // --- Step 2: Recurring ---

  selectDaySlot(day: string, slot: TimeSlot) {
    if (!slot.available) return;
    const key = day;
    if (!this.daySelectedSlots[key]) {
      this.daySelectedSlots[key] = [];
    }
    const slotKey = this.slotKey(slot);
    const idx = this.daySelectedSlots[key].indexOf(slotKey);
    if (idx > -1) {
      this.daySelectedSlots[key].splice(idx, 1);
    } else {
      this.daySelectedSlots[key].push(slotKey);
    }
    this.cdr.detectChanges();
  }

  isDaySlotSelected(day: string, slot: TimeSlot): boolean {
    return (this.daySelectedSlots[day] || []).includes(this.slotKey(slot));
  }

  getDayAvailableCount(day: string): number {
    return (this.daySlots[day] || []).filter((s) => s.available).length;
  }

  // --- Helpers ---

  generateSlots(): TimeSlot[] {
    return [
      { startTime: '06:00', endTime: '07:00', available: true },
      { startTime: '07:00', endTime: '08:00', available: true },
      { startTime: '08:00', endTime: '09:00', available: true },
      { startTime: '09:00', endTime: '10:00', available: true },
      { startTime: '10:00', endTime: '11:00', available: false },
      { startTime: '11:00', endTime: '12:00', available: true },
      { startTime: '12:00', endTime: '13:00', available: true },
      { startTime: '13:00', endTime: '14:00', available: true },
      { startTime: '14:00', endTime: '15:00', available: false },
      { startTime: '15:00', endTime: '16:00', available: true },
      { startTime: '16:00', endTime: '17:00', available: true },
      { startTime: '17:00', endTime: '18:00', available: true },
      { startTime: '18:00', endTime: '19:00', available: true },
      { startTime: '19:00', endTime: '20:00', available: false },
      { startTime: '20:00', endTime: '21:00', available: true },
      { startTime: '21:00', endTime: '22:00', available: true },
      { startTime: '22:00', endTime: '23:00', available: true },
    ];
  }

  slotKey(slot: TimeSlot): string {
    return `${slot.startTime}-${slot.endTime}`;
  }

  formatTime(time: string): string {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${suffix}`;
  }

  formatSlotRange(slot: TimeSlot): string {
    return `${this.formatTime(slot.startTime)} - ${this.formatTime(slot.endTime)}`;
  }

  get availableCount(): number {
    return this.displayedSlots.filter((s) => s.available).length;
  }

  get formattedDate(): string {
    if (!this.selectedDate) return 'Select a date';
    return this.formatDate(this.selectedDate);
  }

  get formattedRecurStartDate(): string {
    if (!this.recurStartDate) return 'Select start date';
    return this.formatDate(this.recurStartDate);
  }

  get formattedRecurEndDate(): string {
    if (!this.recurEndDate) return 'Select end date';
    return this.formatDate(this.recurEndDate);
  }

  formatDate(d: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
  }

  get recurringSummary(): string {
    if (!this.recurStartDate || !this.recurEndDate) return '';
    const start = this.formatDate(this.recurStartDate);
    const end = this.formatDate(this.recurEndDate);
    const count = this.recurOccurrences.length;
    if (this.repeatOption === 'weekly') {
      return `${count} weekly occurrences from ${start} to ${end}`;
    }
    return `${count} monthly occurrences from ${start} to ${end}`;
  }

  // --- Book ---

  bookSlot() {
    if (!this.isLoggedIn) {
      this.messageService.add({
        severity: 'info',
        summary: 'Login Required',
        detail: 'Please login to book a slot.',
      });
      setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      return;
    }

    this.bookingConfirmed = true;
    this.messageService.add({
      severity: 'success',
      summary: 'Booking Confirmed',
      detail: `Your booking at ${this.venue?.name} has been confirmed.`,
    });
  }

  goBack() {
    if (this.currentStep > 1) {
      this.prevStep();
    } else {
      this.router.navigate(['/']);
    }
  }

  recurEndDateMin: Date | null = null;
  recurEndDateMax: Date | null = null;
  // Caps how far into the future selectable end dates go — adjust as needed
  private readonly MAX_WEEKLY_OCCURRENCES = 52; // ~1 year of weekly steps
  private readonly MAX_MONTHLY_OCCURRENCES = 24; // 2 years of monthly steps

  private setupWeeklyEndDateConstraints(): void {
    const start = this.startOfDay(this.recurStartDate!);

    this.recurEndDateMin = this.addDays(start, 7);
    this.recurEndDateMax = this.addDays(start, 7 * this.MAX_WEEKLY_OCCURRENCES);

    // Disable every day in the range EXCEPT exact 7-day multiples from start
    const disabled: Date[] = [];
    const totalDays = 7 * this.MAX_WEEKLY_OCCURRENCES;

    for (let offset = 1; offset <= totalDays; offset++) {
      if (offset % 7 !== 0) {
        disabled.push(this.addDays(start, offset));
      }
    }

    this.disabledEndDate = disabled;
  }

  private setupMonthlyEndDateConstraints(): void {
    const start = this.startOfDay(this.recurStartDate!);

    this.recurEndDateMin = this.addMonths(start, 1);
    this.recurEndDateMax = this.addMonths(start, this.MAX_MONTHLY_OCCURRENCES);

    const validDates = new Set<string>();
    for (let i = 1; i <= this.MAX_MONTHLY_OCCURRENCES; i++) {
      validDates.add(this.addMonths(start, i).toDateString());
    }

    const disabled: Date[] = [];
    const day = new Date(this.recurEndDateMin);
    while (day <= this.recurEndDateMax) {
      if (!validDates.has(day.toDateString())) {
        disabled.push(new Date(day));
      }
      day.setDate(day.getDate() + 1);
    }

    this.disabledEndDate = disabled;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private startOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private computeOccurrences(): Date[] {
    if (!this.recurStartDate || !this.recurEndDate) return [];

    const occurrences: Date[] = [];
    let current = new Date(this.recurStartDate);

    while (current <= this.recurEndDate) {
      occurrences.push(new Date(current));
      current =
        this.repeatOption === 'weekly' ? this.addDays(current, 7) : this.addMonths(current, 1);
    }

    return occurrences;
  }
}
