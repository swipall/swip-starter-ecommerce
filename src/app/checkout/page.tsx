import { noIndexRobots } from '@/lib/metadata';
import { getActiveOrder } from '@/lib/swipall/rest-adapter';
import { ShopCart } from '@/lib/swipall/types/types';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { fetchAddresses, fetchDeliveryItem, setCustomerForOrder } from './actions';
import CheckoutFlow from './checkout-flow';
import { CheckoutProvider, PaymentMethodsInterface } from './checkout-provider';

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
        fetchDeliveryItem(),
        fetchAddresses(),
        setCustomerForOrder(),
    ]);

    const activeOrder = orderRes;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return redirect('/cart');
    }

    const paymentMethods = defineAvailablePaymentMethods(activeOrder);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <CheckoutProvider
                order={activeOrder}
                addresses={addresses.results || []}
                paymentMethods={paymentMethods}
                deliveryItem={deliveryItem}
            >
                <CheckoutFlow />
            </CheckoutProvider>
        </div>
    );
}
