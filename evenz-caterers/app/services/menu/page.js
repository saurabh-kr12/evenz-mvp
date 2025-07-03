import ProtectedRoute from '@/components/ProtectedRoute'
import MenuCuisinesModule from '@/components/ServicePages/MenuCuisines'

export default function MenuPage() {
  return (
    <ProtectedRoute>
      <MenuCuisinesModule />
    </ProtectedRoute>
  )
}