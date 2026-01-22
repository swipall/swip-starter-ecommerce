'use client';

import { useEffect, useState } from 'react';
import { CurrentUser } from '@/lib/swipall/rest-adapter';
import { getAuthUser, removeAuthUser } from '@/lib/auth-client';

/**
 * Hook to get the authenticated user from localStorage
 * This hook manages client-side user state and provides methods to update it
 */
export function useAuthUser() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage on mount
        const storedUser = getAuthUser();
        setUser(storedUser);
        setIsLoading(false);
    }, []);

    const logout = () => {
        removeAuthUser();
        setUser(null);
    };

    return {
        user,
        isLoading,
        isAuthenticated: user !== null,
        logout,
    };
}
