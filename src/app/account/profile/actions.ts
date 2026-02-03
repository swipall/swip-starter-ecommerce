'use server';

import {
    updateCustomerPassword,
    updateCustomer as apiUpdateCustomer,
    requestUpdateCustomerEmailAddress,
} from '@/lib/swipall/rest-adapter';
import { revalidatePath } from 'next/cache';

export async function updatePasswordAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const userToken = formData.get('userToken') as string;

    if (!newPassword || !confirmPassword) {
        return { error: 'Todos los campos son obligatorios' };
    }

    if (!userToken) {
        return { error: 'El token de usuario falta. Por favor, inicia sesión de nuevo.' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Las nuevas contraseñas no coinciden' };
    }


    try {
        const body = {
            new_password1: newPassword,
            new_password2: confirmPassword,
            token: userToken,
        }
        await updateCustomerPassword(body, { useAuthToken: true });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        return { error: message };
    }
}

export async function updateCustomerAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!firstName || !lastName) {
        return { error: 'First name and last name are required' };
    }

    try {
        await apiUpdateCustomer({
            firstName,
            lastName,
        }, { useAuthToken: true });

        revalidatePath('/account/profile');
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}

export async function requestEmailUpdateAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const password = formData.get('password') as string;
    const newEmailAddress = formData.get('newEmailAddress') as string;

    if (!password || !newEmailAddress) {
        return { error: 'Password and new email address are required' };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailAddress)) {
        return { error: 'Please enter a valid email address' };
    }

    try {
        await requestUpdateCustomerEmailAddress(password, newEmailAddress, { useAuthToken: true });
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
        return { error: message };
    }
}
