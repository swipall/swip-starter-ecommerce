'use server';

import {
    updateCustomerAddress as apiUpdateAddress,
    deleteCustomerAddress as apiDeleteAddress,
} from '@/lib/swipall/rest-adapter';
import { createAddress as createApiAddress } from '@/lib/swipall/users';
import { revalidatePath } from 'next/cache';
import { AddressInterface } from '@/lib/swipall/users/user.types';

export async function createAddress(address: Partial<AddressInterface>) {
    try {
        const result = await createApiAddress(address, { useAuthToken: true });
        revalidatePath('/account/addresses');
        return result;
    } catch (error) {
        throw new Error('No se pudo crear la dirección');
    }
}

export async function updateAddress(address: AddressInterface) {
    const { id, ...input } = address;

    try {
        const result = await apiUpdateAddress(id, input, { useAuthToken: true });
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('No se pudo actualizar la dirección');
    }
}

export async function deleteAddress(id: string) {
    try {
        const result = await apiDeleteAddress(id, { useAuthToken: true });
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('No se pudo eliminar la dirección');
    }
}
