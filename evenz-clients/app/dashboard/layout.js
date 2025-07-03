import PrivateRoute from '../../components/PrivateRoute';

export default function DashboardLayout({ children }) {
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}