import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
import { BookingFormDialogComponent } from './booking-form-dialog/booking-form-dialog';

@Component({
  selector: 'app-my-bookings',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    DynamicDialogModule,
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.scss',
})
export class MyBookingsComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  globalFilter = '';
  loading = signal(true);

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.bookings.set(this.bookingService.getBookings());
      this.loading.set(false);
    }, 600);
  }

  get filteredBookings(): Booking[] {
    if (!this.globalFilter) return this.bookings();
    const term = this.globalFilter.toLowerCase();
    return this.bookings().filter(b =>
      b.id.toLowerCase().includes(term) ||
      b.venue.toLowerCase().includes(term) ||
      b.sport.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | undefined {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warn';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return undefined;
    }
  }

  openNewBooking(): void {
    this.router.navigate(['/search']);
  }

  openEditDialog(booking: Booking): void {
    const ref = this.dialogService.open(BookingFormDialogComponent, {
      header: 'Update Booking',
      width: this.getDialogWidth(),
      contentStyle: { overflow: 'auto' },
      modal: true,
      closable: true,
      data: { mode: 'edit', booking },
    });

    ref?.onClose.subscribe((data: Partial<Booking> | undefined) => {
      if (data) {
        this.bookingService.updateBooking(booking.id, data);
        this.bookings.set(this.bookingService.getBookings());
        this.messageService.add({
          severity: 'success',
          summary: 'Booking Updated',
          detail: 'Your booking has been updated successfully.',
        });
      }
    });
  }

  confirmCancel(booking: Booking): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel this booking?',
      header: 'Cancel Booking',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.bookingService.cancelBooking(booking.id);
        this.bookings.set(this.bookingService.getBookings());
        this.messageService.add({
          severity: 'success',
          summary: 'Booking Cancelled',
          detail: 'Booking cancelled successfully.',
        });
      },
    });
  }

  private getDialogWidth(): string {
    const w = window.innerWidth;
    if (w <= 640) return '95vw';
    if (w <= 1024) return '80vw';
    return '60vw';
  }
}
