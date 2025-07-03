import ProtectedRoute from '@/components/ProtectedRoute'
import ServicesLogistics from '@/components/ServicePages/ServiceLogistics'

export default function ServicesLogisticsPage() {
  return (
    <ProtectedRoute>
      <ServicesLogistics />
    </ProtectedRoute>
  )
}