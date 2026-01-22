import {cache} from "react";
import {cacheTag} from "next/cache";

/**
 * Get active customer from localStorage
 * The user data is stored in localStorage after successful login
 * This is a server-side function but since we're reading from localStorage,
 * it will be called from client context where localStorage is available
 */
export const getActiveCustomer = cache(async () => {
    cacheTag('user');
    
    // In a server component context, we need to get the user from a client-side context
    // or from a context that has access to localStorage
    // For now, return null as the actual user will be fetched by the client component
    // through the useAuthUser hook or context
    return null;
})
