import {cacheLife, cacheTag} from 'next/cache';
import {CartIcon} from './cart-icon';
import { getActiveOrder } from '@/lib/swipall/rest-adapter';

export async function NavbarCart() {
    'use cache: private';
    cacheLife('minutes');
    cacheTag('cart');
    cacheTag('active-order');

    try {
        const order = await getActiveOrder({ useAuthToken: true });
        console.log(order);
        
        const cartItemCount = order?.data?.count_items.count || 0;
        return <CartIcon cartItemCount={cartItemCount} />;
    } catch (error) {
        // During build or when API is unavailable, show cart with 0 items
        return <CartIcon cartItemCount={0} />;
    }
}
