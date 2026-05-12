import { ProductImageCarousel } from '@/components/commerce/product-image-carousel';
import { ExtraMaterialsInterface, ProductInfo } from '@/components/commerce/product-info';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    buildCanonicalUrl,
    buildOgImages,
    SITE_NAME,
    truncateDescription,
} from '@/lib/metadata';
import { getProduct } from '@/lib/swipall/rest-adapter';
import { InterfaceInventoryItem, Material, ProductKind } from '@/lib/swipall/types/types';
import type { Metadata } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { notFound } from 'next/navigation';
import { getCompoundMaterials } from './actions';
import { getAuthToken, getAuthUserCustomerId } from '@/lib/auth';

async function getProductData(id: string, customerId?: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`product-${id}`);

    try {
        const result = await getProduct(id, customerId);
        return result;
    } catch (error) {
        return null;
    }
}


const onGroupMaterialsByTaxonomy = (materials: Material[]): ExtraMaterialsInterface => {
    const grouped: { [id: string]: { id: string; value: string; materials: Material[] } } = {};

    (materials || []).forEach((item: any) => {
        const tax = item.material.taxonomy?.[0];
        const id = tax?.id || 'adicionales';
        const value = tax?.value || 'Adicionales';

        if (!grouped[id]) {
            grouped[id] = { id, value, materials: [] };
        }
        grouped[id].materials.push(item.material);
    });

    const compoundMaterials = Object.values(grouped)
        .sort((a, b) => a.value.localeCompare(b.value, 'es', { sensitivity: 'base' }))
        .map(({ value, materials }) => ({
            taxonomy: value,
            materials
        }));
    return compoundMaterials;
}

async function fetchProductMaterials(product: InterfaceInventoryItem | null) {
    if (!product) {
        return null;
    }
    const token = await getAuthToken();
    if (product.kind === ProductKind.Compound && token) {
        const compoundMaterials = await getCompoundMaterials(product.id, {});
        product.extra_materials = onGroupMaterialsByTaxonomy(compoundMaterials.results);
    }
    return product;
}

export async function generateMetadata({
    params,
}: PageProps<'/product/[id]'>): Promise<Metadata> {
    const { id: encodedId } = await params;
    const id = decodeURIComponent(encodedId);
    const customerId = await getAuthUserCustomerId();
    const result = await getProductData(id, customerId);

    const product = result;
    if (!product) {
        return {
            title: 'Producto no encontrado',
        };
    }

    const description = truncateDescription((product as any).description || product.name);
    const ogImage = product.featured_image;

    return {
        title: product.name,
        description: description || `Compra ${product.name} en ${SITE_NAME}`,
        alternates: {
            canonical: buildCanonicalUrl(`/product/${product.id}`),
        },
        openGraph: {
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            type: 'website',
            url: buildCanonicalUrl(`/product/${product.id}`),
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: description || `Compra ${product.name} en ${SITE_NAME}`,
            images: ogImage ? [ogImage] : undefined,
        },
    };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps<'/product/[id]'>) {
    const { id: encodedId } = await params;
    const searchParamsResolved = await searchParams;
    const id = decodeURIComponent(encodedId);
    const customerId = await getAuthUserCustomerId();
    const result = await getProductData(id, customerId);
    const product = await fetchProductMaterials(result);
    if (!product) {
        notFound();
    }
    // const primaryCollection = product.taxonomy?.[0]; //TODO: Supoort related products

    return (
        <>
            <div className="container mx-auto px-4 py-8 mt-[100] sm:mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Image Carousel */}
                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <ProductImageCarousel images={[
                            ...(product.featured_image ? [product.featured_image] : []),
                            ...(product.pictures?.map(p => p.url).filter(url => url !== product.featured_image) ?? []),
                        ]} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div>
                        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
                        {/* {product.description && (
                            <p className="text-white/50 mb-6">{product.description}</p>
                        )} */}
                        <ProductInfo product={product} searchParams={searchParamsResolved} />
                    </div>
                </div>
            </div>

            {/* Product Benefits Section */}
            <section className=" px-4">
                <div className="container mx-auto px-4 border border-white/50 rounded-xl p-8">
                    <div className='p-8'>
                        <div className='mb-8 pb-8'>
                            <h2 className="text-2xl font-bold text-center mb-8">Por qué elegirnos</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 text-center">
                            <div className="space-y-3">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold">Productos Pokémon coleccionables</h3>
                                <p className="text-white/50">En KOI conectamos a los entrenadores con lo mejor del universo Pokémon TCG. Desde la elegancia de las Premium Collections y el equipo completo de las ETB, hasta la exclusividad de los High Class Packs japoneses.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold">Originalidad</h3>
                                <p className="text-white/50">Originalidad garantizada, envíos rápidos y la mejor selección para tu colección. ¡Haz que tu deck evolucione con KOI!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Store FAQ Section */}
            <section className="py-16 bg-muted/30 hidden">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="shipping">
                            <AccordionTrigger>¿Cuáles son sus opciones de envío?</AccordionTrigger>
                            <AccordionContent>
                                Ofrecemos envío estándar (5-7 días hábiles), envío exprés (2-3 días hábiles) y entrega al día siguiente para áreas selectas. El envío estándar es gratuito en pedidos superiores a $50.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="returns">
                            <AccordionTrigger>¿Cuál es su política de devoluciones?</AccordionTrigger>
                            <AccordionContent>
                                Aceptamos devoluciones dentro de los 30 días posteriores a la compra. Los artículos deben estar sin usar y en su embalaje original. Simplemente contacte a nuestro equipo de soporte para iniciar una devolución y recibir una etiqueta de envío prepagada.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="tracking">
                            <AccordionTrigger>¿Cómo puedo rastrear mi pedido?</AccordionTrigger>
                            <AccordionContent>
                                Una vez que su pedido sea enviado, recibirá un correo electrónico con un número de seguimiento. También puede ver el estado de su pedido en cualquier momento iniciando sesión en su cuenta y visitando la sección de historial de pedidos.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="international">
                            <AccordionTrigger>¿Ofrecen envíos internacionales?</AccordionTrigger>
                            <AccordionContent>
                                ¡Sí! Enviamos a más de 50 países en todo el mundo. Las tarifas y los tiempos de entrega internacionales varían según la ubicación. Puede ver el costo exacto en la caja antes de completar su compra.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {/* {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )} */}
        </>
    );
}
