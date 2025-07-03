import ProtectedRoute from '@/components/ProtectedRoute'
import FAQ from '@/pages/FAQ'

export default function FAQPage() {
  return (
    <ProtectedRoute>
      <FAQ />
    </ProtectedRoute>
  )
}