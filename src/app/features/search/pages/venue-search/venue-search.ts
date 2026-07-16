import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Venue, TimeSlot } from '../../models/venue.model';
import { VenueSearchService } from '../../services/venue-search.service';

@Component({
  selector: 'app-venue-search',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    DatePickerModule,
    TagModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './venue-search.html',
  styleUrl: './venue-search.scss',
})
export class VenueSearchComponent {
  location = '';
  date: Date | null = null;
  selectedDay = signal<string>('');
  venues = signal<Venue[]>([]);
  selectedSlots = signal<Record<string, string>>({});
  showResults = signal(false);

  sportTabs = [
    { label: 'Futsal', icon: 'pi pi-star' },
    { label: 'Badminton', icon: 'pi pi-heart' },
    { label: 'Cricket', icon: 'pi pi-bolt' },
  ];
  activeSport = signal('Futsal');

  dayOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'This Weekend', value: 'weekend' },
    { label: 'Pick a Date', value: 'custom' },
  ];

  locationOptions = [
    { label: 'Kathmandu', value: 'Kathmandu' },
    { label: 'Lalitpur', value: 'Lalitpur' },
    { label: 'Bhaktapur', value: 'Bhaktapur' },
    { label: 'Pokhara', value: 'Pokhara' },
  ];

  constructor(
    private venueSearchService: VenueSearchService,
    private messageService: MessageService,
  ) {}

  onSearch(): void {
    const sport = this.activeSport();
    const query = this.location;
    this.venues.set(this.venueSearchService.searchVenues(query, sport));
    this.showResults.set(true);
  }

  getAvailableCount(venue: Venue): number {
    return venue.availableSlots.filter((s: TimeSlot) => s.available).length;
  }

  selectSlot(venueId: string, slotKey: string): void {
    this.selectedSlots.update(s => ({ ...s, [venueId]: s[venueId] === slotKey ? '' : slotKey }));
  }

  isSlotSelected(venueId: string, slotKey: string): boolean {
    return this.selectedSlots()[venueId] === slotKey;
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

  slotKey(slot: TimeSlot): string {
    return `${slot.startTime}-${slot.endTime}`;
  }

  bookSlot(venue: Venue): void {
    const slot = this.selectedSlots()[venue.id];
    if (!slot) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Select a Slot',
        detail: 'Please select an available time slot first.',
      });
      return;
    }

    const [start] = slot.split('-');
    this.messageService.add({
      severity: 'success',
      summary: 'Slot Selected',
      detail: `${venue.name} — ${this.formatTime(start)} selected. Proceeding to booking...`,
    });
  }
}
