import { Suspense } from 'react';
import ResetPassword from "@/pages/ResetPassword";

// Loading fallback
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Reset Your Password | Evenz.in",
  description: "Create a new, secure password for your Evenz.in account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPassword />
    </Suspense>
  );
}