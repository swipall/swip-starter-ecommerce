import { clearCartId, getCartId, setCartId } from '../cart';
import { addProductToCart, createShopCart, fetchDeliveryItem, itemExistsInCart, setCustomerToCart, updateCartDeliveryInfo, updateProductInCart } from '../swipall/rest-adapter';
import { AddItemToCartParams, InterfaceInventoryItem, ShopCart } from '../swipall/types/types';
import { removeFromCart } from '@/app/cart/actions';

export default function useShopModel() {

    const getCurrentCartId = async (): Promise<string | null> => {
        const cartId = await getCartId();
        return cartId || null;
    }

    const removeCurrentCartId = async (): Promise<void> => {
        await clearCartId();
    }

    const onCreateNewCart = async (): Promise<ShopCart> => {
        const response = await createShopCart();
        if(!response){
            throw new Error("Failed to create a new cart");
        }        
        await setCartId(response.id);
        return response;
    }

    const checkIfItemExistsInCart = async (itemId: string) => {
        try {
            const cartId = await getCurrentCartId();
            if (!cartId) {
                throw new Error("No cart ID found");
            }            
            const itemExists = await itemExistsInCart(cartId, itemId);            
            return itemExists;
        } catch (error) {
            console.error("Error checking if item exists in cart:", error);
            throw error;
        }
    }


    const insertItemInCart = async (cartId: string, itemId: string, { quantity, extra_materials, price }: AddItemToCartParams) => {
        try {
            return await addProductToCart(cartId, { item: itemId, quantity, extra_materials, price });
        } catch (error) {
            throw error;
        }
    }

    const addItemToCart = async (cartId: string, item: InterfaceInventoryItem, { quantity, extra_materials, price }: AddItemToCartParams) => {
        try {
            if (!cartId) {
                throw new Error("No cart ID provided");
            }
            return await insertItemInCart(cartId, item.id, { quantity, extra_materials, price });
        } catch (error) {
            throw error;
        }
    };

    const updateItemInCart = async (cartId: string, itemId: string, body: { quantity: number }) => {
        try {
            if (!cartId) {
                throw new Error("No cart ID provided");
            }
            return await updateProductInCart(itemId, body);
        } catch (error) {
            throw error;
        }
    }


    const removeItemFromCart = async (itemId: string) => {
        try {
            return await removeFromCart(itemId);
        } catch (error) {
            console.error("Error removing item from cart", error);
            throw error;
        }
    }

    const fetchDeliveryConcept = async () => {
        try {
            return (await fetchDeliveryItem()).results || [];
        } catch (error) {
            throw error;
        }
    }

    const onUpdateCartForDelivery = async (cartId: string, deliveryServiceItem: InterfaceInventoryItem) => {
        try {
            const exists = await itemExistsInCart(cartId, deliveryServiceItem.id);
            if (exists.count === 0) {
                //we add the delivery service item to the cart
                await insertItemInCart(cartId, deliveryServiceItem.id, { quantity: 1, extra_materials: [], price: parseFloat(deliveryServiceItem.app_price || "0") });
            }
            return await updateCartDeliveryInfo(cartId, { for_delivery: true, for_pickup: false });
        } catch (error) {
            console.error("Error updating cart for delivery", error);
            throw error;
        }
    }

    const onUpdateCartForPickup = async (cartId: string, deliveryServiceItem: InterfaceInventoryItem) => {
        try {
            if (deliveryServiceItem) {
                const exists = await itemExistsInCart(cartId, deliveryServiceItem.id);
                if (exists.count > 0) {
                    const itemId = exists.results[0].id;
                    await removeFromCart(itemId);
                }
            }
            return await updateCartDeliveryInfo(cartId, { for_pickup: true, for_delivery: false, shipment_address: null, external_reference: null });
        } catch (error) {
            throw error;
        }
    }

    const onSetCustomerToCart = async (cartId: string) => {
        try {
            return await setCustomerToCart(cartId);
        } catch (error) {
            throw error;
        }
    }

    return {
        addItemToCart,
        onCreateNewCart,
        getCurrentCartId,
        checkIfItemExistsInCart,
        updateItemInCart,
        removeItemFromCart,
        fetchDeliveryConcept,
        onUpdateCartForDelivery,
        onUpdateCartForPickup,
        onSetCustomerToCart,
        removeCurrentCartId
    };
}