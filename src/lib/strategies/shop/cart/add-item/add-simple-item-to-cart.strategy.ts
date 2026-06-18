
import useShopModel from "@/lib/models/shop.model";
import { AddProductToCartBody } from "@/lib/swipall/rest-adapter";
import { InterfaceApiDetailResponse, InterfaceInventoryItem, ShopCartItem } from "@/lib/swipall/types/types";
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
    
    async addItemToCart(cartId: string, itemId: string, body: AddProductToCartBody, product?: InterfaceInventoryItem): Promise<InterfaceApiDetailResponse<ShopCartItem>> {
        const availableQty = product?.available?.quantity ?? Infinity;

        // Verificar si el item ya existe en el carrito
        const result = await this.shopModel.checkIfItemExistsInCart(itemId);

        if (result.count > 0) {
            const itemInCart = result.results[0];
            const newQuantity = itemInCart.quantity + body.quantity;

            if (newQuantity > availableQty) {
                throw new Error(`Solo hay ${availableQty} unidad${availableQty === 1 ? '' : 'es'} disponible${availableQty === 1 ? '' : 's'} y ya tienes ${itemInCart.quantity} en el carrito`);
            }

            return this.shopModel.updateItemInCart(cartId, itemInCart.id, { quantity: newQuantity });
        }

        if (body.quantity > availableQty) {
            throw new Error(`Solo hay ${availableQty} unidad${availableQty === 1 ? '' : 'es'} disponible${availableQty === 1 ? '' : 's'}`);
        }

        return this.shopModel.addItemToCart(cartId, { id: itemId } as InterfaceInventoryItem, body);
    }
    
    canHandle(item: InterfaceInventoryItem): boolean {
        // Maneja tanto productos simples como grupos
        return item.kind === 'product' || item.kind === 'group';
    }
}