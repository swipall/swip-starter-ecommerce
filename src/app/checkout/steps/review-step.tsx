'use client';

import { Price } from '@/components/commerce/price';
import { Button } from '@/components/ui/button';
import { CreditCard, Edit, Loader2, MapPin, Truck } from 'lucide-react';
import { useState } from 'react';
import { processPayment } from '../actions';
import { useCheckout } from '../checkout-provider';
import { toast } from 'sonner';

interface ReviewStepProps {
    onEditStep: (step: 'shipping' | 'delivery' | 'payment') => void;
}

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
    const { order, paymentMethods, selectedPaymentMethodCode, deliveryItem, fulfillmentType } = useCheckout();
    const [loading, setLoading] = useState(false);

    const selectedPaymentMethod = paymentMethods.find(
        (method) => method.id === selectedPaymentMethodCode
    );

    const isForDelivery = order.for_delivery;
    const isForPickup = order.for_pickup;
    const handlePlaceOrder = async () => {        
        if (!selectedPaymentMethodCode) return;

        setLoading(true);
        try {
            const result = await processPayment(selectedPaymentMethodCode);
            
            // Handle client-side navigation/redirection
            if (result.type === 'redirect' && result.url) {
                window.location.href = result.url;
            } else if (result.type === 'navigate' && result.path) {
                window.location.href = result.path;
            }
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Ocurrió un error al procesar el pago.',
            });
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-lg">Revisa tu pedido</h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Shipping Address - Only show if delivery */}
                {fulfillmentType === 'delivery' && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-foreground" />
                            <h4 className="font-medium">Dirección de envío</h4>
                        </div>
                        {order.shipment_address ? (
                            <div className="text-sm space-y-3">
                                <div>
                                    <p className="font-medium">{order.shipment_address.receiver || 'Sin nombre'}</p>
                                    <p className="text-foreground">{order.shipment_address.address}</p>
                                    {order.shipment_address.suburb && (
                                        <p className="text-foreground">{order.shipment_address.suburb}</p>
                                    )}
                                    <p className="text-foreground">
                                        {order.shipment_address.city}, {order.shipment_address.state} {order.shipment_address.postal_code}
                                    </p>
                                    <p className="text-foreground">{order.shipment_address.country}</p>
                                    {order.shipment_address.mobile && (
                                        <p className="text-foreground">{order.shipment_address.mobile}</p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEditStep('shipping')}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Editar
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-foreground">No hay dirección de envío configurada</p>
                        )}
                    </div>
                )}

                {/* Delivery Method */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-foreground" />
                        <h4 className="font-medium">Método de entrega</h4>
                    </div>
                    <div className="text-sm space-y-3">
                        <div>
                            {isForDelivery && deliveryItem ? (
                                <>
                                    <p className="font-medium">Entrega a domicilio</p>
                                    <p className="text-foreground">
                                        {deliveryItem.web_price && parseFloat(deliveryItem.web_price) > 0
                                            ? <Price value={Number(deliveryItem.web_price)} />
                                            : 'GRATIS'}
                                    </p>
                                </>
                            ) : isForPickup ? (
                                <>
                                    <p className="font-medium">Recoger en tienda</p>
                                    <p className="text-foreground">Sin costo</p>
                                </>
                            ) : (
                                <p className="text-foreground">No hay método de entrega seleccionado</p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditStep('delivery')}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-foreground" />
                        <h4 className="font-medium">Método de pago</h4>
                    </div>
                    {selectedPaymentMethod ? (
                        <div className="text-sm space-y-3">
                            <div>
                                <p className="font-medium">{selectedPaymentMethod.label}</p>
                                {selectedPaymentMethod.description && (
                                    <p className="text-foreground mt-1">
                                        {selectedPaymentMethod.description}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditStep('payment')}
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                Editar
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-foreground">No hay método de pago seleccionado</p>
                    )}
                </div>
            </div>

            <Button
                onClick={handlePlaceOrder}
                disabled={
                    loading || 
                    !selectedPaymentMethodCode || 
                    (!isForDelivery && !isForPickup) ||
                    (fulfillmentType === 'delivery' && !order.shipment_address)
                }
                size="lg"
                className="w-full"
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar pedido
            </Button>

            {(!selectedPaymentMethodCode || (!isForDelivery && !isForPickup) || (fulfillmentType === 'delivery' && !order.shipment_address)) && (
                <p className="text-sm text-destructive text-center">
                    Por favor completa todos los pasos anteriores antes de confirmar tu pedido
                </p>
            )}
        </div>
    );
}
