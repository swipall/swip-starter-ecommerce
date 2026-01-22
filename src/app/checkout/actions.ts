'use server';

import {
    setShippingAddress as apiSetShippingAddress,
    setBillingAddress as apiSetBillingAddress,
    setShippingMethod as apiSetShippingMethod,
    addPaymentToOrder as apiAddPayment,
    createCustomerAddress as apiCreateAddress,
    transitionOrderToState,
} from '@/lib/swipall/rest-adapter';
import {revalidatePath, updateTag} from 'next/cache';
import {redirect} from "next/navigation";

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

export async function setShippingAddress(
    shippingAddress: AddressInput,
    useSameForBilling: boolean
) {
    try {
        await apiSetShippingAddress(shippingAddress, {useAuthToken: true});

        if (useSameForBilling) {
            await apiSetBillingAddress(shippingAddress, {useAuthToken: true});
        }

        revalidatePath('/checkout');
    } catch (error) {
        throw new Error('Failed to set shipping address');
    }
}

export async function setShippingMethod(shippingMethodId: string) {
    try {
        await apiSetShippingMethod([shippingMethodId], {useAuthToken: true});
        revalidatePath('/checkout');
    } catch (error) {
        throw new Error('Failed to set shipping method');
    }
}

export async function createCustomerAddress(address: AddressInput) {
    try {
        const result = await apiCreateAddress(address, {useAuthToken: true});
        revalidatePath('/checkout');
        return result.data;
    } catch (error) {
        throw new Error('Failed to create customer address');
    }
}

export async function transitionToArrangingPayment() {
    try {
        await transitionOrderToState('ArrangingPayment', {useAuthToken: true});
        revalidatePath('/checkout');
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to transition order state';
        throw new Error(message);
    }
}

export async function placeOrder(paymentMethodCode: string) {
    // First, transition the order to ArrangingPayment state
    await transitionToArrangingPayment();

    // Prepare metadata based on payment method
    const metadata: Record<string, any> = {};

    // For standard payment, include the required fields
    if (paymentMethodCode === 'standard-payment') {
        metadata.shouldDecline = false;
        metadata.shouldError = false;
        metadata.shouldErrorOnSettle = false;
    }

    // Add payment to the order
    try {
        const result = await apiAddPayment(
            {
                method: paymentMethodCode,
                metadata,
            },
            {useAuthToken: true}
        );

        const orderCode = result.data?.code;

        // Update the cart tag to immediately invalidate cached cart data
        updateTag('cart');
        updateTag('active-order');

        redirect(`/order-confirmation/${orderCode}`);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to place order';
        throw new Error(message);
    }
}

interface GuestCustomerInput {
    emailAddress: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export type SetCustomerForOrderResult =
    | { success: true }
    | { success: false; errorCode: 'EMAIL_CONFLICT'; message: string }
    | { success: false; errorCode: 'GUEST_CHECKOUT_DISABLED'; message: string }
    | { success: false; errorCode: 'NO_ACTIVE_ORDER'; message: string }
    | { success: false; errorCode: 'UNKNOWN'; message: string };

export async function setCustomerForOrder(
    input: GuestCustomerInput
): Promise<SetCustomerForOrderResult> {
    // TODO: Implementar en REST API si es necesario para guest checkout
    // Por ahora, retornamos éxito ya que el checkout puede funcionar sin esto
    try {
        revalidatePath('/checkout');
        return { success: true };
    } catch (error: unknown) {
        return { success: false, errorCode: 'UNKNOWN', message: 'Failed to set customer' };
    }
}
