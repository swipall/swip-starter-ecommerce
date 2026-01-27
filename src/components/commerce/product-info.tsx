'use client';

import { addToCart, getGroupVariant } from '@/app/product/[id]/actions';
import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { InterfaceInventoryItem, Material, ProductKind, ProductVariant, VariantOption } from '@/lib/swipall/types/types';
import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import ProductVariants from './product-variants';
import CompoundMaterialsSelector from './compound-materials-selector';

interface ProductInfoProps {
    product: InterfaceInventoryItem;
    searchParams: { [key: string]: string | string[] | undefined };
}

export type ExtraMaterialsInterface = {
    taxonomy: string;
    materials: Material[]
}[];

export function ProductInfo({ product, searchParams }: ProductInfoProps) {
    const router = useRouter();
    const currentSearchParams = useSearchParams();
    const redirectTo = currentSearchParams?.get('redirectTo') as string | undefined;
    const [isPending, startTransition] = useTransition();
    const [isAdded, setIsAdded] = useState(false);
    const [itemPrice, setItemPrice] = useState<number>(product.web_price ? parseFloat(product.web_price) : 0);
    // States for selected variant and attributes when product is of 'group' kind
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [variants, setVariants] = useState<VariantOption[]>([]);
    const [selectedSizeId, setSelectedSizeId] = useState<string>('');
    const [selectedColorId, setSelectedColorId] = useState<string>('');
    //States for selected materiales when product is of 'compound' kind
    const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([]);
    
    const materialIdToTaxonomy = useMemo(() => {
        const map = new Map<string, string>();
        product.extra_materials?.forEach(group => {
            group.materials.forEach((m: Material) => {
                map.set(m.id, group.taxonomy);
            });
        });
        return map;
    }, [product.extra_materials]);

    const generateVariantLabel = (kind: string) => {
        if (kind === 'size') return 'Tamaño';
        if (kind === 'color') return 'Color';
        return kind.charAt(0).toUpperCase() + kind.slice(1);
    }

    const formatVariants = (product: InterfaceInventoryItem) => {
        let variantsArray: VariantOption[] = [];

        product.attribute_combinations?.forEach((attr) => {
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
        if (product.kind === ProductKind.Group) {
            formatVariants(product);
        }
    }, [product]);

    useEffect(() => {
        const fetchVariant = async () => {
            if (selectedColorId && selectedSizeId) {
                try {
                    const params = {
                        color: selectedColorId,
                        size: selectedSizeId
                    };
                    const variant: ProductVariant = await getGroupVariant(product.id, params);
                    setSelectedVariant(variant);
                    setItemPrice(parseFloat(variant.web_price));
                } catch (error) {
                    console.error('Error fetching variant:', error);
                    toast.error('Error', {
                        description: 'No se pudo cargar la variante seleccionada',
                    });
                }
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
        const materialToRemove = selectedMaterials.find(m => m.id === materialId);
        if (materialToRemove) {
            setItemPrice(prev => prev - (parseFloat(materialToRemove.price) || 0));
        }
        setSelectedMaterials(prev => prev.filter(m => m.id !== materialId));
    }, [selectedMaterials]);

    const onSelectMaterial = useCallback((material: Material) => {
        const materialTaxonomy = materialIdToTaxonomy.get(material.id);

        if (materialTaxonomy) {
            const existingMaterial = getSelectedMaterialFromTaxonomy(materialTaxonomy);
            if (existingMaterial) {
                setItemPrice(prev => prev - (parseFloat(existingMaterial.price) || 0));
                setSelectedMaterials(prev => prev.filter(m => m.id !== existingMaterial.id));
            }
        }

        setItemPrice(prev => prev + (parseFloat(material.price) || 0));
        setSelectedMaterials(prev => [...prev, material]);
    }, [materialIdToTaxonomy, getSelectedMaterialFromTaxonomy]);

    const handleAddToCart = async () => {
        // For 'group' kind, require a selected variant
        if (product.kind === ProductKind.Group && !selectedVariant) {
            toast.error('Error', {
                description: 'Por favor selecciona color y tamaño',
            });
            return;
        }
        
        if (product.kind === ProductKind.Compound) {
            // if the user is not logged in, redirect to login page
            if (!redirectTo) {
                toast.error('Error', {
                    description: 'Por favor inicia sesión para agregar productos compuestos',
                });
                router.push(`/sign-in?redirectTo=/product/${product.id}`);
                return;
            }
        }
        
        // Determine item ID: for groups use variant ID, otherwise use product ID
        const itemId = product.kind === ProductKind.Group ? selectedVariant?.id : product.id;
        if (!itemId) return;

        startTransition(async () => {
            // Prepare parameters based on product kind
            const addToCartParams = {
                quantity: 1,
                extra_materials: product.kind === ProductKind.Compound ? selectedMaterials.map(m => m.id) : [],
                price: itemPrice
            };

            const result = await addToCart(itemId, addToCartParams);

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

    return (
        <div className="space-y-6">
            {/* Product Title */}
            <div>
                <p className="text-2xl font-bold mt-2">
                    <Price value={itemPrice || 0} />
                </p>
            </div>

            {/* Product Description */}
            <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description || '' }} />
            </div>

            {/* Variants Selection - only for group kind */}
            {product.kind === ProductKind.Group && variants.length > 0 && (
                <ProductVariants variants={variants} handleAttributeChange={handleAttributeChange} selectedSizeId={selectedSizeId} selectedColorId={selectedColorId} />
            )}

            {product.kind === ProductKind.Compound && product.extra_materials && product.extra_materials.length > 0 && (
                <CompoundMaterialsSelector extraMaterials={product.extra_materials} selectedMaterials={selectedMaterials} onSelectMaterial={onSelectMaterial} onRemoveMaterial={onRemoveMaterial} />
            )}

            {/* Stock Status */}
            <div className="text-sm">
                {isInStock ? (
                    <span className="text-green-600 font-medium">{availableQuantity} en existencia</span>
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
                                : !selectedVariant && product.kind === ProductKind.Group && variants.length > 0
                                    ? 'Seleccionar Variante'
                                    : !isInStock
                                        ? 'Agotado'
                                        : 'Agregar al Carrito'}
                        </>
                    )}
                </Button>
            </div>

            {/* SKU */}
            {product.kind === ProductKind.Group ? (
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
