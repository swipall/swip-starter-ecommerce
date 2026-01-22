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

export async function OrderConfirmation({params}: PageProps<'/order-confirmation/[code]'>) {
    const {code} = await params;
    let orderData;

    try {
        const result = await getOrderDetail(code);
        orderData = result.data;
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
                    <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your order. Your order number is {' '}
                        <span className="font-semibold">{orderData.code}</span>
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {orderData.lines.map((line) => (
                            <div key={line.id} className="flex gap-4 items-center">
                                {line.productVariant.product.featuredAsset && (
                                    <div className="shrink-0">
                                        <Image
                                            src={line.productVariant.product.featuredAsset.preview}
                                            alt={line.productVariant.name}
                                            width={80}
                                            height={80}
                                            className="rounded object-cover h-20 w-20 object-center"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium">{line.productVariant.product.name}</p>
                                    {line.productVariant.name !== line.productVariant.product.name && (
                                        <p className="text-sm text-muted-foreground">{line.productVariant.name}</p>
                                    )}
                                </div>
                                <div className="text-center w-16">
                                    <p className="text-sm text-muted-foreground">Qty</p>
                                    <p className="font-medium">{line.quantity}</p>
                                </div>
                                <div className="text-right w-24">
                                    <p className="font-semibold">
                                        <Price value={line.linePriceWithTax} currencyCode={orderData.currencyCode}/>
                                    </p>
                                </div>
                            </div>
                        ))}

                        <Separator/>

                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>
                                <Price value={orderData.totalWithTax} currencyCode={orderData.currencyCode}/>
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {orderData.shippingAddress && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{orderData.shippingAddress.fullName}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {orderData.shippingAddress.streetLine1}
                                {orderData.shippingAddress.streetLine2 && `, ${orderData.shippingAddress.streetLine2}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {orderData.shippingAddress.city}, {orderData.shippingAddress.province}{' '}
                                {orderData.shippingAddress.postalCode}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {typeof orderData.shippingAddress.country === 'string' 
                                    ? orderData.shippingAddress.country 
                                    : orderData.shippingAddress.country?.name}
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-4">
                    <Button asChild className="flex-1">
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
