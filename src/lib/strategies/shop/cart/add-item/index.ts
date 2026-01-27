/**
 * Exportaciones centralizadas para las estrategias de añadir al carrito.
 * 
 * Utiliza el patrón Strategy para manejar diferentes tipos de productos
 * con lógica específica para cada uno.
 */

export { AddItemToCartStrategy } from './add-item-strategy.interface';
export { AddSimpleItemToCartStrategy } from './add-simple-item-to-cart.strategy';
export { AddCompoundItemToCartStrategy } from './add-compound-item-to-cart.strategy';
export { AddItemStrategyFactory } from './add-item-strategy.factory';
