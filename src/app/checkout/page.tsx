import type { Metadata } from 'next';
import { getActiveOrder, getEligibleShippingMethods, getEligiblePaymentMethods } from '@/lib/swipall/rest-adapter';
import { redirect } from 'next/navigation';
import CheckoutFlow from './checkout-flow';
import { CheckoutProvider, PaymentMethodsInterface } from './checkout-provider';
import type { CheckoutOrder } from './types';
import { noIndexRobots } from '@/lib/metadata';
import { getAvailableCountriesCached } from '@/lib/swipall/cached';
import { fetchAddresses, fetchDeliveryItem } from './actions';
import { ShopCart } from '@/lib/swipall/types/types';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Completa tu compra.',
    robots: noIndexRobots(),
};


const defineAvailablePaymentMethods = (cart: ShopCart): PaymentMethodsInterface[] => {
    return [
        { id: 'card', label: 'Pago con Tarjeta/Mercado Pago', description: 'Paga con tarjeta de crédito o débito.', icon: 'credit-card', isEnabled: true },
        { id: 'uponDelivery', label: 'Pago contraentrega', description: 'Paga al recibir tu pedido.', icon: 'money', isEnabled: cart.for_pickup },
    ];
}


export default async function CheckoutPage(_props: PageProps<'/checkout'>) {
    const [orderRes, deliveryItem, addresses] = await Promise.all([
        getActiveOrder({ useAuthToken: true, mutateCookies: false }),
        // getAvailableCountriesCached(),
        // getEligibleShippingMethods({ useAuthToken: true }),
        // getEligiblePaymentMethods({ useAuthToken: true }),
        fetchDeliveryItem(),
        fetchAddresses(),
    ]);

    const activeOrder = orderRes;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return redirect('/cart');
    }

    // if (activeOrder.state !== 'AddingItems' && activeOrder.state !== 'ArrangingPayment') {
    //     return redirect(`/order-confirmation/${activeOrder.code}`);
    // }

    const shippingMethods = [{
        id: 'pickup',
        name: 'Pickup',
        description: 'Recoge tu pedido en nuestra tienda.'
    }];
    if (deliveryItem) {
        shippingMethods.push({
            id: 'delivery',
            name: 'Entrega a domicilio',
            description: 'Recibe tu pedido en la dirección que elijas.'
        });
    }
    const paymentMethods = defineAvailablePaymentMethods(activeOrder);
    // const countryList = Array.isArray(countries) ? countries : (countries?.results || []);
    // const deliveryItem = Array.isArray(deliveryItems) && deliveryItems.length > 0 ? deliveryItems[0] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <CheckoutProvider
                order={activeOrder}
                addresses={addresses.results || []}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
                deliveryItem={deliveryItem}
            >
                <CheckoutFlow />
            </CheckoutProvider>
        </div>
    );
}
