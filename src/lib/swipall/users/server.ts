import { get, post } from "../api-server";
import { SwipallAPIError } from "../api";
import { InterfaceApiListResponse } from "../types/types";
import { AddressInterface, CustomerInfoInterface } from './user.types';

export async function getCustomerInfoServer(): Promise<CustomerInfoInterface> {
    try {
        return await get<CustomerInfoInterface>('/api/v1/shop/customer/info', {}, { useAuthToken: true });
    } catch (err) {
        if (err instanceof SwipallAPIError && err.status === 404) {
            const { removeAuthToken } = await import('@/lib/auth');
            await removeAuthToken();
        }
        throw err;
    }
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
