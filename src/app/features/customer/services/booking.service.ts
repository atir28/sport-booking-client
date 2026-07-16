import { Injectable, signal } from '@angular/core';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly bookings = signal<Booking[]>([
    { id: 'BK-1024', venue: 'Downtown Turf Arena', sport: 'Futsal', bookingDate: '2026-07-18', startTime: '18:00', endTime: '19:00', duration: '1 hr', status: 'confirmed', amount: 1500, createdDate: '2026-07-10', court: 'Court A', remarks: '' },
    { id: 'BK-1023', venue: 'Shuttle Zone Indoor', sport: 'Badminton', bookingDate: '2026-07-20', startTime: '10:00', endTime: '11:30', duration: '1.5 hrs', status: 'confirmed', amount: 1200, createdDate: '2026-07-11', court: 'Court 2', remarks: 'Bring extra shuttles' },
    { id: 'BK-1022', venue: 'Greenfield Cricket', sport: 'Cricket', bookingDate: '2026-07-22', startTime: '15:00', endTime: '18:00', duration: '3 hrs', status: 'pending', amount: 4500, createdDate: '2026-07-12', court: 'Main Ground', remarks: '' },
    { id: 'BK-1021', venue: 'Ace Tennis Courts', sport: 'Tennis', bookingDate: '2026-07-25', startTime: '07:00', endTime: '08:30', duration: '1.5 hrs', status: 'pending', amount: 2000, createdDate: '2026-07-13', court: 'Court 1', remarks: '' },
    { id: 'BK-1020', venue: 'Downtown Turf Arena', sport: 'Futsal', bookingDate: '2026-07-12', startTime: '17:00', endTime: '18:00', duration: '1 hr', status: 'completed', amount: 1500, createdDate: '2026-07-05', court: 'Court A', remarks: '' },
    { id: 'BK-1019', venue: 'Shuttle Zone Indoor', sport: 'Badminton', bookingDate: '2026-07-10', startTime: '09:00', endTime: '10:00', duration: '1 hr', status: 'completed', amount: 800, createdDate: '2026-07-03', court: 'Court 1', remarks: '' },
    { id: 'BK-1018', venue: 'Metro Sports Hub', sport: 'Futsal', bookingDate: '2026-07-08', startTime: '16:00', endTime: '17:00', duration: '1 hr', status: 'cancelled', amount: 1200, createdDate: '2026-07-01', court: 'Court B', remarks: 'Changed plans' },
    { id: 'BK-1017', venue: 'Greenfield Cricket', sport: 'Cricket', bookingDate: '2026-07-05', startTime: '14:00', endTime: '17:00', duration: '3 hrs', status: 'completed', amount: 3800, createdDate: '2026-06-28', court: 'Main Ground', remarks: '' },
    { id: 'BK-1016', venue: 'Ace Tennis Courts', sport: 'Tennis', bookingDate: '2026-07-03', startTime: '06:30', endTime: '08:00', duration: '1.5 hrs', status: 'completed', amount: 2000, createdDate: '2026-06-26', court: 'Court 2', remarks: '' },
    { id: 'BK-1015', venue: 'Metro Sports Hub', sport: 'Futsal', bookingDate: '2026-07-01', startTime: '19:00', endTime: '20:00', duration: '1 hr', status: 'completed', amount: 1200, createdDate: '2026-06-24', court: 'Court A', remarks: '' },
    { id: 'BK-1014', venue: 'Shuttle Zone Indoor', sport: 'Badminton', bookingDate: '2026-06-28', startTime: '11:00', endTime: '12:30', duration: '1.5 hrs', status: 'completed', amount: 1200, createdDate: '2026-06-21', court: 'Court 3', remarks: '' },
    { id: 'BK-1013', venue: 'Downtown Turf Arena', sport: 'Futsal', bookingDate: '2026-06-25', startTime: '18:00', endTime: '19:00', duration: '1 hr', status: 'completed', amount: 1500, createdDate: '2026-06-18', court: 'Court B', remarks: '' },
  ]);

  getBookings(): Booking[] {
    return this.bookings();
  }

  addBooking(booking: Omit<Booking, 'id' | 'createdDate'>): Booking {
    const newBooking: Booking = {
      ...booking,
      id: `BK-${1025 + this.bookings().length}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    this.bookings.update(list => [newBooking, ...list]);
    return newBooking;
  }

  updateBooking(id: string, data: Partial<Booking>): void {
    this.bookings.update(list =>
      list.map(b => (b.id === id ? { ...b, ...data } : b))
    );
  }

  cancelBooking(id: string): void {
    this.bookings.update(list =>
      list.map(b => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
  }
}
