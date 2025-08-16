'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const PublicRoute = ({ children }) => {
    const router = useRouter();
    const { currentUser, loading } = useAuth();

    useEffect(() => {
        // If the auth state is not loading and a user is logged in,
        // redirect them away from the public page to the dashboard.
        if (!loading && currentUser) {
            router.replace('/dashboard');
        }
    }, [currentUser, loading, router]);

    // While checking the auth state, show a loading spinner.
    if (loading || currentUser) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If the user is not logged in, show the page content (e.g., the login form).
    return children;
};

export default PublicRoute;