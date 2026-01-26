'use client';

import { addToCart, getGroupVariant } from '@/app/product/[id]/actions';
import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InterfaceInventoryItem, ProductKind, ProductVariant } from '@/lib/swipall/types/types';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface ProductInfoProps {
    product: InterfaceInventoryItem;
    searchParams: { [key: string]: string | string[] | undefined };
}

interface VariantOption {
    label: string;
    key: string;
    kind: string;
    values: {
        key: string;
        name: string;
        value: string;
    }[]
}

export function ProductInfo({ product, searchParams }: ProductInfoProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);

    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [variants, setVariants] = useState<VariantOption[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    const generateVariantLabel = (kind: string) => {
        if (kind === 'size') return 'Tamaño';
        if (kind === 'color') return 'Color';
        return kind.charAt(0).toUpperCase() + kind.slice(1);
    }

    const formatVariants = (product: InterfaceInventoryItem) => {
        let variantsArray: VariantOption[] = [
            {
                key: 'size',
                label: 'Tamaño',
                kind: 'size',
                values: []
            },
            {
                key: 'color',
                label: 'Color',
                kind: 'color',
                values: []
            }
        ];
        product.attribute_combinations.forEach((attr) => {
            const existingVariant = variantsArray.find(v => v.kind === attr.kind);
            if (existingVariant) {
                existingVariant.values.push({
                    key: attr.id,
                    name: attr.name,
                    value: attr.value
                });
            } else {
                variantsArray.push({
                    label: generateVariantLabel(attr.kind),
                    key: attr.kind,
                    kind: attr.kind,
                    values: [{
                        key: attr.id,
                        name: attr.name,
                        value: attr.value
                    }]
                });
            }
        });
        setVariants(variantsArray);
    }

    useEffect(() => {
        // Only load variants for 'group' kind
        if (product.kind === ProductKind.Group) {
            startTransition(async () => {
                try {
                    formatVariants(product);

                    fetchVariantBySizeAndColor(null, null)
                } catch (error) {
                    toast.error('Error', { description: error instanceof Error ? error.message : 'Error al cargar las variantes' });
                }
            });
        } else {
            // For 'product' and 'compound' kinds, clear variants
            setVariants([]);
            setSelectedVariantId(null);
        }
    }, [product.id, product.kind]);

    const fetchVariantBySizeAndColor = async (sizeId: string | null, colorId: string | null) => {
        const params = {
            ...colorId && { color: colorId },
            ...sizeId && { size: sizeId }
        }
        const res: ProductVariant = await getGroupVariant(product.id, params);
        console.log(res);
        setSelectedVariant(res);
    }


    const handleVariantChange = (variantId: string) => {

        setSelectedVariantId(variantId);
    };

    const handleAddToCart = async () => {
        // For 'group' kind, require a selected variant
        if (product.kind === 'group' && !selectedVariant) return;

        // For 'group' kind use the variant ID, otherwise use the product ID
        const itemId = product.kind === 'group' ? selectedVariant?.id : product.id;
        if (!itemId) return;

        startTransition(async () => {
            const result = await addToCart(itemId, 1);

            if (result.success) {
                setIsAdded(true);
                toast.success('Agregado al carrito', {
                    description: `${product.name} ha sido agregado a tu carrito`,
                });

                // Reset the added state after 2 seconds
                setTimeout(() => setIsAdded(false), 2000);
            } else {
                toast.error('Error', {
                    description: result.error || 'Ocurrió un error al agregar al carrito',
                });
            }
        });
    };

    const isInStock = product.kind === ProductKind.Group
        ? false
        : (product.available?.quantity ?? 0) > 0;
    const canAddToCart = product.kind === ProductKind.Group
        ? !!selectedVariant && isInStock
        : isInStock;

    return (
        <div className="space-y-6">
            {/* Product Title */}
            <div>
                <p className="text-2xl font-bold mt-2">
                    <Price value={product.kind === ProductKind.Group ? 0 : Number(product.web_price) || 0} />
                </p>
            </div>

            {/* Product Description */}
            <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>

            {/* Variants Selection - only for group kind */}
            {product.kind === ProductKind.Group && variants.length > 0 && (
                <div className="space-y-4">
                    <Label className="text-base font-semibold">
                        Variantes
                    </Label>
                    <RadioGroup
                        value={selectedVariantId || ''}
                        onValueChange={(value) => handleVariantChange(value)}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
                            {variants.map((variant) => (
                                (
                                    <div key={variant.key} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <p>{variant.label}</p>
                                        {
                                            variant.values.map((option) => (
                                                <div key={option.key}>
                                                    <RadioGroupItem
                                                        value={option.key}
                                                        id={option.key}
                                                        className="peer sr-only"
                                                    />
                                                    <Label
                                                        htmlFor={option.key}
                                                        className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                                                    >
                                                        {option.value}
                                                    </Label>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            ))}
                        </div>
                    </RadioGroup>
                </div>
            )}

            {/* Stock Status */}
            <div className="text-sm">
                {isInStock ? (
                    <span className="text-green-600 font-medium">Con existencias</span>
                ) : (
                    <span className="text-destructive font-medium">Agotado</span>
                )}
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
                <Button
                    size="lg"
                    className="w-full"
                    disabled={!canAddToCart || isPending}
                    onClick={handleAddToCart}
                >
                    {isAdded ? (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Se agregó al carrito
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {isPending
                                ? 'Agregando...'
                                : !selectedVariant && variants.length > 0
                                    ? 'Seleccionar Variante'
                                    : !isInStock
                                        ? 'Agotado'
                                        : 'Agregar al Carrito'}
                        </>
                    )}
                </Button>
            </div>

            {/* SKU */}
            {product.kind === 'group' ? (
                selectedVariant && (
                    <div className="text-xs text-muted-foreground">
                        SKU: {selectedVariant.sku}
                    </div>
                )
            ) : (
                product.sku && (
                    <div className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                    </div>
                )
            )}
        </div>
    );
}
