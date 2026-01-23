import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Price} from '@/components/commerce/price';
import type {Order} from '@/lib/swipall/rest-adapter';

export async function OrderSummary({activeOrder}: { activeOrder: Order }) {
    return (
        <div className="border rounded-lg p-6 bg-card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                        <Price value={parseFloat(activeOrder.sub_total)}/>
                    </span>
                </div>
                {activeOrder.discount_total && parseFloat(activeOrder.discount_total) > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>
                            <Price value={parseFloat(activeOrder.discount_total)}/>
                        </span>
                    </div>
                )}
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
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

            <Button className="w-full" size="lg" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
    );
}
