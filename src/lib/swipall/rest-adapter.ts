import { clearCartId, getCartId, setCartId } from '@/lib/cart';
import { get, patch, post, put, remove } from './api';
import type {
    Address,
    AddToCartInput,
    CatalogInterface,
    CatalogsParams,
    CmsPost,
    Collection,
    CreateAddressInput,
    CurrentUser,
    InterfaceApiDetailResponse,
    InterfaceApiListResponse,
    InterfaceInventoryItem,
    Order,
    SearchInput,
    ShopCart,
    ShopCartItem,
    TaxonomyInterface,
    UpdateCartDeliveryInfoBody,
    UpdateCustomerInput
} from './types/types';
import { OrderDetailInterface, OrderInterface } from './users/user.types';

export type { SearchInput } from './types/types';


// ============================================================================
// Customer/User Endpoints
// ============================================================================

export async function updateCustomer(input: UpdateCustomerInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<CurrentUser>> {
    return patch<InterfaceApiDetailResponse<CurrentUser>>('/customers/me', input, { useAuthToken: options?.useAuthToken });
}

export async function updateCustomerPassword(
    body: { new_password1: string; new_password2: string, token: string | number },
    options?: { useAuthToken?: boolean }
): Promise<InterfaceApiDetailResponse<{ success: boolean }>> {
    return post<InterfaceApiDetailResponse<{ success: boolean }>>('/api/v1/auth/password/change/', body, { useAuthToken: options?.useAuthToken });
}

// ============================================================================
// Customer Address Endpoints
// ============================================================================


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

export async function getProduct(id: string, customerId?: string): Promise<InterfaceInventoryItem> {
    const endpoint = `/api/v1/shop/item/${id}`;
    const params = customerId ? { customer_id: customerId } : undefined;
    return get<InterfaceInventoryItem>(endpoint, params);
}

export async function getGroupVariants(groupId: string): Promise<InterfaceApiListResponse<InterfaceInventoryItem>> {
    const endpoint = `/api/v1/shop/group/${groupId}/variants`;
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(endpoint);
}

export async function getCollection(slug: string): Promise<InterfaceApiDetailResponse<Collection>> {
    return get<InterfaceApiDetailResponse<Collection>>(`/collections/${slug}`);
}

export async function getPosts(params: any): Promise<InterfaceApiListResponse<CmsPost>> {
    return get<InterfaceApiListResponse<CmsPost>>('/api/v1/cms/posts', params);
}

export async function getPostDetail(slug: string): Promise<CmsPost> {
    return get<CmsPost>(`/api/v1/cms/post/${slug}`);
}

// ============================================================================
// Catalogs & Taxonomies Endpoints
// ============================================================================

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
export async function searchProducts(input: SearchInput, customerId?: string): Promise<SearchResult> {
    const params = new URLSearchParams();
    if (input.search) params.append('search', input.search);
    if (input.offset) params.append('offset', String(input.offset));
    if (input.limit) params.append('limit', String(input.limit));
    if (input.ordering) params.append('ordering', input.ordering);
    if (input.taxonomy) params.append('taxonomy', input.taxonomy);
    if (input.taxonomies__slug__and) params.append('taxonomies__slug__and', input.taxonomies__slug__and);
    if (customerId) params.append('customer_id', customerId);
    const endpoint = `/api/v1/shop/items`;
    const parsedParams = Object.fromEntries(params.entries());
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(endpoint, parsedParams);
}

// ============================================================================
// Cart/Order Endpoints
// ============================================================================

export async function getCurrentCart(options?: { useAuthToken?: boolean, cartId?: string }): Promise<ShopCart | null> {
    try {
        const storedCartId = options?.cartId || await getCartId();
        if (!storedCartId) {
            return null
        }
        const response = await get<ShopCart>(`/api/v1/shop/cart/${storedCartId}`, undefined, { useAuthToken: options?.useAuthToken });
        return response;
    } catch (error) {
        return null;
    }
}

export async function getCartItems(options?: { useAuthToken?: boolean; cartId?: string }): Promise<ShopCartItem[]> {
    const storedCartId = options?.cartId || await getCartId();
    if (!storedCartId) {
        return [];
    }
    const response = await get<InterfaceApiDetailResponse<ShopCartItem[]> | InterfaceApiListResponse<ShopCartItem>>(
        `/api/v1/shop/cart/${storedCartId}/items`,
        undefined,
        { useAuthToken: options?.useAuthToken }
    );
    const itemLines = Array.isArray((response as InterfaceApiDetailResponse<ShopCartItem[]>)?.data)
        ? (response as InterfaceApiDetailResponse<ShopCartItem[]>)?.data || []
        : Array.isArray((response as InterfaceApiListResponse<ShopCartItem>)?.results)
            ? (response as InterfaceApiListResponse<ShopCartItem>).results
            : [];
    return itemLines;
}

export async function getActiveOrder(options?: { useAuthToken?: boolean; cartId?: string; mutateCookies?: boolean }): Promise<Order | null> {
    const storedCartId = options?.cartId || await getCartId();
    const mutateCookies = options?.mutateCookies === true;

    if (!storedCartId) {
        return null
    }

    try {
        const [cartResponse, itemsResponse] = await Promise.all([
            get<ShopCart>(`/api/v1/shop/cart/${storedCartId}`, undefined, { useAuthToken: options?.useAuthToken }),
            get<InterfaceApiDetailResponse<ShopCartItem[]> | InterfaceApiListResponse<ShopCartItem>>(
                `/api/v1/shop/cart/${storedCartId}/items`,
                undefined,
                { useAuthToken: options?.useAuthToken }
            ),
        ]);
        const cartData = cartResponse;
        const itemLines = Array.isArray((itemsResponse as InterfaceApiDetailResponse<ShopCartItem[]>)?.data)
            ? (itemsResponse as InterfaceApiDetailResponse<ShopCartItem[]>)?.data || []
            : Array.isArray((itemsResponse as InterfaceApiListResponse<ShopCartItem>)?.results)
                ? (itemsResponse as InterfaceApiListResponse<ShopCartItem>).results
                : [];
        const orderWithLines = cartData ? { ...cartData, lines: itemLines } as Order : null;
        if (orderWithLines?.id && mutateCookies) {
            await setCartId(orderWithLines.id);
        }
        return orderWithLines;
    } catch (error) {
        if (mutateCookies) {
            await clearCartId();
        }
        return null;
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
// TODO: Remove this. For testing POS cart creation
export const testCreatePosCart = async (body: { store: string; customer: string }): Promise<ShopCart> => {
    return post<ShopCart>('/api/v1/pos/cart/', { source: ORDER_SOURCE.POS, ...body }, { useAuthToken: true, token: 'pos_auth_token' });
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

export const fetchDeliveryItem = async (customerId?: string): Promise<InterfaceApiListResponse<InterfaceInventoryItem>> => {
    const params: Record<string, any> = {
        limit: 1,
        offset: 0,
        search: 'DOMICILIO',
        kind: 'service'
    };
    if (customerId) {
        params.customer_id = customerId;
    }
    const uri = `/api/v1/shop/items`;
    return get<InterfaceApiListResponse<InterfaceInventoryItem>>(uri, params);
}

export const updateCartDeliveryInfo = async (cartId: string, body: UpdateCartDeliveryInfoBody, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<ShopCart>> => {
    return patch<InterfaceApiDetailResponse<ShopCart>>(`/api/v1/shop/cart/${cartId}/set/shipping/`, body, { useAuthToken: options?.useAuthToken });
}

export const setCustomerToCart = async (cartId: string): Promise<ShopCart> => {
    return put<ShopCart>(`/api/v1/shop/me/order/${cartId}/set/customer/`, {}, { useAuthToken: true });
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


export interface MercadoPagoPreferenceResponse {
    mp_preference: {
        preference: {
            init_point: string;
            sandbox_init_point: string;
            status: number;
            message?: string;
            id: string;
        }
    }
}

export async function setShippingAddress(input: CreateAddressInput, options?: { useAuthToken?: boolean }): Promise<InterfaceApiDetailResponse<Order>> {
    return patch<InterfaceApiDetailResponse<Order>>('/cart/shipping-address', input, { useAuthToken: options?.useAuthToken });
}

export async function createMpPreference(cartId: string): Promise<MercadoPagoPreferenceResponse> {
    return put<MercadoPagoPreferenceResponse>(`/api/v1/shop/me/order/${cartId}/mp/preference/`, {}, { useAuthToken: true });
}

export async function validateOrderStatus(orderId: string): Promise<ShopCart | OrderDetailInterface> {
    return get<ShopCart | OrderDetailInterface>(`/api/v1/shop/me/order/${orderId}/status`, undefined, { useAuthToken: true });
}

// ============================================================================
// Order History Endpoints
// ============================================================================

export async function getCustomerOrders(params?: { limit?: number; offset?: number }, options?: { useAuthToken?: boolean }): Promise<InterfaceApiListResponse<OrderInterface>> {
    return get<InterfaceApiListResponse<OrderInterface>>(`/api/v1/shop/me/orders`, params, { useAuthToken: options?.useAuthToken });
}

export async function getOrderDetail(code: string, options?: { useAuthToken?: boolean }): Promise<OrderDetailInterface> {
    return get<OrderDetailInterface>(`/api/v1/shop/me/order/${code}`, undefined, { useAuthToken: options?.useAuthToken });
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
