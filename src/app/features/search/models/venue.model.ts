export interface Venue {
  id: string;
  name: string;
  sport: string;
  location: string;
  rating: number;
  totalRatings: number;
  pricePerHour: number;
  image: string;
  description: string;
  availableSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}
