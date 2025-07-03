import ProtectedRoute from '@/components/ProtectedRoute'
import Bookings from '@/pages/Bookings'

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <Bookings />
    </ProtectedRoute>
  )
}