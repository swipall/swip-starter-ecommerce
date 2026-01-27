

import useShopModel from "@/lib/models/shop.model";
import { AddItemToCartParams, InterfaceApiDetailResponse, InterfaceInventoryItem, ShopCartItem } from "@/lib/swipall/types/types";
import { AddItemToCartStrategy } from "./add-item-strategy.interface";

/**
 * Estrategia para añadir productos compuestos al carrito.
 * 
 * Los productos compuestos incluyen materiales extra que se añaden junto con el producto base.
 * Cada producto compuesto se trata como único debido a sus materiales personalizados.
 */
export class AddCompoundItemToCartStrategy implements AddItemToCartStrategy {
    private shopModel: ReturnType<typeof useShopModel>;

    constructor(shopModel: ReturnType<typeof useShopModel>) {
        this.shopModel = shopModel;
    }
    
    async addItemToCart(cartId: string, itemId: string, body: AddItemToCartParams): Promise<InterfaceApiDetailResponse<ShopCartItem>> {
        // Los productos compuestos siempre se añaden como nuevos items
        // debido a que pueden tener diferentes combinaciones de materiales
        return this.shopModel.addItemToCart(cartId, { id: itemId } as InterfaceInventoryItem, body);
    }
    
    canHandle(item: InterfaceInventoryItem): boolean {
        return item.kind === 'compound';
    }
}