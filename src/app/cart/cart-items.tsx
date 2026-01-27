import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Minus, Plus, X } from 'lucide-react';
import { Price } from '@/components/commerce/price';
import { removeFromCart, adjustQuantity } from './actions';
import { Order } from '@/lib/swipall/types/types';

export async function CartItems({ activeOrder }: { activeOrder: Order | null }) {
    if (!activeOrder || !activeOrder.lines || activeOrder.lines.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
                    <p className="text-muted-foreground mb-8">
                        Añade algunos artículos a tu carrito para comenzar
                    </p>
                    <Button asChild>
                        <Link href="/">Continuar comprando</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 space-y-4">
            {activeOrder.lines.map((line) => {
                const unitPrice = line.sub_total ? parseFloat(line.sub_total) / line.quantity : 0;
                return (
                    <div
                        key={line.id}
                        className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card"
                    >
                        {line.item.featured_image && (
                            <div className="flex-shrink-0">
                                <Image
                                    src={line.item.featured_image}
                                    alt={line.item.name}
                                    width={120}
                                    height={120}
                                    className="rounded-md object-cover w-full sm:w-[120px] h-[120px]"
                                />
                            </div>
                        )}

                        <div className="flex-grow min-w-0">
                            <p className="font-semibold">
                                {line.item.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                SKU: {line.item.sku}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2 sm:hidden">
                                <Price value={unitPrice} />xU
                            </p>

                            <div className="flex items-center gap-3 mt-4">
                                <div className="flex items-center gap-2 border rounded-md">
                                    <form
                                        action={async () => {
                                            'use server';
                                            await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                                        }}
                                    >
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-none"
                                            disabled={line.quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                    </form>

                                    <span className="w-12 text-center font-medium">{line.quantity}</span>

                                    <form
                                        action={async () => {
                                            'use server';
                                            await adjustQuantity(line.id, line.quantity + 1);
                                        }}
                                    >
                                        <Button
                                            type="submit"
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-none"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>

                                <form
                                    action={async () => {
                                        'use server';
                                        await removeFromCart(line.id);
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </form>

                                <div className="sm:hidden ml-auto">
                                    <p className="font-semibold text-lg">
                                        <Price value={parseFloat(line.total)} />
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="font-semibold text-lg">
                                <Price value={parseFloat(line.total)} />
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                <Price value={unitPrice} />xU
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
