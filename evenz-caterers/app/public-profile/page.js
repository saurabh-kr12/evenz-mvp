import CatererProfileView from "@/pages/ViewProfile";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PublicProfilePage() {
   return (
      <ProtectedRoute>
         <CatererProfileView />
      </ProtectedRoute>
   );
}