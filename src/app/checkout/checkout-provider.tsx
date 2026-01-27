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

interface CheckoutContextType {
  order: CheckoutOrder;
  addresses: AddressInterface[];
  paymentMethods: PaymentMethodsInterface[];
  selectedPaymentMethodCode: string | null;
  setSelectedPaymentMethodCode: (code: string | null) => void;
  deliveryItem: InterfaceInventoryItem | null;
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
  order,
  addresses,
  paymentMethods,
  deliveryItem,
}: CheckoutProviderProps) {
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string | null>(
    paymentMethods.length === 1 ? paymentMethods[0].id : null
  );

  return (
    <CheckoutContext.Provider
      value={{
        order,
        addresses,
        paymentMethods,
        selectedPaymentMethodCode,
        setSelectedPaymentMethodCode,
        deliveryItem,
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
