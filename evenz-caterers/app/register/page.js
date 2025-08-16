import RegisterPage from "@/pages/RegisterPage"
import { Suspense } from "react";
import PublicRoute from "@/components/PublicRoute"; // Import PublicRoute

export const metadata = {
  title: "Register as a Caterer | Join Evenz.in Patna",
  description: "Join Patna's fastest-growing network of professional caterers. Sign up for free on Evenz.in and start receiving high-quality event leads today.",
};

function Loading() {
    return <div>Loading...</div>;
}

export default function Register() {
    return (
        <PublicRoute> {/* 2. Wrap the Suspense boundary */}
            <Suspense fallback={<Loading />}>
                <RegisterPage />
            </Suspense>
        </PublicRoute>
    );
}