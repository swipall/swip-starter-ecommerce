import { CartItems } from "@/app/cart/cart-items";
import { OrderSummary } from "@/app/cart/order-summary";
import { getActiveOrder } from '@/lib/swipall/rest-adapter';
import { SwipallAPIError } from '@/lib/swipall/api';
import {PromotionCode} from '@/app/cart/promotion-code';
import { getAuthToken } from '@/lib/auth';
import { getCustomerInfoServer } from '@/lib/swipall/users/server';

export async function Cart() {
    "use cache: private"

    let activeOrder = null;
    let minimalAmount: number | null = null;

    try {
        const result = await getActiveOrder({ useAuthToken: true, mutateCookies: false });
        activeOrder = result || null;
    } catch (error) {
        if (error instanceof SwipallAPIError && error.status === 404) {
            // Stale cart cookie — surface as empty cart. The caller (outside
            // this cache scope) is responsible for clearing the cookie.
            throw error;
        }
        console.error('[Cart] Failed to fetch active order:', error);
    }

    try {
        const token = await getAuthToken();
        if (token) {
            const customerInfo = await getCustomerInfoServer();
            minimalAmount = customerInfo?.price_list?.minimal_amount ?? null;
        }
    } catch {
        // best-effort
    }

    // Handle empty cart case
    if (!activeOrder || !activeOrder.lines || activeOrder.lines.length === 0) {
        return <CartItems activeOrder={null}/>;
    }

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <CartItems activeOrder={activeOrder as any}/>

            <div className="lg:col-span-1">
                <OrderSummary activeOrder={activeOrder as any} minimalAmount={minimalAmount}/>
                <PromotionCode activeOrder={activeOrder as any}/>
            </div>
        </div>
    )
}