'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Truck, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '../checkout-provider';
import { setShippingMethod as setShippingMethodAction, updateCartForDelivery, updateCartForPickup } from '../actions';

interface DeliveryStepProps {
  onComplete: () => void;
}

type FulfillmentType = 'delivery' | 'pickup';

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const router = useRouter();
  const { shippingMethods, order, deliveryItem } = useCheckout();
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    deliveryItem ? 'delivery' : 'pickup'
  );
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => {
    // If order already has a shipping method selected, pre-select it
    if (order.shippingLines && order.shippingLines.length > 0) {
      return order.shippingLines[0].shippingMethod.id;
    }
    // Otherwise default to first method if there's only one
    return shippingMethods.length === 1 ? shippingMethods[0].id : null;
  });
  const [submitting, setSubmitting] = useState(false);

  const hasDeliveryOption = Boolean(deliveryItem);

  const handleContinue = async () => {
    setSubmitting(true);
    try {
      // Handle fulfillment type selection
      if (fulfillmentType === 'delivery' && hasDeliveryOption && deliveryItem) {
        await updateCartForDelivery(deliveryItem);
      } else {
        await updateCartForPickup(deliveryItem);
      }

      // If delivery type, also need to set shipping method
      if (fulfillmentType === 'delivery' && selectedMethodId) {
        await setShippingMethodAction(selectedMethodId);
      }

      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting delivery options:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = fulfillmentType === 'pickup' || (fulfillmentType === 'delivery' && selectedMethodId);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">¿Cómo deseas recibir tu pedido?</h3>
        <div className="space-y-3">
          {hasDeliveryOption && (
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
              <RadioGroup value={fulfillmentType} onValueChange={(value) => setFulfillmentType(value as FulfillmentType)}>
                <RadioGroupItem value="delivery" id="delivery" />
              </RadioGroup>
              <Label htmlFor="delivery" className="cursor-pointer flex-1 mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="h-5 w-5" />
                  <span className="font-medium">Entrega a domicilio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recibirás tu pedido en la dirección especificada
                </p>
              </Label>
            </label>
          )}
          <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
            <RadioGroup value={fulfillmentType} onValueChange={(value) => setFulfillmentType(value as FulfillmentType)}>
              <RadioGroupItem value="pickup" id="pickup" />
            </RadioGroup>
            <Label htmlFor="pickup" className="cursor-pointer flex-1 mt-1">
              <div className="flex items-center gap-2 mb-1">
                <Store className="h-5 w-5" />
                <span className="font-medium">Recoger en tienda</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Retira tu pedido en el punto de entrega
              </p>
            </Label>
          </label>
        </div>
      </div>

      {fulfillmentType === 'delivery' && hasDeliveryOption && shippingMethods.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Selecciona método de envío</h3>
          <RadioGroup value={selectedMethodId || ''} onValueChange={setSelectedMethodId}>
            {shippingMethods.map((method) => (
              <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Truck className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {method.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold">
                        {method.priceWithTax === 0
                          ? 'GRATIS'
                          : (method.priceWithTax / 100).toLocaleString('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                            })}
                      </p>
                    </div>
                  </div>
                </Card>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      <Button
        onClick={handleContinue}
        disabled={!canContinue || submitting}
        className="w-full"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continuar al pago
      </Button>
    </div>
  );
}
