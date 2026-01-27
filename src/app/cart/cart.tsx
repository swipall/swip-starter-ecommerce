import { CartItems } from "@/app/cart/cart-items";
import { OrderSummary } from "@/app/cart/order-summary";
import { getActiveOrder } from '@/lib/swipall/rest-adapter';
import {PromotionCode} from '@/app/cart/promotion-code';

export async function Cart() {
    "use cache: private"

    let activeOrder = null;
    
    try {
        const result = await getActiveOrder({ useAuthToken: true, mutateCookies: false });
        activeOrder = result || null;
    } catch (error) {
        console.error('[Cart] Failed to fetch active order:', error);
        // Continue with empty cart if API fails
    }

    // Handle empty cart case
    if (!activeOrder || !activeOrder.lines || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <CartItems activeOrder={activeOrder as any}/>

            <div className="lg:col-span-1">
                <OrderSummary activeOrder={activeOrder as any}/>
                <PromotionCode activeOrder={activeOrder as any}/>
            </div>
        </div>
    )
}