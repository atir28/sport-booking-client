import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SliderModule } from 'primeng/slider';
import { VenueSearchService } from '../search/services/venue-search.service';
import { Venue } from '../search/models/venue.model';
import { SearchStore } from '../customer/store/search.store';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    SliderModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private venueService = inject(VenueSearchService);
  private router = inject(Router);
  private searchStore = inject(SearchStore);

  searchResults: Venue[] = [];
  hasSearched = false;

  // Filters
  showFilters = false;

  maxPrice = 5000;

  ratingOptions = [
    { label: 'Any', value: 0 },
    { label: '4.0+', value: 4.0 },
    { label: '4.5+', value: 4.5 },
    { label: '4.7+', value: 4.7 },
  ];

  trendingVenues = this.venueService.getVenues().slice(0, 6);

  tabs = [
    { label: 'Futsal', icon: 'pi pi-star' },
    { label: 'Badminton', icon: 'pi pi-heart' },
    { label: 'Cricket', icon: 'pi pi-bolt' },
  ];

  locationOptions = [
    { label: 'Kathmandu', value: 'Kathmandu' },
    { label: 'Lalitpur', value: 'Lalitpur' },
    { label: 'Bhaktapur', value: 'Bhaktapur' },
    { label: 'Pokhara', value: 'Pokhara' },
    { label: 'Chitwan', value: 'Chitwan' },
    { label: 'Butwal', value: 'Butwal' },
    { label: 'Biratnagar', value: 'Biratnagar' },
    { label: 'Dharan', value: 'Dharan' },
  ];

  // Proxied getters/setters for store
  get location(): string {
    return this.searchStore.location();
  }
  set location(value: string) {
    this.searchStore.setLocation(value);
  }

  get date(): Date | null {
    return this.searchStore.date();
  }
  set date(value: Date | null) {
    this.searchStore.setDate(value);
  }

  get priceRange(): number[] {
    return this.searchStore.priceRange();
  }
  set priceRange(value: number[]) {
    this.searchStore.setPriceRange(value);
  }

  get minRating(): number {
    return this.searchStore.minRating();
  }
  set minRating(value: number) {
    this.searchStore.setMinRating(value);
  }

  get activeTab(): string {
    return this.searchStore.sport();
  }
  set activeTab(value: string) {
    this.searchStore.setSport(value);
  }

  get isDateEnabled(): boolean {
    return this.searchStore.hasLocation();
  }

  get formattedDate(): string {
    return this.searchStore.formattedDate();
  }

  get canSearch(): boolean {
    return this.searchStore.hasLocation();
  }

  get filteredResults(): Venue[] {
    return this.searchResults.filter(v => {
      const inPrice = v.pricePerHour >= this.priceRange[0] && v.pricePerHour <= this.priceRange[1];
      const inRating = v.rating >= this.minRating;
      return inPrice && inRating;
    });
  }

  get hasActiveFilters(): boolean {
    return this.priceRange[0] > 0 || this.priceRange[1] < this.maxPrice || this.minRating > 0;
  }

  onSearch() {
    if (!this.canSearch) return;
    this.searchResults = this.venueService.searchVenues(this.location, this.activeTab);
    this.hasSearched = true;
  }

  clearAll() {
    this.searchStore.reset();
    this.searchResults = [];
    this.hasSearched = false;
    this.showFilters = false;
  }

  clearFilters() {
    this.searchStore.setPriceRange([0, this.maxPrice]);
    this.searchStore.setMinRating(0);
  }

  onLocationChange() {
    this.searchStore.clearDate();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  viewVenue(venue: Venue) {
    this.router.navigate(['/venue', venue.id]);
  }
}
