
'use client';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Spinner from './Spinner';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <Spinner />;
  }

  if (!currentUser) {
    return null; // Will redirect via useEffect
  }

  return children;
};

export default PrivateRoute;