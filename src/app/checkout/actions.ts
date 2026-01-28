'use server';

import useShopModel from '@/lib/models/shop.model';
import useUserModel from '@/lib/models/user.model';
import {
    setShippingAddress as apiSetShippingAddress,
    createMpPreference,
    updateCartDeliveryInfo,
} from '@/lib/swipall/rest-adapter';
import { InterfaceInventoryItem, ShopCart } from '@/lib/swipall/types/types';
import { createAddress, createCustomerInfo } from '@/lib/swipall/users';
import { AddressInterface } from '@/lib/swipall/users/user.types';
import { revalidatePath, updateTag } from 'next/cache';
import { redirect } from "next/navigation";

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
) {
    try {
        await apiSetShippingAddress(shippingAddress, { useAuthToken: true });
        revalidatePath('/checkout');
    } catch (error) {
        throw new Error('Failed to set shipping address');
    }
}

export async function registerCustomerInfo(address: Partial<AddressInterface>) {
    try {
        const result = await createCustomerInfo(address, { useAuthToken: true });
        revalidatePath('/checkout');
        return result;
    } catch (error) {
        throw new Error('Failed to register customer info');
    }
}

export async function createCustomerAddress(address: Partial<AddressInterface>) {
    try {
        const result = await createAddress(address, { useAuthToken: true });
        revalidatePath('/checkout');
        return result;
    } catch (error) {
        throw new Error('Failed to create customer address');
    }
}

export async function updateShippingAddressForCart(addressId: string) {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();
        if (cartId) {
            await shopModel.updateCartShippingAddress(cartId, {
                shipment_address: addressId,
            });
        }
        revalidatePath('/checkout');
    } catch (error) {
        throw new Error('Failed to update shipping address');
    }
}

const handleBrowserCheckout = (initPoint: string) => {
    if (typeof window !== 'undefined') {
        window.location.href = initPoint;
    } else {
        throw new Error('Browser environment is required for redirecting to payment gateway.');
    }
};

const onProcessCardPayment = async () => {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();
        if (!cartId) {
            throw new Error('No cart ID found while processing upon delivery payment');
        }
        const response = await createMpPreference(cartId);
        if (!response) {
            throw new Error('No se pudo crear la preferencia de pago de Mercado Pago.');
        }
        if (!response.mp_preference) {
            throw new Error('La respuesta de Mercado Pago es inválida.');
        }

        if (!response.mp_preference.preference) {
            throw new Error('La preferencia de pago de Mercado Pago es inválida.');
        }
        if (response.mp_preference.preference.status) {
            if (response.mp_preference.preference.status !== 200) {
                throw new Error('No se pudo crear la preferencia de pago de Mercado Pago.' + response.mp_preference.preference.message);
            }
        }
        console.log(response);

        const initPoint = response.mp_preference.preference.init_point;
        handleBrowserCheckout(initPoint);

    } catch (error) {
        throw error;
    }

}

const onProcessUponDeliveryPayment = async () => {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();
        if (!cartId) {
            throw new Error('No cart ID found while processing upon delivery payment');
        }
        const response = await updateCartDeliveryInfo(cartId, { status: 3 });
        if (!response) {
            throw new Error('No se pudo actualizar el estado del carrito para pago contraentrega.');
        }
        const updatedCart = response;
        redirect(`/order-confirmation/${cartId}`);
    } catch (error) {
        throw error;
    }
}

export const processPayment = async (selectedPaymentMethod: string) => {
    try {
        console.log('selectedPaymentMethod',selectedPaymentMethod);
        
        if (selectedPaymentMethod === 'card') {
            await onProcessCardPayment();
            return;
        }
        await onProcessUponDeliveryPayment();
    } catch (error) {
        throw error;
    }
}

export async function setCustomerForOrder(): Promise<ShopCart> {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();
        if (!cartId) {
            throw new Error('No cart ID found while updating cart for delivery');
        }
        const response = await shopModel.onSetCustomerToCart(cartId);
        return response;
    } catch (error: unknown) {
        throw error;
    }
}


export async function fetchDeliveryItem(): Promise<InterfaceInventoryItem | null> {
    try {
        const shopModel = useShopModel();
        const results = await shopModel.fetchDeliveryConcept();
        return results.length > 0 ? results[0] : null;
    } catch (error) {
        console.error('Error fetching delivery item:', error);
        throw error;
    }
}

export async function updateCartForDelivery(deliveryServiceItem: InterfaceInventoryItem) {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();

        if (!cartId) {
            throw new Error('No cart ID found while updating cart for delivery');
        }
        return await shopModel.onUpdateCartForDelivery(cartId, deliveryServiceItem);
    } catch (error) {
        console.error('Error fetching delivery item:', error);
        throw error;
    }
}

export async function updateCartForPickup(deliveryServiceItem?: InterfaceInventoryItem | null) {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();

        if (!cartId) {
            throw new Error('No cart ID found while updating cart for pickup');
        }
        return await shopModel.onUpdateCartForPickup(cartId, deliveryServiceItem as InterfaceInventoryItem);
    } catch (error) {
        console.error('Error fetching delivery item:', error);
        throw error;
    }
}

export async function fetchAddresses() {
    try {
        const userModel = useUserModel();
        const addresses = await userModel.getUserAddresses();
        return addresses;
    }
    catch (error) {
        console.error('Error fetching user addresses:', error);
        throw error;
    }

}


