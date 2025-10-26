import BookingRequestForm from '../../../pages/BookingPage';
import PrivateRoute from '../../../components/PrivateRoute';

export default function Booking({ params }) {
  return (
    // <PrivateRoute>
      <BookingRequestForm params={params} />
    // </PrivateRoute>
  );
}