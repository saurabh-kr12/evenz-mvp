// app/dashboard/profile/page.js
import UserProfile from '../../../pages/UserPages/UserProfile';
import UserDashboard from '../../../pages/UserPages/UserDashboard';

export default function DashboardProfile() {
  return (
    <UserDashboard>
      <UserProfile />
    </UserDashboard>
  );
}