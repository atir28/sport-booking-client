import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-booking-form-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    ButtonModule,
  ],
  templateUrl: './booking-form-dialog.html',
  styleUrl: './booking-form-dialog.scss',
})
export class BookingFormDialogComponent implements OnInit {
  mode: 'create' | 'edit' = 'create';
  booking: Booking | null = null;
  form!: FormGroup;
  minDate = new Date();

  venueOptions = [
    { label: 'Downtown Turf Arena', value: 'Downtown Turf Arena' },
    { label: 'Shuttle Zone Indoor', value: 'Shuttle Zone Indoor' },
    { label: 'Greenfield Cricket', value: 'Greenfield Cricket' },
    { label: 'Ace Tennis Courts', value: 'Ace Tennis Courts' },
    { label: 'Metro Sports Hub', value: 'Metro Sports Hub' },
  ];

  sportOptions = [
    { label: 'Futsal', value: 'Futsal' },
    { label: 'Badminton', value: 'Badminton' },
    { label: 'Cricket', value: 'Cricket' },
    { label: 'Tennis', value: 'Tennis' },
    { label: 'Basketball', value: 'Basketball' },
  ];

  courtOptions = [
    { label: 'Court A', value: 'Court A' },
    { label: 'Court B', value: 'Court B' },
    { label: 'Court 1', value: 'Court 1' },
    { label: 'Court 2', value: 'Court 2' },
    { label: 'Court 3', value: 'Court 3' },
    { label: 'Main Ground', value: 'Main Ground' },
  ];

  timeOptions = [
    { label: '06:00 AM', value: '06:00' },
    { label: '06:30 AM', value: '06:30' },
    { label: '07:00 AM', value: '07:00' },
    { label: '07:30 AM', value: '07:30' },
    { label: '08:00 AM', value: '08:00' },
    { label: '08:30 AM', value: '08:30' },
    { label: '09:00 AM', value: '09:00' },
    { label: '09:30 AM', value: '09:30' },
    { label: '10:00 AM', value: '10:00' },
    { label: '10:30 AM', value: '10:30' },
    { label: '11:00 AM', value: '11:00' },
    { label: '11:30 AM', value: '11:30' },
    { label: '12:00 PM', value: '12:00' },
    { label: '12:30 PM', value: '12:30' },
    { label: '01:00 PM', value: '13:00' },
    { label: '01:30 PM', value: '13:30' },
    { label: '02:00 PM', value: '14:00' },
    { label: '02:30 PM', value: '14:30' },
    { label: '03:00 PM', value: '15:00' },
    { label: '03:30 PM', value: '15:30' },
    { label: '04:00 PM', value: '16:00' },
    { label: '04:30 PM', value: '16:30' },
    { label: '05:00 PM', value: '17:00' },
    { label: '05:30 PM', value: '17:30' },
    { label: '06:00 PM', value: '18:00' },
    { label: '06:30 PM', value: '18:30' },
    { label: '07:00 PM', value: '19:00' },
    { label: '07:30 PM', value: '19:30' },
    { label: '08:00 PM', value: '20:00' },
    { label: '08:30 PM', value: '20:30' },
    { label: '09:00 PM', value: '21:00' },
  ];

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) {
    const data = this.config.data;
    this.mode = data?.mode ?? 'create';
    this.booking = data?.booking ?? null;
    this.initForm();
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.booking) {
      this.populateForm();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      venue: ['', Validators.required],
      sport: ['', Validators.required],
      bookingDate: [null, Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      court: ['', Validators.required],
      remarks: [''],
    });
  }

  private populateForm(): void {
    if (!this.booking) return;
    this.form.patchValue({
      venue: this.booking.venue,
      sport: this.booking.sport,
      bookingDate: new Date(this.booking.bookingDate),
      startTime: this.booking.startTime,
      endTime: this.booking.endTime,
      court: this.booking.court,
      remarks: this.booking.remarks,
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.value;
    const bookingDate = val.bookingDate instanceof Date
      ? val.bookingDate.toISOString().split('T')[0]
      : val.bookingDate;

    this.ref.close({
      venue: val.venue,
      sport: val.sport,
      bookingDate,
      startTime: val.startTime,
      endTime: val.endTime,
      court: val.court,
      remarks: val.remarks || '',
      status: this.mode === 'create' ? 'pending' : (this.booking?.status ?? 'pending'),
      amount: this.mode === 'edit' ? (this.booking?.amount ?? 0) : 0,
    });
  }

  onCancel(): void {
    this.ref.close(null);
  }
}
