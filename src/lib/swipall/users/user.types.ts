import { ORDER_STATUS, OrderPaymentType } from "@/app/account/orders/types";
import { Material, ProductAttribute } from "../types/types";

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

export interface CustomerInfoInterface {
    id: string;
    business_name: string;
    mobile: string;
    email: string;
    extra_fields: any[];
    properties: any[];
    address: AddressInterface
    price_list?: string;
}

export interface OrderInterface {
    id: string;
    folio: string;
    store: string;
    status: number;
    sub_total: string;
    discount_total: string;
    shipment_total: string;
    tax_total: string;
    grand_total: string;
    is_paid: number;
    weight: number;
    balance: string;
    payment_type: string;
    created_at: string;
    for_pickup: boolean;
    for_delivery: boolean;
}

export interface OrderItemInterface {
    id: string;
    sku: string;
    barcode: string | null;
    name: string;
    featured_image: string;
    allow_serial_numbers: boolean;
    attribute_combinations: ProductAttribute[];
}

export interface OrderItemDetailInterface {
    id: string;
    quantity: number;
    sub_total: string;
    total: string;
    base: string;
    kind: string;
    serial_number: string | null;
    extra_materials: Material[];
    extra_fields: any[];
    properties: any[];
    item: OrderItemInterface;
}

export interface OrderDetailInterface {
    id: string;
    created_at: string;
    folio: string;
    store: string;
    status: ORDER_STATUS;
    sub_total: string;
    discount_total: string;
    shipment_total: string;
    tax_total: string;
    grand_total: string;
    is_paid: number;
    weight: number;
    balance: string;
    payment_type: OrderPaymentType;
    shipment_address: AddressInterface | null;
    items: {
        results: OrderItemDetailInterface[];
        count: number;
    };
    for_delivery: boolean;
    for_pickup: boolean;
}
