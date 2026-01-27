import { get, post } from "../api";
import { InterfaceApiListResponse } from "../types/types";
import { AddressInterface } from '@/lib/swipall/users/user.types';

export async function fetchAddresses(options: { useAuthToken: boolean }): Promise<InterfaceApiListResponse<AddressInterface>> {
    return get<InterfaceApiListResponse<AddressInterface>>('/api/v1/shop/me/address/', {}, options);
}

export async function createAddress(body: Partial<AddressInterface>, options: { useAuthToken: boolean }): Promise<AddressInterface> {
    return post<AddressInterface>('/api/v1/shop/me/address/', body, { useAuthToken: options.useAuthToken });
}

export async function createCustomerInfo(body: Partial<AddressInterface>, options: { useAuthToken: boolean }): Promise<any> {
    return post<any>('/api/v1/shop/customer/info/', body, { useAuthToken: options.useAuthToken });
}