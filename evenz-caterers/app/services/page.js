// File: app/services/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ServicesRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Automatically redirect to the default 'menu' tab
        router.replace('/services/menu');
    }, [router]);

    // Show a loading state while redirecting
    return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
}
