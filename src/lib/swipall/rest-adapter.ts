/**
 * REST API Adapter for Swipall
 * 
 * This file provides helper functions to map the ecommerce operations
 * to REST API endpoints and handle response transformation.
 * 
 * The API follows a REST structure like:
 * - GET /api/auth/me - Get current user
 * - POST /api/auth/login - Login
 * - POST /api/auth/logout - Logout
 * - GET /api/products - Get products
 * - GET /api/products/{id} - Get product detail
 * - POST /api/cart/items - Add to cart
 * - GET /api/orders - Get user orders
 * etc.
 */

import { clearCartId, getCartId, setCartId } from '@/lib/cart';
import { get, patch, post, remove } from './api';

// ============================================================================
// Authentication Endpoints
// ============================================================================

export interface LoginInput {
    email: string;
    password: string;
}

export interface UserInterface {
    first_name: string;
    last_name: string;
    pk: string;
}

export interface LoginResponse {
    user: UserInterface;
    access_token: string;
    refresh_token: string;
}

export async function login(credentials: LoginInput): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/shop/login/', credentials);
}

export async function logout(options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/auth/logout', undefined, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Customer/User Endpoints
// ============================================================================

export interface CurrentUser {
    id?: string;
    pk?: string;
    identifier?: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    emailAddress?: string;
    email?: string;
    phoneNumber?: string;
    phone?: string;
    addresses?: Address[];
}

export interface Address {
    id: string;
    fullName: string;
    company?: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode: string;
    country: {
        id: string;
        code: string;
        name: string;
    };
    phoneNumber?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
}

export async function getActiveCustomer(options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<CurrentUser>> {
    return get<InterfaceApiDetailResponse<CurrentUser>>('/auth/me', { useAuthToken: options?.useAuthToken });
}

export interface UpdateCustomerInput {
    firstName?: string;
    lastName?: string;
}

export async function updateCustomer(input: UpdateCustomerInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<CurrentUser>> {
    return patch<InterfaceApiDetailResponse<CurrentUser>>('/customers/me', input, { useAuthToken: options?.useAuthToken });
}

export async function updateCustomerPassword(
    currentPassword: string,
    newPassword: string,
    options?: { useAuthToken?: boolean }
): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/customers/me/password', { currentPassword, newPassword }, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Customer Address Endpoints
// ============================================================================

export interface CreateAddressInput {
    fullName: string;
    company?: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode: string;
    countryCode: string;
    phoneNumber?: string;
    defaultShippingAddress?: boolean;
    defaultBillingAddress?: boolean;
}

export async function createCustomerAddress(input: CreateAddressInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Address>> {
    return post<InterfaceApiDetailResponse<Address>>('/customers/me/addresses', input, { useAuthToken: options?.useAuthToken });
}

export async function updateCustomerAddress(id: string, input: Partial<CreateAddressInput>, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Address>> {
    return patch<InterfaceApiDetailResponse<Address>>(`/customers/me/addresses/${id}`, input, { useAuthToken: options?.useAuthToken });
}

export async function deleteCustomerAddress(id: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return remove<InterfaceApiDetailResponse<{ success: boolean }>>(`/customers/me/addresses/${id}`, { useAuthToken: options?.useAuthToken });
}

export async function setDefaultShippingAddress(id: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Address>> {
    return patch<InterfaceApiDetailResponse<Address>>(`/customers/me/addresses/${id}`, { defaultShippingAddress: true }, { useAuthToken: options?.useAuthToken });
}

export async function setDefaultBillingAddress(id: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Address>> {
    return patch<InterfaceApiDetailResponse<Address>>(`/customers/me/addresses/${id}`, { defaultBillingAddress: true }, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Product Endpoints
// ============================================================================

export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    featuredAsset?: Asset;
    variants: ProductVariant[];
    collections?: Collection[];
}

export interface InventoryAvailable {
    id: string;
    quantity: number;
}

export interface InventoryPicture {
    id: string;
    url: string;
}


export interface InterfaceInventoryItem {
    attribute_combinations: any[];
    available?: InventoryAvailable;
    barcode: string | null;
    featured_image: string | null;
    id: string;
    kind: 'group' | 'product' | 'compound';
    name: string;
    pictures: InventoryPicture[] | null;
    sku: string;
    slug: string;
    taxonomy: TaxonomyInterface[];
    web_price: string;
    extra_materials?: any[];
    description?: string;
    app_price?: string;
    collections?: Collection[];
    featuredAsset?: Asset;
    variants?: ProductVariant[];
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: number;
    priceWithTax: number;
    stock: number;
}

export interface Asset {
    id: string;
    name: string;
    preview: string;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
}

export interface CatalogsParams {
    parent__slug?: string;
}

interface CatalogSettings {
    url: string;
}

export interface CatalogInterface {
    code: string | null;
    id: string;
    kind: string;
    name: string;
    ordering: number;
    parent: CatalogInterface | null;
    settings: CatalogSettings | null;
    slug: string;
}

export interface TaxonomyInterface {
    id: string;
    name: string;
    slug: string;
    value: string | null;
    thumbnail?: string;
    icon?: string;
    color?: string;
    imagen?: string;
}

export interface InterfaceApiListResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

export interface InterfaceApiDetailResponse<T> {
    data?: T;
    [key: string]: unknown;
}

export async function getProduct(id: string): Promise<InterfaceApiDetailResponse<InterfaceInventoryItem>> {
    const endpoint = `/api/v1/shop/item/${id}`;
    console.log(`[getProduct] Fetching from endpoint: ${endpoint}`);
    return get<InterfaceApiDetailResponse<InterfaceInventoryItem>>(endpoint);
}

export async function getCollection(slug: string): Promise<InterfaceApiDetailResponse<Collection>> {
    return get<InterfaceApiDetailResponse<Collection>>(`/collections/${slug}`);
}

export async function getTaxonomies(params: any): Promise<InterfaceApiListResponse<TaxonomyInterface>> {
    return get<InterfaceApiListResponse<TaxonomyInterface>>('/api/v1/shop/taxonomies', params);
}

export async function getCatalogs(params?: CatalogsParams): Promise<InterfaceApiListResponse<CatalogInterface>> {
    return get<InterfaceApiListResponse<CatalogInterface>>('/api/v1/utils/catalogs', params);
}

export async function getAvailableCountries(): Promise<InterfaceApiListResponse<{ id: string; code: string; name: string }>> {
    return get<InterfaceApiListResponse<{ id: string; code: string; name: string }>>('/countries');
}

export async function getActiveChannel(): Promise<InterfaceApiDetailResponse<any>> {
    return get<InterfaceApiDetailResponse<any>>('/channel');
}

export async function getCustomerAddresses(options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<Address>> {
    return get<InterfaceApiListResponse<Address>>('/customers/me/addresses', { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Search Endpoints
// ============================================================================

export interface SearchInput {
    offset?: number;
    limit?: number;
    search?: string;
    ordering?: string;
}

// SearchResult is now an alias for InterfaceApiListResponse<InterfaceInventoryItem>
export type SearchResult = InterfaceApiListResponse<InterfaceInventoryItem>;

export async function searchProducts(input: SearchInput): Promise<SearchResult> {
    const params = new URLSearchParams();
    if (input.search) params.append('search', input.search);
    if (input.offset) params.append('offset', String(input.offset));
    if (input.limit) params.append('limit', String(input.limit));
    if (input.ordering) params.append('ordering', input.ordering);
    const endpoint = `/api/v1/shop/items`;
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(endpoint, params);
}

// ============================================================================
// Cart/Order Endpoints
// ============================================================================

export interface OrderLine {
    id: string;
    productVariant: {
        id: string;
        name: string;
        sku: string;
        product: {
            id: string;
            name: string;
            slug: string;
            featuredAsset?: Asset;
        };
    };
    unitPriceWithTax: number;
    quantity: number;
    linePriceWithTax: number;
}

export interface Order extends ShopCart {
    lines: ShopCartItem[];
}

export interface AddressInterface {
    id: string;
    address: string;
    suburb: string;
    postal_code: string;
    city: string;
    state: string
    country: string
    receiver?: string;
    references?: string;
    mobile?: string;
}

export interface ShopCart {
    count_items: {
        count: number | null;
    };
    created_at: string;
    discount_total: string;
    expired_at: string | null;
    grand_total: string;
    id: string;
    ieps_total: string;
    isr_total: string;
    kind: string;
    shipment_address: string | AddressInterface | null;
    source: number;
    sub_total: string;
    tax_total: string;
    updated_at: string;
    for_pickup: boolean;
    for_delivery: boolean;
}

interface ShopCartItemBase {
    id: string;
    allow_serial_numbers: boolean;
    attribute_combinations: any[];
    barcode: string;
    featured_image: string | null;
    name: string;
    sku: string;
}

export interface ShopCartItem {
    base: string;
    extra_fields: any[];
    extra_materials: any[];
    id: string;
    item: ShopCartItemBase;
    kind: string;
    properties: any[];
    quantity: number;
    serial_number: string | null;
    sub_total: string;
    total: string;
}

export async function getActiveOrder(options?: { useAuthToken?: boolean; cartId?: string }): Promise<InterfaceApiDetailResponse<Order>> {
    const storedCartId = options?.cartId || await getCartId();

    if (!storedCartId) {
        return { data: undefined } as InterfaceApiDetailResponse<Order>;
    }

    try {
        const [cartResponse, itemsResponse] = await Promise.all([
            get<InterfaceApiDetailResponse<ShopCart>>(`/api/v1/shop/cart/${storedCartId}`, undefined, { useAuthToken: options?.useAuthToken }),
            get<InterfaceApiDetailResponse<ShopCartItem[]> | InterfaceApiListResponse<ShopCartItem>>(
                `/api/v1/shop/cart/${storedCartId}/items`,
                undefined,
                { useAuthToken: options?.useAuthToken }
            ),
        ]);

        const cartData = cartResponse?.data;
        const itemLines = Array.isArray((itemsResponse as InterfaceApiDetailResponse<ShopCartItem[]>)?.data)
            ? (itemsResponse as InterfaceApiDetailResponse<ShopCartItem[]>)?.data || []
            : Array.isArray((itemsResponse as InterfaceApiListResponse<ShopCartItem>)?.results)
                ? (itemsResponse as InterfaceApiListResponse<ShopCartItem>).results
                : [];

        const orderWithLines = cartData ? { ...cartData, lines: itemLines } as Order : undefined;

        if (orderWithLines?.id) {
            await setCartId(orderWithLines.id);
        }

        return { ...cartResponse, data: orderWithLines } as InterfaceApiDetailResponse<Order>;
    } catch (error) {
        await clearCartId();
        console.error('[getActiveOrder] Failed to fetch cart:', error);
        return { data: undefined } as InterfaceApiDetailResponse<Order>;
    }
}

export const createShopCart = async (): Promise<InterfaceApiDetailResponse<ShopCart>> => {
    return post<InterfaceApiDetailResponse<ShopCart>>('/api/v1/shop/cart/', {});
}

export interface AddToCartInput {
    variantId: string;
    quantity: number;
}

export async function addToCart(input: AddToCartInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    const cartId = await getCartId();
    const endpoint = cartId ? `/api/v1/shop/cart/${cartId}/items` : '/api/v1/shop/cart/items';

    const result = await post<InterfaceApiDetailResponse<Order>>(endpoint, input, { useAuthToken: options?.useAuthToken });

    if (result?.data?.id) {
        await setCartId(result.data.id);
    }

    return result;
}

export async function removeFromCart(lineId: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    const cartId = await getCartId();
    const endpoint = cartId ? `/api/v1/shop/cart/${cartId}/items/${lineId}` : `/cart/items/${lineId}`;

    const result = await remove<InterfaceApiDetailResponse<Order>>(endpoint, { useAuthToken: options?.useAuthToken });

    if (result?.data?.id) {
        await setCartId(result.data.id);
    }

    return result;
}

export async function adjustQuantity(lineId: string, quantity: number, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    const cartId = await getCartId();
    const endpoint = cartId ? `/api/v1/shop/cart/${cartId}/items/${lineId}` : `/cart/items/${lineId}`;

    const result = await patch<InterfaceApiDetailResponse<Order>>(endpoint, { quantity }, { useAuthToken: options?.useAuthToken });

    if (result?.data?.id) {
        await setCartId(result.data.id);
    }

    return result;
}

export async function applyPromotionCode(couponCode: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return post<InterfaceApiDetailResponse<Order>>('/cart/promotions', { couponCode }, { useAuthToken: options?.useAuthToken });
}

export async function removePromotionCode(couponCode: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return remove<InterfaceApiDetailResponse<Order>>(`/cart/promotions/${couponCode}`, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Checkout Endpoints
// ============================================================================

export async function setShippingAddress(input: CreateAddressInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return patch<InterfaceApiDetailResponse<Order>>('/cart/shipping-address', input, { useAuthToken: options?.useAuthToken });
}

export async function setBillingAddress(input: CreateAddressInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return patch<InterfaceApiDetailResponse<Order>>('/cart/billing-address', input, { useAuthToken: options?.useAuthToken });
}

export interface ShippingMethod {
    id: string;
    name: string;
    code: string;
    description?: string;
    priceWithTax: number;
}

export interface PaymentMethod {
    id: string;
    code: string;
    name: string;
    description?: string;
    isEligible: boolean;
}

export async function getEligibleShippingMethods(options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<ShippingMethod>> {
    return get<InterfaceApiListResponse<ShippingMethod>>('/cart/shipping-methods', { useAuthToken: options?.useAuthToken });
}
export async function getEligiblePaymentMethods(options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<PaymentMethod>> {
    return get<InterfaceApiListResponse<PaymentMethod>>('/payment-methods', { useAuthToken: options?.useAuthToken });
}
export async function setShippingMethod(shippingMethodId: string[], options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return post<InterfaceApiDetailResponse<Order>>('/cart/shipping-method', { shippingMethodId }, { useAuthToken: options?.useAuthToken });
}

export interface PaymentInput {
    method: string;
    amount?: number;
    metadata?: Record<string, any>;
}

export async function addPaymentToOrder(input: PaymentInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return post<InterfaceApiDetailResponse<Order>>('/cart/payment', input, { useAuthToken: options?.useAuthToken });
}

export async function transitionOrderToState(state: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return post<InterfaceApiDetailResponse<Order>>('/cart/transition', { state }, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Order History Endpoints
// ============================================================================

export async function getCustomerOrders(params?: { take?: number; skip?: number }, options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<Order>> {
    const searchParams = new URLSearchParams();
    if (params?.take) searchParams.set('take', params.take.toString());
    if (params?.skip) searchParams.set('skip', params.skip.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return get<InterfaceApiListResponse<Order>>(`/orders${query}`, { useAuthToken: options?.useAuthToken });
}

export async function getOrderDetail(code: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return get<InterfaceApiDetailResponse<Order>>(`/orders/${code}`, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Registration & Password Reset Endpoints
// ============================================================================

export interface RegisterInput { first_name: string; last_name: string; email: string; password1: string; password2: string; username: string }

export async function registerCustomer(input: RegisterInput): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/api/v1/shop/register/', input);
}

export async function requestPasswordReset(emailAddress: string): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/auth/reset-password/request', { emailAddress });
}

export async function resetPassword(token: string, password: string): Promise<InterfaceApiDetailResponse<{ user: CurrentUser }>> {
    return post<InterfaceApiDetailResponse<{ user: CurrentUser }>>('/auth/reset-password', { token, password });
}

// ============================================================================
// Email Verification Endpoints
// ============================================================================

export async function verifyCustomerAccount(token: string): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/auth/verify', { token });
}

export async function requestUpdateCustomerEmailAddress(
    password: string,
    newEmailAddress: string,
    options?: { useAuthToken?: boolean }
): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/customers/me/email/request-update', { password, newEmailAddress }, { useAuthToken: options?.useAuthToken });
}

export async function updateCustomerEmailAddress(token: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/customers/me/email/update', { token }, { useAuthToken: options?.useAuthToken });
}
