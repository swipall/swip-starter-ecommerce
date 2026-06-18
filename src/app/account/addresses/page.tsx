import type { Metadata } from 'next';
import { fetchAddressesServer as fetchAddresses } from '@/lib/swipall/users/server';
import { AddressesClient } from './addresses-client';
import { AddressInterface } from '@/lib/swipall/users/user.types';

export const metadata: Metadata = {
    title: 'Mis Direcciones',
};

export default async function AddressesPage(_props: PageProps<'/account/addresses'>) {
    const addressesRes = await fetchAddresses();
    const addresses: AddressInterface[] = Array.isArray(addressesRes) ? addressesRes : addressesRes.results || [];

    return (
        <div className="space-y-6">
            <AddressesClient addresses={addresses} />
        </div>
    );
}
