import OrderIsPaidComponent from '@/components/commerce/order-is-paid';
import PaymentTypeTextComponent from '@/components/commerce/order-payment-type';
import OrderStatusComponent from '@/components/commerce/order-status';
import { Price } from '@/components/commerce/price';
import ProductExtraMaterialsComponent from '@/components/commerce/product-extra-materials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getAuthToken } from "@/lib/auth";
import { formatDate } from '@/lib/format';
import { getOrderDetail } from '@/lib/swipall/rest-adapter';
import { OrderDetailInterface } from '@/lib/swipall/users/user.types';
import { ChevronLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from "next/link";
import { redirect } from "next/navigation";

type OrderDetailPageProps = PageProps<'/account/orders/[code]'>;

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
    const { code } = await params;
    return {
        title: `Orden ${code}`,
    };
}

export default async function OrderDetailPage(props: PageProps<'/account/orders/[code]'>) {
    const params = await props.params;
    const { code } = params;

    // Check if user is authenticated
    const authToken = await getAuthToken();
    if (!authToken) {
        redirect('/sign-in');
    }

    const orderRes = await getOrderDetail(code, { useAuthToken: true });
    const order: OrderDetailInterface = orderRes;
    if (!order) {
        return redirect('/account/orders');
    }

    return (
        <div>
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/account/orders">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Volver a mis Pedidos
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Orden {order.folio}</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items and Totals */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Artículos de la Orden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.results.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div
                                            className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                            {item.item.featured_image && (
                                                <Image
                                                    src={item.item.featured_image}
                                                    alt={item.item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {item.item.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {item.item.sku}
                                            </p>
                                            <ProductExtraMaterialsComponent item={item} />
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                <Price value={parseFloat(item.total)} currencyCode="MXN" />
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Cantidad: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Totals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumen de la Orden</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span><Price value={parseFloat(order.sub_total)} currencyCode="MXN" /></span>
                                </div>
                                {parseFloat(order.shipment_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Envío</span>
                                        <span><Price value={parseFloat(order.shipment_total)} currencyCode="MXN" /></span>
                                    </div>
                                )}
                                {parseFloat(order.discount_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Descuento
                                        </span>
                                        <span className="text-green-600">
                                            -<Price value={parseFloat(order.discount_total)} currencyCode="MXN" />
                                        </span>
                                    </div>
                                )}
                                {parseFloat(order.tax_total) > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Impuestos</span>
                                        <span><Price value={parseFloat(order.tax_total)} currencyCode="MXN" /></span>
                                    </div>
                                )}
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span><Price value={parseFloat(order.grand_total)} currencyCode="MXN" /></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Shipping, Billing, Payment */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    {order.shipment_address && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Dirección de Envío</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p className="font-medium">{order.shipment_address.receiver}</p>
                                <p>{order.shipment_address.address}</p>
                                {order.shipment_address.suburb && (
                                    <p>{order.shipment_address.suburb}</p>
                                )}
                                <p>
                                    {order.shipment_address.city}, {order.shipment_address.state}{' '}
                                    {order.shipment_address.postal_code}
                                </p>
                                {order.shipment_address.country && (
                                    <p>{order.shipment_address.country}</p>
                                )}
                                {order.shipment_address.mobile && (
                                    <p className="mt-2">Tel: {order.shipment_address.mobile}</p>
                                )}
                                {order.shipment_address.references && (
                                    <p className="mt-2 text-xs text-muted-foreground">{order.shipment_address.references}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Address */}
                    {order.shipment_address && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Pago</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p className="text-muted-foreground">Tipo de pago: <PaymentTypeTextComponent paymentType={order.payment_type} /></p>
                                <p className="text-muted-foreground mt-2">Estado: <OrderIsPaidComponent isPaid={order.is_paid} /></p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Delivery Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tipo de Entrega</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            {order.shipment_address ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span className="font-medium">Envío a Domicilio</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="font-medium">Recoger en Tienda</span>
                                </div>
                            )}
                            <p className="text-muted-foreground mt-2">Estado de pedido: <OrderStatusComponent status={order.status} /></p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
