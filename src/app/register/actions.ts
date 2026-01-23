'use server';

import { registerCustomer } from '@/lib/swipall/rest-adapter';
import { redirect } from 'next/navigation';

export async function registerAction(prevState: { error?: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const password1 = formData.get('password1') as string;
    const password2 = formData.get('password2') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    if (!email || !first_name || !last_name || !password1 || !password2) {
        return { error: 'Todos los campos son requeridos' };
    }

    if (password1 !== password2) {
        return { error: 'Las contraseñas no coinciden' };
    }

    try {
        await registerCustomer({
            email,
            username,
            first_name,
            last_name,
            password1,
            password2,
        });

        // here we could navigate to verify-pending page with redirectTo param but for now redirect to sign-in
        /// since the commerce does not require verification to sign in
        const signInHref = redirectTo
            ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
            : '/sign-in';

        redirect(signInHref);
    } catch (error: unknown) {
        // Don't catch redirect errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'El registro falló';
        return { error: message };
    }
}
