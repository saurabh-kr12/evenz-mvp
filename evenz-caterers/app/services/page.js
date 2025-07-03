import ServiceDashboard from "@/pages/Services";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ServicesPage() {
   return (
      <ProtectedRoute>
         <ServiceDashboard />
      </ProtectedRoute>
   );
}