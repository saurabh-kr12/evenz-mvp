import ProtectedRoute from '@/components/ProtectedRoute'
import ComplianceSection from '@/components/ServicePages/Compliance'

export default function CompliancePage() {
  return (
    <ProtectedRoute>
      <ComplianceSection />
    </ProtectedRoute>
  )
}