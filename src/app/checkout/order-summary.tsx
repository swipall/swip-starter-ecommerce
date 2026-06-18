'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderLine } from './types';
import { useCheckout } from './checkout-provider';
import { Price } from '@/components/commerce/price';

export default function OrderSummary() {
    const { order, fulfillmentType } = useCheckout();
    return (
        <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>Resumen de Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {order.lines.filter((line: OrderLine) => !line.item.name.toUpperCase().includes('ENVIO')).map((line: OrderLine) => (
                        <div key={line.id} className="flex gap-3">
                            {line.item.featured_image && (
                                <div className="flex-shrink-0 w-15 h-15">
                                    <Image
                                        src={line.item.featured_image}
                                        alt={line.item.name}
                                        width={60}
                                        height={60}
                                        className="rounded object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium line-clamp-2">
                                    {line.item.name}
                                </p>
                                <p className="text-xs text-foreground">
                                    Qty: {line.quantity}
                                </p>
                            </div>
                            <div className="text-sm font-medium">
                                <Price value={Number(line.total)} />
                            </div>
                        </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-foreground">Subtotal</span>
                        <span>
                            <Price value={Number(order.sub_total)} />
                        </span>
                    </div>

                    {order.discount_total && (
                        <div className="flex justify-between text-sm text-green-600">
                             <span className="text-foreground">Descuento</span>
                            <span>
                                <Price value={Number(order.discount_total)} />
                            </span>
                        </div>
                    )}

                    {(() => {
                        const shippingLine = order.lines?.find((line: OrderLine) => line.item.name.toUpperCase().includes('ENVIO'));
                        if (shippingLine) {
                            return (
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground">Envío</span>
                                    <span><Price value={Number(shippingLine.total)} /></span>
                                </div>
                            );
                        }
                        if (fulfillmentType === 'delivery') {
                            return (
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground">Envío</span>
                                    <span className="text-muted-foreground">Pendiente</span>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {order.tax_total && Number(order.tax_total) > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-foreground">Impuestos</span>
                            <span>
                                <Price value={Number(order.tax_total)} />
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>
                        <Price value={Number(order.grand_total)} />
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
