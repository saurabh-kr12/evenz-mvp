// app/dashboard/shortlists/page.js
import UserShortlists from '../../../pages/UserPages/UserShortlists';
import UserDashboard from '../../../pages/UserPages/UserDashboard';

export default function DashboardShortlists() {
  return (
    <UserDashboard>
      <UserShortlists />
    </UserDashboard>
  );
}