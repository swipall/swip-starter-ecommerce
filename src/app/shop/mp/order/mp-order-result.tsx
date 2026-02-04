import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getCartItems, getCurrentCart, getOrderDetail } from '@/lib/swipall/rest-adapter';
import { OrderDetailInterface } from '@/lib/swipall/users/user.types';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { CartCleaner } from './cart-cleaner';
import { CartSaver } from './cart-saver';
import { fetchOrderDetail } from './actions';
import ProductExtraMaterialsComponent from '@/components/commerce/product-extra-materials';

interface MpOrderResultProps {
    searchParams: Promise<{
        order?: string;
        status?: 'success' | 'pending' | 'failure';
    }>;
}

export async function MpOrderResult({ searchParams }: MpOrderResultProps) {
    const params = await searchParams;
    const orderId = params.order;
    const status: 'success' | 'pending' | 'failure' = Array.isArray(params.status) ? params.status.find(s => ['success', 'pending', 'failure'].includes(s)) : params.status || 'failure';

    if (!orderId || !status) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Información Incompleta</h1>
                    <p className="text-muted-foreground mb-6">
                        No se pudo procesar la información del pago. Por favor, verifica tu orden en tu cuenta.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link href="/account/orders">Ver Mis Órdenes</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Ir al Inicio</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    let orderData: OrderDetailInterface | null = null;
    let shouldSaveCartId = false;
    let shouldClearCart = false;

    try {
        const result = await fetchOrderDetail(orderId, status);
        orderData = result;
        if (status === 'success') {
            // if payment was successful, we make sure to clear the cart
            shouldClearCart = true;
        } else {
            // if payment was not successful, we save the cart ID so user can retry payment
            shouldSaveCartId = true;
        }
    } catch (error) {
        orderData = null;
    }

    if (!orderData) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Orden No Encontrada</h1>
                    <p className="text-muted-foreground mb-6">
                        No se pudo encontrar la orden especificada. Por favor, verifica tu orden en tu cuenta.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link href="/account/orders">Ver Mis Órdenes</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Ir al Inicio</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const statusConfig = {
        success: {
            icon: CheckCircle2,
            iconColor: 'text-green-500',
            title: '¡Pago Exitoso!',
            description: 'Tu pago ha sido procesado correctamente y tu orden está confirmada.',
        },
        pending: {
            icon: Clock,
            iconColor: 'text-yellow-500',
            title: 'Pago Pendiente',
            description:
                'Tu pago está siendo procesado. Recibirás una confirmación cuando se complete.',
        },
        failure: {
            icon: XCircle,
            iconColor: 'text-red-500',
            title: 'Pago Rechazado',
            description:
                'No se pudo procesar tu pago. Por favor, intenta nuevamente o utiliza otro método de pago.',
        },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <div className="container mx-auto px-4 py-16">
            {shouldClearCart && <CartCleaner />}
            {shouldSaveCartId && <CartSaver cartId={orderId} />}
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <StatusIcon className={`h-16 w-16 ${config.iconColor} mx-auto mb-4`} />
                    <h1 className="text-3xl font-bold mb-2">{config.title}</h1>
                    <p className="text-muted-foreground mb-2">{config.description}</p>
                    <p className="text-muted-foreground">
                        Número de pedido: <span className="font-semibold">{orderData.folio}</span>
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Resumen de la Orden</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {orderData.items.results.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                {item.item.featured_image && (
                                    <div className="shrink-0">
                                        <Image
                                            src={item.item.featured_image}
                                            alt={item.item.name}
                                            width={80}
                                            height={80}
                                            className="rounded object-cover h-20 w-20 object-center"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{item.item.name}</p>
                                    <p className="text-sm text-muted-foreground">SKU: {item.item.sku}</p>
                                    <ProductExtraMaterialsComponent item={item} />
                                </div>
                                <div className="text-center w-16">
                                    <p className="text-sm text-muted-foreground">Cantidad</p>
                                    <p className="font-medium">{item.quantity}</p>
                                </div>
                                <div className="text-right w-24">
                                    <p className="font-semibold">
                                        <Price value={parseFloat(item.total)} currencyCode="MXN" />
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>
                                    <Price value={parseFloat(orderData.sub_total)} currencyCode="MXN" />
                                </span>
                            </div>
                            {parseFloat(orderData.discount_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Descuento</span>
                                    <span>
                                        -<Price value={parseFloat(orderData.discount_total)} currencyCode="MXN" />
                                    </span>
                                </div>
                            )}
                            {parseFloat(orderData.shipment_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envío</span>
                                    <span>
                                        <Price value={parseFloat(orderData.shipment_total)} currencyCode="MXN" />
                                    </span>
                                </div>
                            )}
                            {parseFloat(orderData.tax_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Impuestos</span>
                                    <span>
                                        <Price value={parseFloat(orderData.tax_total)} currencyCode="MXN" />
                                    </span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>
                                <Price value={parseFloat(orderData.grand_total)} currencyCode="MXN" />
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {orderData.shipment_address && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Dirección de Envío</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{orderData.shipment_address.receiver}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {orderData.shipment_address.address}
                            </p>
                            {orderData.shipment_address.suburb && (
                                <p className="text-sm text-muted-foreground">
                                    {orderData.shipment_address.suburb}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                {orderData.shipment_address.city}, {orderData.shipment_address.state}{' '}
                                {orderData.shipment_address.postal_code}
                            </p>
                            {orderData.shipment_address.country && (
                                <p className="text-sm text-muted-foreground">
                                    {orderData.shipment_address.country}
                                </p>
                            )}
                            {orderData.shipment_address.mobile && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Tel: {orderData.shipment_address.mobile}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-4">
                    {status === 'failure' ? (
                        <>
                            <Button asChild className="flex-1">
                                <Link href="/checkout">Intentar Nuevamente</Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/">Ir al Inicio</Link>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button asChild className="flex-1">
                                <Link href="/">Continuar Comprando</Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/account/orders">Ver Mis Órdenes</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
