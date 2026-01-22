'use server';

import {resetPassword} from '@/lib/swipall/rest-adapter';
import {redirect} from 'next/navigation';

export async function resetPasswordAction(prevState: { error?: string } | undefined, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !password || !confirmPassword) {
        return {error: 'All fields are required'};
    }

    if (password !== confirmPassword) {
        return {error: 'Passwords do not match'};
    }

    try {
        const result = await resetPassword(token, password);

        // Password reset successful, redirect to login
        redirect('/sign-in?reset=success');
    } catch (error: unknown) {        const message = error instanceof Error ? error.message : 'Failed to reset password';
        return {error: message};
    }
}
