import type {Metadata} from 'next';
import {Cart} from "@/app/cart/cart";
import {CartItems} from "@/app/cart/cart-items";
import {Suspense} from "react";
import {CartSkeleton} from "@/components/shared/skeletons/cart-skeleton";
import {noIndexRobots} from '@/lib/metadata';
import {clearCartId} from '@/lib/cart';
import {SwipallAPIError} from '@/lib/swipall/api';

export const metadata: Metadata = {
    title: 'Carrito de compras',
    description: 'Revisa los artículos en tu carrito de compras.',
    robots: noIndexRobots(),
};

async function CartBoundary() {
    try {
        return await Cart();
    } catch (error) {
        if (error instanceof SwipallAPIError && error.status === 404) {
            await clearCartId();
            return <CartItems activeOrder={null} />;
        }
        throw error;
    }
}

export default function CartPage(_props: PageProps<'/cart'>) {
    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-8">Carrito de compras</h1>

            <Suspense fallback={<CartSkeleton />}>
                <CartBoundary/>
            </Suspense>
        </div>
    );
}
