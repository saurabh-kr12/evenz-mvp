// app/dashboard/bookings/page.js
import UserBookings from '../../../pages/UserPages/UserBookings';
import UserDashboard from '../../../pages/UserPages/UserDashboard';

export default function DashboardBookings() {
  return (
    <UserDashboard>
      <UserBookings />
    </UserDashboard>
  );
}