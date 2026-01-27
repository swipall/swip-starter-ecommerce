/**
 * Type definitions for Swipall REST API
 * 
 * This file contains all TypeScript interfaces and types used
 * throughout the Swipall REST adapter, organized by feature.
 */

// ============================================================================
// Authentication Types
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

// ============================================================================
// Customer/User Types
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

export interface UpdateCustomerInput {
    firstName?: string;
    lastName?: string;
}

// ============================================================================
// Address Types
// ============================================================================

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

export interface AddressInterface {
    id: string;
    address: string;
    suburb: string;
    postal_code: string;
    city: string;
    state: string;
    country: string;
    receiver?: string;
    references?: string;
    mobile?: string;
}

// ============================================================================
// Product Types
// ============================================================================

export enum ProductKind {
    Group = 'group',
    Product = 'product',
    Compound = 'compound',
    Service = 'service',
}

export interface ProductAttribute {
    id: string;
    name: string;
    value: string;
    meli_settings: null;
    slug: string;
    kind: string;
    ordering: number;
    icon: string | null;
    color: string;
    imagen: string | null;
    is_visible_on_web: boolean;
    parent: null;
}
export interface InterfaceInventoryItem {
    attribute_combinations: ProductAttribute[];
    available?: InventoryAvailable;
    barcode: string | null;
    featured_image: string | null;
    id: string;
    kind: ProductKind;
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
    variants?: InterfaceInventoryItem[];
}

export interface ProductVariant {
    id: string;
    slug: string;
    name: string;
    web_price: string;
    sku: string;
    barcode: string | null;
    featured_image: string | null;
    pictures: InventoryPicture[] | null;
    taxonomy: TaxonomyInterface[];
    available: InventoryAvailable;
}

export interface VariantOption {
    label: string;
    kind: string;
    values: {
        key: string;
        name: string;
        value: string;
    }[]
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

export interface InventoryAvailable {
    id: string;
    quantity: number;
}

export interface InventoryPicture {
    id: string;
    url: string;
}


export interface Inventory {
    id: string;
    warehouse__id: string;
    warehouse__store__id: string;
    warehouse__name: string;
    warehouse__store__name: string;
    quantity: number;
    minimum: number;
    maximum: number;
}

export interface Material {
    id: string;
    barcode: string;
    sku: string;
    name: string;
    cost: string;
    price: string;
    inventories: Inventory[];
}

export interface MaterialItem {
    id: string;
    material: Material;
    created_at: string;
    updated_at: string;
    request_selling: boolean;
    quantity: number;
    compound: string;
}

// ============================================================================
// Catalog & Taxonomy Types
// ============================================================================

export interface CatalogsParams {
    parent__slug?: string;
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

interface CatalogSettings {
    url: string;
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

// ============================================================================
// CMS/Content Types
// ============================================================================

export interface CmsPost {
    slug: string;
    title: string;
    excerpt: string | null;
    body: string;
    categories: any[];
    link: string | null;
    updated_at: string;
    featured_image: string | null;
    ordering: number;
    author: string | null;
    modified_by: string | null;
    version: number;
    parent: CmsPost | null;
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchInput {
    offset?: number;
    limit?: number;
    search?: string;
    ordering?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

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

// ============================================================================
// Cart/Order Types
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

export interface ShopCartItemBase {
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

export interface Order extends ShopCart {
    lines: ShopCartItem[];
}

export interface AddToCartInput {
    variantId: string;
    quantity: number;
}

export interface AddItemToCartParams {
    quantity: number;
    extra_materials?: any[];
    price: number;
}

// ============================================================================
// Checkout Types
// ============================================================================

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

export interface PaymentInput {
    method: string;
    amount?: number;
    metadata?: Record<string, any>;
}

// ============================================================================
// Registration & Password Reset Types
// ============================================================================

export interface RegisterInput {
    first_name: string;
    last_name: string;
    email: string;
    password1: string;
    password2: string;
    username: string;
}


export interface UpdateCartDeliveryInfoBody {
    for_delivery?: boolean;
    for_pickup?: boolean;
    shipment_address?: string | null;
    status?: 3;
    external_reference?: string | null;
}