'use client';

import { addToCart, getGroupVariant, testApiMiddleWare } from '@/app/product/[id]/actions';
import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { InterfaceInventoryItem, Material, ProductKind, ProductVariant, VariantOption } from '@/lib/swipall/types/types';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import ProductVariants from './product-variants';
import CompoundMaterialsSelector from './compound-materials-selector';
import { useAuthUser } from '@/hooks/use-auth-user';

interface ProductInfoProps {
    product: InterfaceInventoryItem;
    searchParams: { [key: string]: string | string[] | undefined };
}

export type ExtraMaterialsInterface = {
    taxonomy: string;
    materials: Material[]
}[];

const VARIANT_LABELS: Record<string, string> = {
    size: 'Tamaño',
    color: 'Color',
};

const AUTO_RESET_DELAY = 2000;

export function ProductInfo({ product, searchParams }: ProductInfoProps) {
    const router = useRouter();
    const { user } = useAuthUser();
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [variants, setVariants] = useState<VariantOption[]>([]);
    const [selectedSizeId, setSelectedSizeId] = useState<string>('');
    const [selectedColorId, setSelectedColorId] = useState<string>('');

    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);

    const itemPrice = useMemo(() => {
        if (product.kind === ProductKind.Group && selectedVariant) {
            const variantPrice = parseFloat(selectedVariant.price) || 0;
            const variantWebPrice = parseFloat(selectedVariant.web_price) || 0;
            return variantPrice || variantWebPrice;
        }

        const priceVal = parseFloat(product.price) || 0;
        const webPriceVal = parseFloat(product.web_price) || 0;
        const basePrice = priceVal || webPriceVal;

        if (product.kind === ProductKind.Compound) {
            const materialsPrice = selectedMaterials.reduce(
                (sum, material) => sum + (parseFloat(material.price) || 0),
                0
            );
            return basePrice + materialsPrice;
        }

        return basePrice;
    }, [product, selectedVariant, selectedMaterials]);

    const originalPrice = useMemo(() => {
        if (product.kind === ProductKind.Group && selectedVariant) {
            const variantPrice = parseFloat(selectedVariant.price) || 0;
            const variantWebPrice = parseFloat(selectedVariant.web_price) || 0;
            return variantWebPrice > variantPrice ? variantWebPrice : undefined;
        }
        const priceVal = parseFloat(product.price) || 0;
        const webPriceVal = parseFloat(product.web_price) || 0;
        const finalPrice = priceVal || webPriceVal;
        return webPriceVal > finalPrice ? webPriceVal : undefined;
    }, [product, selectedVariant]);

    const materialIdToTaxonomy = useMemo(() => {
        const map = new Map<string, string>();
        product.extra_materials?.forEach(group => {
            group.materials.forEach((m: Material) => {
                map.set(m.id, group.taxonomy);
            });
        });
        return map;
    }, [product.extra_materials]);

    const generateVariantLabel = useCallback((kind: string): string => {
        return VARIANT_LABELS[kind] || kind.charAt(0).toUpperCase() + kind.slice(1);
    }, []);

    const formatVariants = useCallback((product: InterfaceInventoryItem) => {
        const variantsMap = new Map<string, VariantOption>();

        product.attribute_combinations?.forEach((attr) => {
            const existingVariant = variantsMap.get(attr.kind);
            const value = {
                key: attr.id,
                name: attr.name,
                value: attr.value
            };

            if (existingVariant) {
                existingVariant.values.push(value);
            } else {
                variantsMap.set(attr.kind, {
                    label: generateVariantLabel(attr.kind),
                    kind: attr.kind,
                    values: [value]
                });
            }
        });

        return Array.from(variantsMap.values());
    }, [generateVariantLabel]);

    useEffect(() => {
        if (product.kind === ProductKind.Group) {
            setVariants(formatVariants(product));
        }

        return () => {
            setVariants([]);
            setSelectedMaterials([]);
            setSelectedVariant(null);
            setSelectedColorId('');
            setSelectedSizeId('');
        };
    }, [product, formatVariants]);

    useEffect(() => {
        const fetchVariant = async () => {
            if (!selectedColorId || !selectedSizeId) return;

            try {
                const params = { color: selectedColorId, size: selectedSizeId };
                const variant = await getGroupVariant(product.id, params);
                setSelectedVariant(variant);
            } catch (error) {
                console.error('Error fetching variant:', error);
                toast.error('Error', {
                    description: 'No se pudo cargar la variante seleccionada',
                });
            }
        };

        fetchVariant();
    }, [selectedColorId, selectedSizeId, product.id]);

    const handleAttributeChange = useCallback((kind: string, valueId: string) => {
        if (kind === 'size') {
            setSelectedSizeId(valueId);
        } else if (kind === 'color') {
            setSelectedColorId(valueId);
        }
    }, []);

    const getSelectedMaterialFromTaxonomy = useCallback((taxonomyName: string): Material | undefined => {
        return selectedMaterials.find(sm => materialIdToTaxonomy.get(sm.id) === taxonomyName);
    }, [selectedMaterials, materialIdToTaxonomy]);

    const onRemoveMaterial = useCallback((materialId: string) => {
        setSelectedMaterials(prev => prev.filter(m => m.id !== materialId));
    }, []);

    const onSelectMaterial = useCallback((material: Material) => {
        const materialTaxonomy = materialIdToTaxonomy.get(material.id);

        setSelectedMaterials(prev => {
            if (materialTaxonomy) {
                const existingMaterial = prev.find(
                    m => materialIdToTaxonomy.get(m.id) === materialTaxonomy
                );

                if (existingMaterial) {
                    return prev.map(m => m.id === existingMaterial.id ? material : m);
                }
            }

            return [...prev, material];
        });
    }, [materialIdToTaxonomy]);

    const handleAddToCart = useCallback(async () => {
        if (product.kind === ProductKind.Group && !selectedVariant) {
            toast.error('Error', {
                description: 'Por favor selecciona color y tamaño',
            });
            return;
        }

        if (product.kind === ProductKind.Compound && !user) {
            toast.error('Error', {
                description: 'Por favor inicia sesión para agregar productos compuestos',
            });
            router.push(`/sign-in?redirectTo=/product/${product.id}`);
            return;
        }

        const itemId = product.kind === ProductKind.Group ? selectedVariant?.id : product.id;
        if (!itemId) return;

        startTransition(async () => {
            const addToCartParams = {
                quantity: 1,
                extra_materials: product.kind === ProductKind.Compound
                    ? selectedMaterials.map(mat => ({ material_id: mat.id, name: mat.name }))
                    : [],
                price: itemPrice,
                item: itemId
            };

            const result = await addToCart(itemId, addToCartParams);

            if (result.success) {
                setIsAdded(true);
                toast.success('Agregado al carrito', {
                    description: `${product.name} ha sido agregado a tu carrito`,
                });

                setTimeout(() => setIsAdded(false), AUTO_RESET_DELAY);
            } else {
                toast.error('Error', {
                    description: result.error || 'Ocurrió un error al agregar al carrito',
                });
            }
        });
    }, [product, selectedVariant, selectedMaterials, user, router, itemPrice]);

    const isInStock = useMemo(() =>
        product.kind === ProductKind.Group
            ? (selectedVariant?.available?.quantity ?? 0) > 0
            : (product.available?.quantity ?? 0) > 0
        , [product.kind, product.available?.quantity, selectedVariant?.available?.quantity]);

    const availableQuantity = useMemo(() =>
        product.kind === ProductKind.Group
            ? selectedVariant?.available?.quantity ?? 0
            : product.available?.quantity ?? 0
        , [product.kind, product.available?.quantity, selectedVariant?.available?.quantity]);

    const canAddToCart = useMemo(() =>
        product.kind === ProductKind.Group
            ? !!selectedVariant && isInStock
            : isInStock
        , [product.kind, selectedVariant, isInStock]);

    const buttonText = useMemo(() => {
        if (isAdded) return 'Se agregó al carrito';
        if (isPending) return 'Agregando...';
        if (!selectedVariant && product.kind === ProductKind.Group && variants.length > 0) {
            return 'Seleccionar Variante';
        }
        if (!isInStock) return 'Agotado';
        return 'Agregar al Carrito';
    }, [isAdded, isPending, selectedVariant, product.kind, variants.length, isInStock]);

    return (
        <div className="space-y-6">
            {product.kind === ProductKind.Group ? (
                selectedVariant?.sku && (
                    <div className="text-xs text-foreground">
                        SKU: {selectedVariant.sku}
                    </div>
                )
            ) : (
                product.sku && (
                    <div className="text-xs text-foreground">
                        SKU: {product.sku}
                    </div>
                )
            )}
            <div className='flex items-center gap-2'>
                <div className="flex flex-col">
                    <p className="text-2xl font-bold">
                        <Price value={itemPrice} />
                    </p>
                    {originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                            <Price value={originalPrice} />
                        </p>
                    )}
                </div>
                <div className="text-sm">
                    {isInStock ? (
                        <span className="bg-emerald-200 text-emerald-900 font-bold px-2 py-1 rounded-full">
                            {availableQuantity} en existencia
                        </span>
                    ) : (
                        <span className="bg-red-200 text-red-900 px-2 py-1 rounded-full font-bold">Agotado</span>
                    )}
                </div>
            </div>

            {product.kind === ProductKind.Group && variants.length > 0 && (
                <ProductVariants
                    variants={variants}
                    handleAttributeChange={handleAttributeChange}
                    selectedSizeId={selectedSizeId}
                    selectedColorId={selectedColorId}
                />
            )}

            {product.kind === ProductKind.Compound && product.extra_materials && product.extra_materials.length > 0 && (
                <CompoundMaterialsSelector
                    extraMaterials={product.extra_materials}
                    selectedMaterials={selectedMaterials}
                    onSelectMaterial={onSelectMaterial}
                    onRemoveMaterial={onRemoveMaterial}
                />
            )}



            <div className="pt-4">
                <Button
                    size="lg"
                    className="w-full text-lg font-bold"
                    disabled={!canAddToCart || isPending}
                    onClick={handleAddToCart}
                >
                    {isAdded ? (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            {buttonText}
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            {buttonText}
                        </>
                    )}
                </Button>
            </div>
            <div className="prose prose-sm max-w-none">
                <div className='text-sm text-primary uppercase my-2 font-semibold'>Descripción</div>
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>
        </div>
    );
}
