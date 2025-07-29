import ProtectedRoute from '@/components/ProtectedRoute'
import CustomizationTasting from '@/components/ServicePages/GuestnDietFilters'

export default function CustomizationPage() {
  return (
    <ProtectedRoute>
      <CustomizationTasting />
    </ProtectedRoute>
  )
}