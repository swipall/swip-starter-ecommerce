import type {Metadata} from 'next';
import { getActiveOrder, getEligibleShippingMethods, getEligiblePaymentMethods } from '@/lib/swipall/rest-adapter';
import {redirect} from 'next/navigation';
import CheckoutFlow from './checkout-flow';
import {CheckoutProvider} from './checkout-provider';
import type { CheckoutOrder } from './types';
import {noIndexRobots} from '@/lib/metadata';
import { getAvailableCountriesCached } from '@/lib/swipall/cached';
import { fetchDeliveryItem } from './actions';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Completa tu compra.',
    robots: noIndexRobots(),
};

export default async function CheckoutPage(_props: PageProps<'/checkout'>) {
    const [orderRes, deliveryItems] = await Promise.all([
        getActiveOrder({ useAuthToken: true, mutateCookies: false }),
        // getAvailableCountriesCached(),
        // getEligibleShippingMethods({ useAuthToken: true }),
        // getEligiblePaymentMethods({ useAuthToken: true }),
        fetchDeliveryItem(),
    ]);

    const activeOrder = orderRes;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return redirect('/cart');
    }

    console.log(activeOrder);
    

    // if (activeOrder.state !== 'AddingItems' && activeOrder.state !== 'ArrangingPayment') {
    //     return redirect(`/order-confirmation/${activeOrder.code}`);
    // }

    // const addresses = activeOrder.shippingAddress ? [activeOrder.shippingAddress] : [];
    // const shippingMethods = shippingMethodsRes.results || [];
    // const paymentMethods = (paymentMethodsRes.results || []).filter(m => m.isEligible);
    // const countryList = Array.isArray(countries) ? countries : (countries?.results || []);
    // const deliveryItem = Array.isArray(deliveryItems) && deliveryItems.length > 0 ? deliveryItems[0] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            {/* <CheckoutProvider
                order={activeOrder}
                addresses={addresses}
                countries={countryList}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
                isGuest={false}
                deliveryItem={deliveryItem}
            >
                <CheckoutFlow/>
            </CheckoutProvider> */}
        </div>
    );
}
