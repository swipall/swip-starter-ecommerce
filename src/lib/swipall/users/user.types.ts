
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
    address: AddressInterface
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
    attribute_combinations: any[];
}

export interface OrderItemDetailInterface {
    id: string;
    quantity: number;
    sub_total: string;
    total: string;
    base: string;
    kind: string;
    serial_number: string | null;
    extra_materials: any[];
    extra_fields: any[];
    properties: any[];
    item: OrderItemInterface;
}

export interface OrderDetailInterface {
    id: string;
    created_at: string;
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
    shipment_address: AddressInterface | null;
    items: {
        results: OrderItemDetailInterface[];
        count: number;
    };
}