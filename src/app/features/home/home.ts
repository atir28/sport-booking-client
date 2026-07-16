import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { VenueSearchService } from '../search/services/venue-search.service';
import { Venue, TimeSlot } from '../search/models/venue.model';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private venueService = inject(VenueSearchService);

  location = '';
  date: Date | null = null;
  selectedDay = '';

  searchResults: Venue[] = [];
  hasSearched = false;
  selectedSlots: Record<string, string> = {};

  trendingVenues = this.venueService.getVenues().slice(0, 6);

  tabs = [
    { label: 'Futsal', icon: 'pi pi-star' },
    { label: 'Badminton', icon: 'pi pi-heart' },
    { label: 'Cricket', icon: 'pi pi-bolt' },
  ];

  activeTab = 'Futsal';

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

  onSearch() {
    this.searchResults = this.venueService.searchVenues(this.location, this.activeTab);
    this.hasSearched = true;
  }

  clearSearch() {
    this.location = '';
    this.date = null;
    this.selectedDay = '';
    this.searchResults = [];
    this.hasSearched = false;
    this.selectedSlots = {};
  }

  getAvailableCount(venue: Venue): number {
    return venue.availableSlots.filter(s => s.available).length;
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

  selectSlot(venueId: string, key: string) {
    this.selectedSlots[venueId] = this.selectedSlots[venueId] === key ? '' : key;
  }

  isSlotSelected(venueId: string, key: string): boolean {
    return this.selectedSlots[venueId] === key;
  }
}
