import { Suspense } from 'react';
import Login from '@/components/AuthPages/login';
import PublicRoute from '@/components/PublicRoute'; // 1. Import PublicRoute

function Loading() {
    return <div>Loading...</div>;
}

export default function LoginPage() {
    return (
        <PublicRoute> {/* 2. Wrap the Suspense boundary */}
            <Suspense fallback={<Loading />}>
                <Login />
            </Suspense>
        </PublicRoute>
    );
}