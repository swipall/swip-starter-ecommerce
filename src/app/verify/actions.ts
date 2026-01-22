'use server';

import {verifyCustomerAccount} from '@/lib/swipall/rest-adapter';

export async function verifyAccountAction(token: string, password?: string) {
    if (!token) {
        return {error: 'Verification token is required'};
    }

    try {
        const result = await verifyCustomerAccount(token);

        // Verification successful
        return {success: result.data?.success || false};
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        return {error: message};
    }
}
