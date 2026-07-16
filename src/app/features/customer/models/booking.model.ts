export interface Booking {
  id: string;
  venue: string;
  sport: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
  createdDate: string;
  court: string;
  remarks: string;
}
