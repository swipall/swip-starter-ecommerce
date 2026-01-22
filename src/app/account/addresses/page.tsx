import type {Metadata} from 'next';
import { getCustomerAddresses, getAvailableCountries } from '@/lib/swipall/rest-adapter';
import { AddressesClient } from './addresses-client';

export const metadata: Metadata = {
    title: 'Addresses',
};

export default async function AddressesPage(_props: PageProps<'/account/addresses'>) {
    const [addressesRes, countriesRes] = await Promise.all([
        getCustomerAddresses(),
        getAvailableCountries(),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Addresses</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your saved shipping and billing addresses
                </p>
            </div>

            <AddressesClient addresses={addressesRes.results} countries={countriesRes.results} />
        </div>
    );
}
