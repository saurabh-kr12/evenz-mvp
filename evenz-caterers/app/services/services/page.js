import ProtectedRoute from '@/components/ProtectedRoute'
import ServicesLogistics from '@/components/ServicePages/Counter&Services'

export default function ServicesLogisticsPage() {
  return (
    <ProtectedRoute>
      <ServicesLogistics />
    </ProtectedRoute>
  )
}