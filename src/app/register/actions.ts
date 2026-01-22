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

        // Redirect to verification pending page, preserving redirectTo if present
        const verifyUrl = redirectTo
            ? `/verify-pending?redirectTo=${encodeURIComponent(redirectTo)}`
            : '/verify-pending';

        redirect(verifyUrl);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'El registro falló';
        return { error: message };
    }
}
