'use client';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';
import { useCheckout } from '../checkout-provider';

interface PaymentStepProps {
  onComplete: () => void;
}

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: typeof CreditCard } = {
    'credit-card': CreditCard,
    'money': DollarSign,
  };
  return icons[iconName] || CreditCard;
};

export default function PaymentStep({ onComplete }: PaymentStepProps) {
  const { paymentMethods, selectedPaymentMethodCode, setSelectedPaymentMethodCode } = useCheckout();

  const handleContinue = () => {
    if (!selectedPaymentMethodCode) return;
    onComplete();
  };

  const enabledPaymentMethods = paymentMethods.filter((method) => method.isEnabled);

  if (enabledPaymentMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground">No hay métodos de pago disponibles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Selecciona método de pago</h3>

      <RadioGroup value={selectedPaymentMethodCode || ''} onValueChange={setSelectedPaymentMethodCode}>
        {enabledPaymentMethods.map((method) => {
          const IconComponent = getIconComponent(method.icon);
          return (
            <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <IconComponent className="h-5 w-5 text-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{method.label}</p>
                    {method.description && (
                      <p className="text-sm text-foreground mt-1">
                        {method.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      <Button
        onClick={handleContinue}
        disabled={!selectedPaymentMethodCode}
        className="w-full"
      >
        Continuar a revisión
      </Button>
    </div>
  );
}
