'use server';

import useShopModel from '@/lib/models/shop.model';
import { AddItemStrategyFactory } from '@/lib/strategies/shop/cart/add-item/add-item-strategy.factory';
import { fetchCompoundMaterials, getGroupVariantByTaxonomies } from '@/lib/swipall/inventory';
import { AddProductToCartBody, getProduct, testCreatePosCart } from '@/lib/swipall/rest-adapter';
import { updateTag } from 'next/cache';
import { getAuthUserCustomerId } from '@/lib/auth';

export { getGroupVariantByTaxonomies };

/**
 * Add an item to the shopping cart using the appropriate strategy based on product type.
 * @param itemId - ID of the product or variant to add
 * @param params - Additional parameters (quantity, extra materials, price)
 * @returns Result of the operation
 */
export async function addToCart(
    itemId: string,
    params: AddProductToCartBody
) {
    try {        
        const shopModel = useShopModel();
        let cartId = await shopModel.getCurrentCartId();
        if (!cartId) {
            const newCart = await shopModel.onCreateNewCart();
            cartId = newCart.id;
        }        
        const customerId = await getAuthUserCustomerId();
        const product = await getProduct(itemId, customerId);        
        const strategyFactory = new AddItemStrategyFactory(shopModel);
        const strategy = strategyFactory.getStrategy(product);
        const result = await strategy.addItemToCart(cartId, itemId, params);
        updateTag('cart');
        updateTag('active-order');

        return { success: true, data: result.data };
    } catch (error: any) {
        if(error.status === 404){
            // Clear cartId if item not found
            const shopModel = useShopModel();
            await shopModel.removeCurrentCartId();
            return { success: false, error: 'Ocurrió un error al añadir el producto al carrito, por favor inténtalo de nuevo.' };
        }        
        const message = error instanceof Error ? error.message : 'Failed to add item to cart';
        return { success: false, error: message };
    }
}

export async function getGroupVariant(itemId: string, params?: any) {
    try {
        const res = await getGroupVariantByTaxonomies(itemId, params);
        return res;
    } catch (error: unknown) {
        throw error;
    }
}

export async function getCompoundMaterials(itemId: string, params?: any) {
    try {
        const res = await fetchCompoundMaterials(itemId, params, true);// this always require auth token
        return res;
    } catch (error: unknown) {
        throw error;
    }
}

//TODO: Remove this after testing
export async function testApiMiddleWare() {
    try {
        const product = await testCreatePosCart({ store: 'store_123', customer: 'customer_456' });
        return product;
    } catch (error: unknown) {
        throw error;
    }
}