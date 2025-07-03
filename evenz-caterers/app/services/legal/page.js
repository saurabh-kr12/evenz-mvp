import ProtectedRoute from '@/components/ProtectedRoute'
import LegalPaymentSection from '@/components/ServicePages/Legal'

export default function LegalPage() {
  return (
    <ProtectedRoute>
      <LegalPaymentSection />
    </ProtectedRoute>
  )
}