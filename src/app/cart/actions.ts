'use server';

import { getAuthToken } from '@/lib/auth';
import { getCartId } from '@/lib/cart';
import useShopModel from '@/lib/models/shop.model';
import {
    applyPromotionCode as apiApplyPromotion,
    removeFromCart as apiRemoveFromCart,
    removePromotionCode as apiRemovePromotion,
    repriceCart,
} from '@/lib/swipall/rest-adapter';
import { updateTag } from 'next/cache';

export async function removeFromCart(lineId: string) {
    try {
        await apiRemoveFromCart(lineId, { useAuthToken: true });
        updateTag('cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
}

export async function adjustQuantity(lineId: string, quantity: number) {
    try {
        const shopModel = useShopModel();
        const cartId = await shopModel.getCurrentCartId();

        if (!cartId) {
            throw new Error('No cart ID found while adjusting quantity');
        }

        await shopModel.updateItemInCart(cartId, lineId, { quantity });
        updateTag('cart');
    } catch (error) {
        console.error('Error adjusting quantity:', error);
        throw error;
    }
}

export async function applyPromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    try {
        const res = await apiApplyPromotion(code, { useAuthToken: true });
        updateTag('cart');
    } catch (error) {
        console.error('Error applying promotion:', error);
        throw error;
    }
}

export async function removePromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    try {
        const res = await apiRemovePromotion(code, { useAuthToken: true });
        updateTag('cart');
    } catch (error) {
        console.error('Error removing promotion:', error);
        throw error;
    }
}

// Reprica el carrito cuando la price_list del cliente cambió.
// Retorna true si el repricing se ejecutó, false si no había carrito o no hay cambio.
// Errores silenciados — best-effort.
export async function repricePriceListCart(
    localPriceListId: string | null | undefined,
    remotePriceListId: string | null | undefined
): Promise<boolean> {
    if (localPriceListId === remotePriceListId) return false;
    try {
        const cartId = await getCartId();
        if (!cartId) return false;
        await repriceCart(cartId);
        updateTag('cart');
        return true;
    } catch {
        return false;
    }
}

export async function isUserAuthenticated(): Promise<boolean> {
    try {
        const token = await getAuthToken();
        return Boolean(token);
    } catch (error) {
        return false;
    }
}
