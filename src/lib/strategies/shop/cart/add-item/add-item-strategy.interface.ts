import { AddItemToCartParams, InterfaceApiDetailResponse, InterfaceInventoryItem, ShopCartItem } from "@/lib/swipall/types/types";

/**
 * Interfaz para las estrategias de añadir items al carrito.
 * 
 * Implementa el patrón Strategy para manejar diferentes tipos de productos
 * (simples, grupos, compuestos) con lógica específica para cada uno.
 */
export interface AddItemToCartStrategy {
    /**
     * Añade un item al carrito.
     * @param cartId - ID del carrito
     * @param itemId - ID del producto o variante
     * @param body - Parámetros del item (cantidad, materiales extra, precio)
     * @returns Respuesta con el item añadido al carrito
     */
    addItemToCart(cartId: string, itemId: string, body: AddItemToCartParams): Promise<InterfaceApiDetailResponse<ShopCartItem>>;
    
    /**
     * Determina si esta estrategia puede manejar el tipo de producto dado.
     * @param item - El producto a verificar
     * @returns true si la estrategia puede manejar este tipo de producto
     */
    canHandle(item: InterfaceInventoryItem): boolean;
}