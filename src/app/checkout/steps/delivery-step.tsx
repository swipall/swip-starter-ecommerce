'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Truck, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '../checkout-provider';
import { updateCartForDelivery, updateCartForPickup } from '../actions';

interface DeliveryStepProps {
  onComplete: () => void;
}

type FulfillmentType = 'delivery' | 'pickup';

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const router = useRouter();
  const { order, deliveryItem } = useCheckout();
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    deliveryItem ? 'delivery' : 'pickup'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasDeliveryOption = Boolean(deliveryItem);
  const deliveryPrice = deliveryItem?.web_price ? parseFloat(deliveryItem.web_price) : 0;

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      if (fulfillmentType === 'delivery' && hasDeliveryOption && deliveryItem) {
        await updateCartForDelivery(deliveryItem);
      } else {
        await updateCartForPickup(deliveryItem);
      }

      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting delivery options:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">¿Cómo deseas recibir tu pedido?</h3>
        <RadioGroup value={fulfillmentType} onValueChange={(value) => setFulfillmentType(value as FulfillmentType)}>
          <div className="space-y-3">
            {hasDeliveryOption && (
              <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                <Label htmlFor="delivery" className="cursor-pointer flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      <span className="font-medium">Entrega a domicilio</span>
                    </div>
                    <span className="font-semibold text-sm">
                      {deliveryPrice === 0
                        ? 'GRATIS'
                        : deliveryPrice.toLocaleString('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Recibirás tu pedido en la dirección especificada
                  </p>
                </Label>
              </label>
            )}
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition">
              <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
              <Label htmlFor="pickup" className="cursor-pointer flex-1">
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
        </RadioGroup>
      </div>

      <Button
        onClick={handleContinue}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continuar al pago
      </Button>
    </div>
  );
}
