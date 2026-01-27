
import useShopModel from "@/lib/models/shop.model";
import { AddItemToCartParams, InterfaceApiDetailResponse, InterfaceInventoryItem, ShopCartItem } from "@/lib/swipall/types/types";
import { AddItemToCartStrategy } from "./add-item-strategy.interface";

/**
 * Estrategia para añadir productos simples y variantes de grupos al carrito.
 * 
 * - Para productos simples: verifica si ya existe y actualiza cantidad
 * - Para grupos: el itemId será el ID de la variante seleccionada
 */
export class AddSimpleItemToCartStrategy implements AddItemToCartStrategy {
    private shopModel: ReturnType<typeof useShopModel>;

    constructor(shopModel: ReturnType<typeof useShopModel>) {
        this.shopModel = shopModel;
    }
    
    async addItemToCart(cartId: string, itemId: string, body: AddItemToCartParams): Promise<InterfaceApiDetailResponse<ShopCartItem>> {
        // Verificar si el item ya existe en el carrito
        const result = await this.shopModel.checkIfItemExistsInCart(itemId);
        
        if (result.count > 0) {
            // Si existe, actualizar la cantidad
            const itemInCart = result.results[0];
            return this.shopModel.updateItemInCart(cartId, itemInCart.id, { 
                quantity: itemInCart.quantity + body.quantity 
            });
        }
        
        // Si no existe, añadir nuevo item
        return this.shopModel.addItemToCart(cartId, { id: itemId } as InterfaceInventoryItem, body);
    }
    
    canHandle(item: InterfaceInventoryItem): boolean {
        // Maneja tanto productos simples como grupos
        return item.kind === 'product' || item.kind === 'group';
    }
}