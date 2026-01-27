
import useShopModel from "@/lib/models/shop.model";
import { AddCompoundItemToCartStrategy } from "./add-compound-item-to-cart.strategy";
import { AddSimpleItemToCartStrategy } from "./add-simple-item-to-cart.strategy";
import { InterfaceInventoryItem } from "@/lib/swipall/types/types";
import { AddItemToCartStrategy } from "./add-item-strategy.interface";

/**
 * Factory para crear la estrategia correcta de añadir al carrito según el tipo de producto.
 * 
 * Estrategias disponibles:
 * - Simple: Para productos normales y variantes de grupos
 * - Compound: Para productos compuestos con materiales extra
 */
export class AddItemStrategyFactory {
    private simpleProductStrategy: AddSimpleItemToCartStrategy;
    private compoundProductStrategy: AddCompoundItemToCartStrategy;
    
    constructor(shopModel: ReturnType<typeof useShopModel>) {
        this.simpleProductStrategy = new AddSimpleItemToCartStrategy(shopModel);
        this.compoundProductStrategy = new AddCompoundItemToCartStrategy(shopModel);
    }

    /**
     * Obtiene la estrategia apropiada basándose en el tipo de producto.
     * @param item - El producto para el cual obtener la estrategia
     * @returns La estrategia correspondiente
     */
    getStrategy(item: InterfaceInventoryItem): AddItemToCartStrategy {
        if (this.compoundProductStrategy.canHandle(item)) {
            return this.compoundProductStrategy;
        }
        
        if (this.simpleProductStrategy.canHandle(item)) {
            return this.simpleProductStrategy;
        }
        
        // Por defecto, usar estrategia simple
        console.warn(`Unknown product kind: ${item.kind}, using simple product strategy`);
        return this.simpleProductStrategy;
    }
}