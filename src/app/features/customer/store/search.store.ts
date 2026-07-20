import { Injectable, signal, computed } from '@angular/core';

export interface SearchState {
  location: string;
  date: Date | null;
  priceRange: number[];
  minRating: number;
  sport: string;
}

const initialState: SearchState = {
  location: '',
  date: null,
  priceRange: [0, 5000],
  minRating: 0,
  sport: 'Futsal',
};

@Injectable({ providedIn: 'root' })
export class SearchStore {
  private state = signal<SearchState>({ ...initialState });

  readonly location = computed(() => this.state().location);
  readonly date = computed(() => this.state().date);
  readonly priceRange = computed(() => this.state().priceRange);
  readonly minRating = computed(() => this.state().minRating);
  readonly sport = computed(() => this.state().sport);

  readonly hasDate = computed(() => this.state().date !== null);
  readonly hasLocation = computed(() => !!this.state().location);

  readonly formattedDate = computed(() => {
    const d = this.state().date;
    if (!d) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
  });

  setLocation(location: string) {
    this.state.update(s => ({ ...s, location }));
  }

  setDate(date: Date | null) {
    this.state.update(s => ({ ...s, date }));
  }

  setPriceRange(priceRange: number[]) {
    this.state.update(s => ({ ...s, priceRange }));
  }

  setMinRating(minRating: number) {
    this.state.update(s => ({ ...s, minRating }));
  }

  setSport(sport: string) {
    this.state.update(s => ({ ...s, sport }));
  }

  setSearchState(state: Partial<SearchState>) {
    this.state.update(s => ({ ...s, ...state }));
  }

  clearDate() {
    this.state.update(s => ({ ...s, date: null }));
  }

  reset() {
    this.state.set({ ...initialState });
  }
}
