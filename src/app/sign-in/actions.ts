'use server';


import { removeAuthToken, setAuthToken } from '@/lib/auth';
import { login, logout } from '@/lib/swipall/auth';
import { getCustomerInfo } from '@/lib/swipall/users';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    try {
        const result = await login({
            email,
            password,
        });

        // Store the token in a cookie if returned
        if (result?.access_token) {
            await setAuthToken(result.access_token);
            const userData = await getCustomerInfo({ useAuthToken: true });
            revalidatePath('/', 'layout');
            const user = { ...result.user, ...userData };
            // Return user data to be stored in localStorage from client
            return {
                success: true,
                user,
                redirectTo: (redirectTo?.startsWith('/') && !redirectTo.startsWith('//')) ? redirectTo : '/'
            };
        } else {
            return { error: 'No se recibió token de autenticación' };
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Correo electrónico o contraseña inválidos';
        return { error: message };
    }
}

export async function logoutAction() {
    try {
        await logout({ useAuthToken: true });
    } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout error:', error);
    }

    await removeAuthToken();
    revalidatePath('/', 'layout');
    redirect('/')
}
