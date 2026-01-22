'use server';

import { addToCart as apiAddToCart } from '@/lib/swipall/rest-adapter';
import { updateTag } from 'next/cache';

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const result = await apiAddToCart({ variantId, quantity }, { useAuthToken: true });

    // Revalidate cart data across all pages
    updateTag('cart');
    updateTag('active-order');
    return { success: true, order: result.data };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add item to cart';
    return { success: false, error: message };
  }
}
