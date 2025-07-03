import ProtectedRoute from '@/components/ProtectedRoute'
import Profile from '@/components/ProfilePage/Profile'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  )
}