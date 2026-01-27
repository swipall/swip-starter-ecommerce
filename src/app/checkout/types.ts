/**
 * Types for checkout flow
 * These are based on the REST API Order response structure
 */

import { Order, ShopCartItem } from "@/lib/swipall/types/types";


// Re-export the REST Order type as CheckoutOrder for now
// Later we can create a custom mapped type if needed
export type CheckoutOrder = Order;

// Re-export OrderLine from REST adapter
export type OrderLine = ShopCartItem;

export interface ShippingAddress {
    id?: string;
    fullName?: string;
    company?: string;
    streetLine1?: string;
    streetLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phoneNumber?: string;
}

export type BillingAddress = ShippingAddress;
