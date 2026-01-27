"use client";

import {useTransition} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Price} from '@/components/commerce/price';
import { Order } from '@/lib/swipall/types/types';
import { isUserAuthenticated } from './actions';

export function OrderSummary({activeOrder}: { activeOrder: Order }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleProceedCheckout = () => {
        startTransition(async () => {
            try {
                const isAuthenticated = await isUserAuthenticated();
                if (!isAuthenticated) {
                    router.push(`/sign-in?redirectTo=/checkout`);
                    return;
                }
                router.push('/checkout');
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
            }
        });
    };

    return (
        <div className="border rounded-lg p-6 bg-card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Resumen de pedido</h2>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                        <Price value={parseFloat(activeOrder.sub_total)}/>
                    </span>
                </div>
                {activeOrder.discount_total && parseFloat(activeOrder.discount_total) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento</span>
                        <span>
                            <Price value={parseFloat(activeOrder.discount_total)}/>
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Impuestos</span>
                    <span>
                        <Price value={parseFloat(activeOrder.tax_total)}/>
                    </span>
                </div>
            </div>

            <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                        <Price value={parseFloat(activeOrder.grand_total)}/>
                    </span>
                </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleProceedCheckout} disabled={isPending}>
                {isPending ? 'Verificando...' : 'Proceder al pago'}
            </Button>

            <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/">Seguir comprando</Link>
            </Button>
        </div>
    );
}
