import useShopModel from "@/lib/models/shop.model";
import { AddProductToCartBody } from "@/lib/swipall/rest-adapter";
import { InterfaceApiDetailResponse, InterfaceInventoryItem, ShopCartItem } from "@/lib/swipall/types/types";
import { AddItemToCartStrategy } from "./add-item-strategy.interface";

export class AddServiceItemToCartStrategy implements AddItemToCartStrategy {
    private shopModel: ReturnType<typeof useShopModel>;

    constructor(shopModel: ReturnType<typeof useShopModel>) {
        this.shopModel = shopModel;
    }

    async addItemToCart(cartId: string, itemId: string, body: AddProductToCartBody, _product?: InterfaceInventoryItem): Promise<InterfaceApiDetailResponse<ShopCartItem>> {
        const result = await this.shopModel.checkIfItemExistsInCart(itemId);

        if (result.count > 0) {
            const itemInCart = result.results[0];
            return this.shopModel.updateItemInCart(cartId, itemInCart.id, { quantity: body.quantity, price: body.price });
        }

        return this.shopModel.addItemToCart(cartId, { id: itemId } as InterfaceInventoryItem, body);
    }

    canHandle(item: InterfaceInventoryItem): boolean {
        return item.kind === 'service';
    }
}
