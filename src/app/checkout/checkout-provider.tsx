'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import { CheckoutOrder } from './types';
import { InterfaceInventoryItem } from '@/lib/swipall/types/types';
import { AddressInterface } from '@/lib/swipall/users/user.types';


export interface PaymentMethodsInterface {
    id: string;
    label: string;
    description: string;
    icon: string;
    isEnabled: boolean;
}

export type FulfillmentType = 'delivery' | 'pickup' | null;

interface CheckoutContextType {
  order: CheckoutOrder;
  setOrder: (order: CheckoutOrder) => void;
  addresses: AddressInterface[];
  paymentMethods: PaymentMethodsInterface[];
  selectedPaymentMethodCode: string | null;
  setSelectedPaymentMethodCode: (code: string | null) => void;
  deliveryItem: InterfaceInventoryItem | null;
  fulfillmentType: FulfillmentType;
  setFulfillmentType: (type: FulfillmentType) => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  order: CheckoutOrder;
  addresses: AddressInterface[];
  paymentMethods: PaymentMethodsInterface[];
  deliveryItem: InterfaceInventoryItem | null;
}

export function CheckoutProvider({
  children,
  order: initialOrder,
  addresses,
  paymentMethods,
  deliveryItem,
}: CheckoutProviderProps) {
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string | null>(
    paymentMethods.length > 0 ? paymentMethods[0].id : null
  );

  const [order, setOrder] = useState<CheckoutOrder>(initialOrder);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(() => {
    if (initialOrder.for_pickup) return 'pickup';
    return 'delivery';
  });

  return (
    <CheckoutContext.Provider
      value={{
        order,
        setOrder,
        addresses,
        paymentMethods,
        selectedPaymentMethodCode,
        setSelectedPaymentMethodCode,
        deliveryItem,
        fulfillmentType,
        setFulfillmentType,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
