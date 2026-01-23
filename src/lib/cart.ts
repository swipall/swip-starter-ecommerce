import {cookies} from 'next/headers';

const CART_ID_COOKIE = process.env.SWIPALL_CART_ID_COOKIE || 'swipall-cart-id';

export async function getCartId(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CART_ID_COOKIE)?.value;
}

export async function setCartId(cartId: string) {
    const cookieStore = await cookies();
    cookieStore.set(CART_ID_COOKIE, cartId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function clearCartId() {
    const cookieStore = await cookies();
    cookieStore.delete(CART_ID_COOKIE);
}
