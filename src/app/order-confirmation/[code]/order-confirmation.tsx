import {connection} from 'next/server';
import { getOrderDetail } from '@/lib/swipall/rest-adapter';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {CheckCircle2} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {Separator} from '@/components/ui/separator';
import {Price} from '@/components/commerce/price';
import {notFound} from "next/navigation";
import { OrderDetailInterface } from '@/lib/swipall/users/user.types';

export async function OrderConfirmation({params}: PageProps<'/order-confirmation/[code]'>) {
    const {code} = await params;
    let orderData: OrderDetailInterface | null = null;

    try {
        const result = await getOrderDetail(code);
        orderData = result;
    }
    catch (error) {
        notFound();
    }

    if (!orderData) {
       notFound();
    }

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                    <h1 className="text-3xl font-bold mb-2">¡Orden Confirmada!</h1>
                    <p className="text-muted-foreground">
                        Gracias por tu orden. Tu número de pedido es {' '}
                        <span className="font-semibold">{orderData.folio}</span>
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
                                </div>
                                <div className="text-center w-16">
                                    <p className="text-sm text-muted-foreground">Cantidad</p>
                                    <p className="font-medium">{item.quantity}</p>
                                </div>
                                <div className="text-right w-24">
                                    <p className="font-semibold">
                                        <Price value={parseFloat(item.total)} currencyCode="MXN"/>
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Separator/>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span><Price value={parseFloat(orderData.sub_total)} currencyCode="MXN"/></span>
                            </div>
                            {parseFloat(orderData.discount_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Descuento</span>
                                    <span>-<Price value={parseFloat(orderData.discount_total)} currencyCode="MXN"/></span>
                                </div>
                            )}
                            {parseFloat(orderData.shipment_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Envío</span>
                                    <span><Price value={parseFloat(orderData.shipment_total)} currencyCode="MXN"/></span>
                                </div>
                            )}
                            {parseFloat(orderData.tax_total) > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Impuestos</span>
                                    <span><Price value={parseFloat(orderData.tax_total)} currencyCode="MXN"/></span>
                                </div>
                            )}
                        </div>

                        <Separator/>

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>
                                <Price value={parseFloat(orderData.grand_total)} currencyCode="MXN"/>
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
                    <Button asChild className="flex-1">
                        <Link href="/">Continuar Comprando</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
