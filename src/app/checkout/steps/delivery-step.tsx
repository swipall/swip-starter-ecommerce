'use client';

import { ShippingQuotesSkeleton } from '@/components/shared/skeletons/shipping-quotes-skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShipmentQuote, ShippingRate } from '@/lib/swipall/types/types';
import { Loader2, Package, Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getShippingQuotesAction, injectShippingServiceItemAction, setShipmentRatesAction, updateCartForPickup } from '../actions';
import { useCheckout } from '../checkout-provider';

interface DeliveryStepProps {
  onComplete: () => void;
}

type FulfillmentType = 'delivery' | 'pickup';

interface SelectedRate {
  shipmentId: string;
  rate: ShippingRate;
}

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const { order, deliveryItem, fulfillmentType, setFulfillmentType } = useCheckout();
  const [localFulfillmentType, setLocalFulfillmentType] = useState<FulfillmentType>(
    fulfillmentType || (order.for_delivery ? 'delivery' : 'pickup')
  );

  const [shipments, setShipments] = useState<ShipmentQuote[]>([]);
  const [freeShipping, setFreeShipping] = useState(false);
  const [selectedRates, setSelectedRates] = useState<SelectedRate[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addressId = order.shipment_address?.id ?? null;

  useEffect(() => {
    if (localFulfillmentType !== 'delivery' || !addressId) {
      setShipments([]);
      setSelectedRates([]);
      setQuotesError(null);
      return;
    }

    let cancelled = false;

    const fetchQuotes = async () => {
      setQuotesLoading(true);
      setQuotesError(null);
      try {
        const response = await getShippingQuotesAction(addressId);
        console.log('Shipping quotes response:', response);
        if (!cancelled) {
          setShipments(response.shipments ?? []);
          setFreeShipping(response.free_shipping);
          setSelectedRates([]);
        }
      } catch {
        if (!cancelled) {
          setQuotesError('No se pudieron obtener las opciones de envío. Intenta de nuevo.');
        }
      } finally {
        if (!cancelled) {
          setQuotesLoading(false);
        }
      }
    };

    fetchQuotes();

    return () => {
      cancelled = true;
    };
  }, [localFulfillmentType, addressId]);

  const handleRateSelect = async (shipmentId: string, rate: ShippingRate) => {
    setSelectedRates(prev => {
      const without = prev.filter(s => s.shipmentId !== shipmentId);
      return [...without, { shipmentId, rate }];
    });

    try {
      await injectShippingServiceItemAction(rate.amount, freeShipping);
    } catch {
      toast.error('Error', { description: 'No se pudo actualizar el costo de envío en el carrito' });
    }
  };

  const allShipmentsSelected = shipments.length > 0 &&
    shipments.every(s => selectedRates.some(r => r.shipmentId === s.id));

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      if (localFulfillmentType === 'delivery') {
        if (!allShipmentsSelected) {
          toast.error('Selecciona un método de envío para cada paquete');
          return;
        }
        await setShipmentRatesAction(selectedRates);
        setFulfillmentType('delivery');
      } else {
        await updateCartForPickup(deliveryItem);
        setFulfillmentType('pickup');
      }
      onComplete();
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo guardar el método de entrega',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue = localFulfillmentType === 'pickup' ||
    (localFulfillmentType === 'delivery' && allShipmentsSelected);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">¿Cómo deseas recibir tu pedido?</h3>
        <RadioGroup
          value={localFulfillmentType}
          onValueChange={(value) => setLocalFulfillmentType(value as FulfillmentType)}
        >
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
              <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
              <Label htmlFor="delivery" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Entrega a domicilio</span>
                </div>
                <p className="text-sm text-foreground">Recibirás tu pedido en la dirección especificada</p>
              </Label>
            </label>

            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
              <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
              <Label htmlFor="pickup" className="cursor-pointer flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-5 w-5" />
                  <span className="font-medium">Recoger en tienda</span>
                </div>
                <p className="text-sm text-foreground">Retira tu pedido en el punto de entrega</p>
              </Label>
            </label>
          </div>
        </RadioGroup>
      </div>

      {localFulfillmentType === 'delivery' && (
        <div className="space-y-4">
          <h3 className="font-semibold">Selecciona tu método de envío</h3>

          {!addressId && (
            <p className="text-sm text-muted-foreground">
              Selecciona una dirección de envío para ver las opciones de entrega disponibles.
            </p>
          )}

          {addressId && quotesLoading && <ShippingQuotesSkeleton />}

          {addressId && quotesError && (
            <div className="text-sm text-destructive border border-destructive/30 rounded-lg p-3">
              {quotesError}
            </div>
          )}

          {addressId && !quotesLoading && !quotesError && shipments.length > 0 && (
            <div className="space-y-4">
              {shipments.map((shipment, index) => (
                <div key={shipment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>Paquete {index + 1} — {shipment.weight} kg</span>
                  </div>

                  <RadioGroup
                    value={selectedRates.find(r => r.shipmentId === shipment.id)?.rate.object_id.toString() ?? ''}
                    onValueChange={(value) => {
                      const rate = shipment.rates.find(r => r.object_id.toString() === value);
                      if (rate) handleRateSelect(shipment.id, rate);
                    }}
                  >
                    <div className="space-y-2">
                      {shipment.rates.map((rate) => (
                        <label
                          key={rate.object_id}
                          className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={rate.object_id.toString()}
                              id={`rate-${shipment.id}-${rate.object_id}`}
                            />
                            <Label
                              htmlFor={`rate-${shipment.id}-${rate.object_id}`}
                              className="cursor-pointer font-medium"
                            >
                              {rate.provider}
                            </Label>
                          </div>
                          <span className="text-sm font-semibold">
                            {freeShipping
                              ? 'Envío gratis'
                              : rate.amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                          </span>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={isSubmitting || !canContinue}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continuar al pago
      </Button>
    </div>
  );
}
