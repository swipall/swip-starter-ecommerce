import type { Metadata } from 'next';
import { fetchAddresses } from '@/lib/swipall/users';
import { AddressesClient } from './addresses-client';
import { AddressInterface } from '@/lib/swipall/users/user.types';

export const metadata: Metadata = {
    title: 'Mis Direcciones',
};

export default async function AddressesPage(_props: PageProps<'/account/addresses'>) {
    const addressesRes = await fetchAddresses({ useAuthToken: true });
    const addresses: AddressInterface[] = Array.isArray(addressesRes) ? addressesRes : addressesRes.results || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mis Direcciones</h1>
                <p className="text-muted-foreground mt-2">
                    Administra tus direcciones de envío guardadas
                </p>
            </div>

            <AddressesClient addresses={addresses} />
        </div>
    );
}
