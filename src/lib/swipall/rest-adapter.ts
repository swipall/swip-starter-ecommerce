import { clearCartId, getCartId, setCartId } from '@/lib/cart';
import { get, patch, post, put, remove } from './api';
import type {
    Address,
    AddToCartInput,
    CatalogInterface,
    CatalogsParams,
    Collection,
    CreateAddressInput,
    CurrentUser,
    InterfaceApiDetailResponse,
    InterfaceApiListResponse,
    InterfaceInventoryItem,
    LoginInput,
    LoginResponse,
    Order,
    PaymentInput,
    PaymentMethod,
    RegisterInput,
    SearchInput,
    ShippingMethod,
    ShopCart,
    ShopCartItem,
    TaxonomyInterface,
    UpdateCartDeliveryInfoBody,
    UpdateCustomerInput
} from './types/types';


// ============================================================================
// Authentication Endpoints
// ============================================================================

export async function login(credentials: LoginInput): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/shop/login/', credentials);
}

export async function logout(options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/auth/logout', undefined, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Customer/User Endpoints
// ============================================================================

export async function getActiveCustomer(options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<CurrentUser>> {
    return get<InterfaceApiDetailResponse<CurrentUser>>('/auth/me', { useAuthToken: options?.useAuthToken });
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

export async function getProduct(id: string): Promise<InterfaceInventoryItem> {
    const endpoint = `/api/v1/shop/item/${id}`;
    return get<InterfaceInventoryItem>(endpoint);
}

export async function getGroupVariants(groupId: string): Promise<InterfaceApiListResponse<InterfaceInventoryItem>> {
    const endpoint = `/api/v1/shop/group/${groupId}/variants`;
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(endpoint);
}

export async function getCollection(slug: string): Promise<InterfaceApiDetailResponse<Collection>> {
    return get<InterfaceApiDetailResponse<Collection>>(`/collections/${slug}`);
}

export async function getPosts(params:any): Promise<InterfaceApiListResponse<any>> {
    return get<InterfaceApiListResponse<any>>('/api/v1/cms/posts', params);
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

export const itemExistsInCart = async (cartId: string, itemId: string): Promise<InterfaceApiListResponse<ShopCartItem>> => {
    const response = await get<InterfaceApiListResponse<ShopCartItem>>(`/api/v1/shop/cart/${cartId}/items`, { item__id: itemId });
    return response;
}
enum ORDER_SOURCE {
    WEB = 1,
    MOBILE_APP = 2,
    POS = 3
}
export const createShopCart = async (): Promise<ShopCart> => {
    return post<ShopCart>('/api/v1/shop/carts/', { source: ORDER_SOURCE.WEB });
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

export interface AddProductToCartBody {
    item: string;
    quantity: number;
    extra_materials?: { material_id: string; name: string }[];
    price?: number;
}

export const addProductToCart = async (cartId: string, body: AddProductToCartBody): Promise<InterfaceApiDetailResponse<ShopCartItem>> => {
    return post<InterfaceApiDetailResponse<ShopCartItem>>(`/api/v1/shop/cart/${cartId}/item/add/`, body);
}

export const updateProductInCart = async (itemId: string, body: { quantity: number }): Promise<InterfaceApiDetailResponse<ShopCartItem>> => {
    return patch<InterfaceApiDetailResponse<ShopCartItem>>(`/api/v1/shop/cart/item/set/${itemId}/`, body);
}

export async function removeFromCart(lineId: string, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    const endpoint = `/api/v1/shop/cart/item/set/${lineId}/`;
    return remove<InterfaceApiDetailResponse<Order>>(endpoint, { useAuthToken: options?.useAuthToken });
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

export const fetchDeliveryItem = async (): Promise<InterfaceApiListResponse<InterfaceInventoryItem>> => {
    const params = {
        limit: 1,
        offset: 0,
        search: 'DOMICILIO',
        kind: 'service'
    }
    const uri = `/api/v1/shop/items`;
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(uri, params);
}

export const updateCartDeliveryInfo = async (cartId: string, body: UpdateCartDeliveryInfoBody): Promise<InterfaceApiDetailResponse<ShopCart>> => {
    return patch<InterfaceApiDetailResponse<ShopCart>>(`/api/v1/shop/cart/${cartId}/set/shipping/`, body);
}

export const setCustomerToCart = async (cartId: string): Promise<InterfaceApiDetailResponse<any>> => {
    return put<InterfaceApiDetailResponse<any>>(`/api/v1/shop/me/order/${cartId}/set/customer/`, {});
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

export async function getEligibleShippingMethods(options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<ShippingMethod>> {
    return get<InterfaceApiListResponse<ShippingMethod>>('/cart/shipping-methods', { useAuthToken: options?.useAuthToken });
}
export async function getEligiblePaymentMethods(options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<PaymentMethod>> {
    return get<InterfaceApiListResponse<PaymentMethod>>('/payment-methods', { useAuthToken: options?.useAuthToken });
}
export async function setShippingMethod(shippingMethodId: string[], options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return post<InterfaceApiDetailResponse<Order>>('/cart/shipping-method', { shippingMethodId }, { useAuthToken: options?.useAuthToken });
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
