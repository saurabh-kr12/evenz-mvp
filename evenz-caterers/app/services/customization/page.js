import ProtectedRoute from '@/components/ProtectedRoute'
import CustomizationTasting from '@/components/ServicePages/Customization&Tasting'

export default function CustomizationPage() {
  return (
    <ProtectedRoute>
      <CustomizationTasting />
    </ProtectedRoute>
  )
}