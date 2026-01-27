'use server';

import {
    updateCustomerAddress as apiUpdateAddress,
    deleteCustomerAddress as apiDeleteAddress,
    setDefaultShippingAddress as apiSetDefaultShipping,
    setDefaultBillingAddress as apiSetDefaultBilling,
} from '@/lib/swipall/rest-adapter';
import { createAddress as createApiAddress } from '@/lib/swipall/users';
import {revalidatePath} from 'next/cache';

interface AddressInput {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    company?: string;
}

interface UpdateAddressInput extends AddressInput {
    id: string;
}

export async function createAddress(address: AddressInput) {
    try {
        const result = await createApiAddress(address, {useAuthToken: true});
        revalidatePath('/account/addresses');
        return result;
    } catch (error) {
        throw new Error('Failed to create address');
    }
}

export async function updateAddress(address: UpdateAddressInput) {
    const {id, ...input} = address;

    try {
        const result = await apiUpdateAddress(id, input, {useAuthToken: true});
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('Failed to update address');
    }
}

export async function deleteAddress(id: string) {
    try {
        const result = await apiDeleteAddress(id, {useAuthToken: true});
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('Failed to delete address');
    }
}

export async function setDefaultShippingAddress(id: string) {
    try {
        const result = await apiSetDefaultShipping(id, {useAuthToken: true});
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('Failed to set default shipping address');
    }
}

export async function setDefaultBillingAddress(id: string) {
    try {
        const result = await apiSetDefaultBilling(id, {useAuthToken: true});
        revalidatePath('/account/addresses');
        return result.data;
    } catch (error) {
        throw new Error('Failed to set default billing address');
    }
}
