'use server';

import { setAuthToken } from '@/lib/auth';
import { login, registerCustomer } from '@/lib/swipall/auth';
import { createCustomerInfoServer } from '@/lib/swipall/users/server';

export async function registerAction(prevState: { error?: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const password1 = formData.get('password1') as string;
    const password2 = formData.get('password2') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    // Address fields
    const address = formData.get('address') as string;
    const suburb = formData.get('suburb') as string;
    const postal_code = formData.get('postal_code') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const mobile = formData.get('mobile') as string;
    const references = formData.get('references') as string;

    if (!email || !first_name || !last_name || !password1 || !password2 || !address || !suburb || !postal_code || !city || !state || !mobile) {
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


        const customerInfo = {
            receiver: `${first_name} ${last_name}`,
            address,
            suburb,
            postal_code,
            city,
            state,
            country,
            mobile,
            references: references || '',
        };
        // Login and get user data
        const loginResult = await login({ email, password: password1 });

        if (!loginResult?.access_token) {
            return { error: 'No se recibió token de autenticación' };
        }

        // Store token in cookie
        await setAuthToken(loginResult.access_token);

        // Create customer info with the new token
        await createCustomerInfoServer(customerInfo);

        // Return user data to be stored in localStorage from client
        return {
            success: true,
            user: loginResult.user,
            redirectTo: (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) ? redirectTo : '/'
        };
    } catch (error: unknown) {
        // Don't catch redirect errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        const message = error instanceof Error ? error.message : 'El registro falló';
        return { error: message };
    }
}

