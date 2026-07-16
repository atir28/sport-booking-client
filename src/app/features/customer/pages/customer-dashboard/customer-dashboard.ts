import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  change: string;
  changeType: 'up' | 'down';
}

interface Booking {
  id: string;
  venue: string;
  sport: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  amount: number;
}

interface Activity {
  icon: string;
  message: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-customer-dashboard',
  imports: [CommonModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss',
})
export class CustomerDashboardComponent {
  userName = 'Alex Johnson';
  memberSince = 'Jan 2024';

  stats: StatCard[] = [
    { label: 'Total Bookings', value: 24, icon: 'pi pi-calendar', color: 'text-blue-600', change: '+3 this month', changeType: 'up' },
    { label: 'Completed', value: 18, icon: 'pi pi-check-circle', color: 'text-green-600', change: '+2 this week', changeType: 'up' },
    { label: 'Pending', value: 4, icon: 'pi pi-clock', color: 'text-amber-600', change: '2 upcoming', changeType: 'up' },
    { label: 'Cancelled', value: 2, icon: 'pi pi-times-circle', color: 'text-red-500', change: '-1 vs last month', changeType: 'down' },
    { label: 'Total Spent', value: 'Rs. 36,400', icon: 'pi pi-wallet', color: 'text-purple-600', change: 'Rs. 4,200 this month', changeType: 'up' },
    { label: 'Favorite Venues', value: 6, icon: 'pi pi-heart', color: 'text-pink-600', change: '+1 new favorite', changeType: 'up' },
  ];

  bookings: Booking[] = [
    { id: 'BK-1024', venue: 'Downtown Turf Arena', sport: 'Futsal', date: 'Jul 18, 2026', time: '6:00 PM - 7:00 PM', status: 'confirmed', amount: 1500 },
    { id: 'BK-1023', venue: 'Shuttle Zone Indoor', sport: 'Badminton', date: 'Jul 20, 2026', time: '10:00 AM - 11:30 AM', status: 'confirmed', amount: 1200 },
    { id: 'BK-1022', venue: 'Greenfield Cricket', sport: 'Cricket', date: 'Jul 22, 2026', time: '3:00 PM - 6:00 PM', status: 'pending', amount: 4500 },
    { id: 'BK-1021', venue: 'Ace Tennis Courts', sport: 'Tennis', date: 'Jul 25, 2026', time: '7:00 AM - 8:30 AM', status: 'pending', amount: 2000 },
    { id: 'BK-1020', venue: 'Downtown Turf Arena', sport: 'Futsal', date: 'Jul 12, 2026', time: '5:00 PM - 6:00 PM', status: 'completed', amount: 1500 },
    { id: 'BK-1019', venue: 'Shuttle Zone Indoor', sport: 'Badminton', date: 'Jul 10, 2026', time: '9:00 AM - 10:00 AM', status: 'completed', amount: 800 },
    { id: 'BK-1018', venue: 'Metro Sports Hub', sport: 'Futsal', date: 'Jul 8, 2026', time: '4:00 PM - 5:00 PM', status: 'cancelled', amount: 1200 },
    { id: 'BK-1017', venue: 'Greenfield Cricket', sport: 'Cricket', date: 'Jul 5, 2026', time: '2:00 PM - 5:00 PM', status: 'completed', amount: 3800 },
  ];

  activities: Activity[] = [
    { icon: 'pi pi-check-circle', message: 'Booking BK-1020 completed successfully', time: '2 hours ago', color: 'text-green-600' },
    { icon: 'pi pi-calendar', message: 'New booking confirmed for Jul 18', time: '5 hours ago', color: 'text-blue-600' },
    { icon: 'pi pi-heart', message: 'Added "Ace Tennis Courts" to favorites', time: '1 day ago', color: 'text-pink-600' },
    { icon: 'pi pi-star', message: 'Left a 5-star review for Downtown Turf Arena', time: '2 days ago', color: 'text-yellow-500' },
    { icon: 'pi pi-wallet', message: 'Payment of Rs. 1,500 processed for BK-1020', time: '3 days ago', color: 'text-purple-600' },
    { icon: 'pi pi-times-circle', message: 'Booking BK-1018 was cancelled', time: '5 days ago', color: 'text-red-500' },
  ];

  monthlyData = [
    { month: 'Jan', bookings: 2, spent: 3200 },
    { month: 'Feb', bookings: 3, spent: 4800 },
    { month: 'Mar', bookings: 2, spent: 3000 },
    { month: 'Apr', bookings: 4, spent: 6400 },
    { month: 'May', bookings: 3, spent: 4500 },
    { month: 'Jun', bookings: 5, spent: 7800 },
    { month: 'Jul', bookings: 5, spent: 6700 },
  ];

  maxBookings = Math.max(...this.monthlyData.map(m => m.bookings));

  getBarHeight(bookings: number): number {
    return (bookings / this.maxBookings) * 100;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-600';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  getSportIcon(sport: string): string {
    switch (sport) {
      case 'Futsal': return 'pi pi-star';
      case 'Badminton': return 'pi pi-heart';
      case 'Cricket': return 'pi pi-bolt';
      case 'Tennis': return 'pi pi-database';
      default: return 'pi pi-circle';
    }
  }
}
