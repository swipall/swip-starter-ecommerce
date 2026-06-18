import { get, post } from "../api-server";
import { InterfaceApiListResponse } from "../types/types";
import { AddressInterface, CustomerInfoInterface } from './user.types';

export async function getCustomerInfoServer(): Promise<CustomerInfoInterface> {
    return get<CustomerInfoInterface>('/api/v1/shop/customer/info', {}, { useAuthToken: true });
}

export async function fetchAddressesServer(): Promise<InterfaceApiListResponse<AddressInterface>> {
    return get<InterfaceApiListResponse<AddressInterface>>('/api/v1/shop/me/address/', {}, { useAuthToken: true });
}

export async function createAddressServer(body: Partial<AddressInterface>): Promise<AddressInterface> {
    return post<AddressInterface>('/api/v1/shop/me/address/', body, { useAuthToken: true });
}

export async function createCustomerInfoServer(body: Partial<AddressInterface>): Promise<CustomerInfoInterface> {
    return post<CustomerInfoInterface>('/api/v1/shop/customer/info/', body, { useAuthToken: true });
}
