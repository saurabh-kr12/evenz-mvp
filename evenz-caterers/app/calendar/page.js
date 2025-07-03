import ProtectedRoute from '@/components/ProtectedRoute'
import AvailabilityCalendar from '@/pages/Calendar'

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <AvailabilityCalendar />
    </ProtectedRoute>
  )
}