'use server';

import { getAuthToken } from '@/lib/auth';
import useShopModel from '@/lib/models/shop.model';
import {
    applyPromotionCode as apiApplyPromotion,
    removeFromCart as apiRemoveFromCart,
    removePromotionCode as apiRemovePromotion
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

export async function isUserAuthenticated(): Promise<boolean> {
    try {
        const token = await getAuthToken();
        return Boolean(token);
    } catch (error) {
        return false;
    }
}
