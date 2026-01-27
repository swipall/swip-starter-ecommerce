'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useZipAutoComplete from '@/lib/use-zip-auto-complete';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { createCustomerAddress, registerCustomerInfo, updateShippingAddressForCart } from '../actions';
import { useCheckout } from '../checkout-provider';

interface ShippingAddressStepProps {
  onComplete: () => void;
}

interface AddressFormData {
  address: string;
  suburb: string;
  postal_code: string;
  city: string;
  state: string;
  country: string;
  receiver?: string;
  references?: string;
  mobile?: string;
}

export default function ShippingAddressStep({ onComplete }: ShippingAddressStepProps) {
  const router = useRouter();
  const { addresses, order } = useCheckout();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    if (order.shipment_address) {
      const matchingAddress = addresses.find(
        (a) => a.id === order.shipment_address?.id
      );
      if (matchingAddress) return matchingAddress.id;
    }
    return null;
  });
  const [dialogOpen, setDialogOpen] = useState(addresses.length === 0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getDefaultFormValues = (): Partial<AddressFormData> => {
    return {
      country: 'México',
    };
  };

  const { register, handleSubmit, formState: { errors }, reset, control, watch, setValue } = useForm<AddressFormData>({
    defaultValues: getDefaultFormValues()
  });

  const postalCode = watch('postal_code') || '';
  const { fetchingZip, states, cities, suburbs } = useZipAutoComplete(postalCode);

  const handleSelectExistingAddress = async () => {
    if (!selectedAddressId) return;

    setLoading(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) return;

      // Update shipping address using server action
      await updateShippingAddressForCart(selectedAddress.id);

      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting address:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSaveNewAddress = async (data: AddressFormData) => {
    setSaving(true);
    try {
        if(addresses.length === 0){
            // if is the first address we create the customer info
            await registerCustomerInfo(data);
        }
      const response = await createCustomerAddress(data);
      const addressData = (response as any)?.data || (response as any);
      if (addressData?.id) {
        // Update cart with new shipping address using server action
        await updateShippingAddressForCart(addressData.id);
        setDialogOpen(false);
        reset();
        router.refresh();
        setSelectedAddressId(addressData.id);
        onComplete();
      }
    } catch (error) {
      console.error('Error creating address:', error);
      alert(`Error creating address: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Selecciona una dirección guardada</h3>
          <RadioGroup value={selectedAddressId || ''} onValueChange={setSelectedAddressId}>
            {addresses.map((address) => (
              <div key={address.id} className="flex items-start space-x-3">
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Label htmlFor={address.id} className="flex-1 cursor-pointer">
                  <Card className="p-4">
                    <div className="leading-tight space-y-0">
                      <p className="font-medium">{address.receiver || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.address}
                        {address.suburb && `, ${address.suburb}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-sm text-muted-foreground">{address.country}</p>
                      {address.mobile && <p className="text-sm text-muted-foreground">{address.mobile}</p>}
                      {address.references && <p className="text-sm text-muted-foreground">Referencias: {address.references}</p>}
                    </div>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-3">
            <Button
              onClick={handleSelectExistingAddress}
              disabled={!selectedAddressId || loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar con la dirección seleccionada
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  Agregar nueva dirección
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSaveNewAddress)}>
                  <DialogHeader>
                    <DialogTitle>Agregar nueva dirección</DialogTitle>
                    <DialogDescription>
                      Completa el formulario a continuación para agregar una nueva dirección de envío
                    </DialogDescription>
                  </DialogHeader>

                  <FieldGroup className="my-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Field className="col-span-2">
                        <FieldLabel htmlFor="receiver">Nombre del receptor</FieldLabel>
                        <Input
                          id="receiver"
                          {...register('receiver')}
                        />
                        <FieldError>{errors.receiver?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="address">Dirección *</FieldLabel>
                        <Input
                          id="address"
                          {...register('address', { required: 'La dirección es requerida' })}
                        />
                        <FieldError>{errors.address?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="postal_code">Código Postal *</FieldLabel>
                        <Input
                          id="postal_code"
                          {...register('postal_code', { required: 'El código postal es requerido' })}
                          maxLength={5}
                          placeholder="12345"
                        />
                        <FieldError>{errors.postal_code?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="country">País</FieldLabel>
                        <Input
                          id="country"
                          {...register('country')}
                          disabled
                        />
                        <FieldError>{errors.country?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="suburb">Localidad/Barrio</FieldLabel>
                        <Controller
                          name="suburb"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={suburbs.length === 0 || fetchingZip}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona una localidad"} />
                              </SelectTrigger>
                              <SelectContent>
                                {suburbs.map((suburb: string, idx: number) => (
                                  <SelectItem key={idx} value={suburb}>
                                    {suburb}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError>{errors.suburb?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                        <Controller
                          name="city"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={cities.length === 0 || fetchingZip}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona una ciudad"} />
                              </SelectTrigger>
                              <SelectContent>
                                {cities.map((city: string, idx: number) => (
                                  <SelectItem key={idx} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError>{errors.city?.message}</FieldError>
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="state">Estado</FieldLabel>
                        <Controller
                          name="state"
                          control={control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={states.length === 0 || fetchingZip}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona un estado"} />
                              </SelectTrigger>
                              <SelectContent>
                                {states.map((state: string, idx: number) => (
                                  <SelectItem key={idx} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <FieldError>{errors.state?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="mobile">Teléfono Móvil</FieldLabel>
                        <Input
                          id="mobile"
                          type="tel"
                          {...register('mobile')}
                        />
                        <FieldError>{errors.mobile?.message}</FieldError>
                      </Field>

                      <Field className="col-span-2">
                        <FieldLabel htmlFor="references">Referencias adicionales</FieldLabel>
                        <Input
                          id="references"
                          {...register('references')}
                          placeholder="Ej: Cerca del banco, frente a la tienda..."
                        />
                        <FieldError>{errors.references?.message}</FieldError>
                      </Field>
                    </div>
                  </FieldGroup>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Guardar dirección
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}

      {addresses.length === 0 && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit(onSaveNewAddress)}>
              <DialogHeader>
                <DialogTitle>Agregar dirección de envío</DialogTitle>
                <DialogDescription>
                  Completa el formulario a continuación para agregar tu dirección de envío
                </DialogDescription>
              </DialogHeader>

              <FieldGroup className="my-6">
                <div className="grid grid-cols-2 gap-4">
                  <Field className="col-span-2">
                    <FieldLabel htmlFor="receiver">Nombre del receptor</FieldLabel>
                    <Input
                      id="receiver"
                      {...register('receiver')}
                    />
                    <FieldError>{errors.receiver?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="address">Dirección *</FieldLabel>
                    <Input
                      id="address"
                      {...register('address', { required: 'La dirección es requerida' })}
                    />
                    <FieldError>{errors.address?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="postal_code">Código Postal *</FieldLabel>
                    <Input
                      id="postal_code"
                      {...register('postal_code', { required: 'El código postal es requerido' })}
                      maxLength={5}
                      placeholder="12345"
                    />
                    <FieldError>{errors.postal_code?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="country">País</FieldLabel>
                    <Input
                      id="country"
                      {...register('country')}
                      disabled
                    />
                    <FieldError>{errors.country?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="suburb">Localidad/Barrio</FieldLabel>
                    <Controller
                      name="suburb"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={suburbs.length === 0 || fetchingZip}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona una localidad"} />
                          </SelectTrigger>
                          <SelectContent>
                            {suburbs.map((suburb: string, idx: number) => (
                              <SelectItem key={idx} value={suburb}>
                                {suburb}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{errors.suburb?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="city">Ciudad</FieldLabel>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={cities.length === 0 || fetchingZip}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona una ciudad"} />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((city: string, idx: number) => (
                              <SelectItem key={idx} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{errors.city?.message}</FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="state">Estado</FieldLabel>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={states.length === 0 || fetchingZip}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={fetchingZip ? "Cargando..." : "Selecciona un estado"} />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state: string, idx: number) => (
                              <SelectItem key={idx} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{errors.state?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="mobile">Teléfono Móvil</FieldLabel>
                    <Input
                      id="mobile"
                      type="tel"
                      {...register('mobile')}
                    />
                    <FieldError>{errors.mobile?.message}</FieldError>
                  </Field>

                  <Field className="col-span-2">
                    <FieldLabel htmlFor="references">Referencias adicionales</FieldLabel>
                    <Input
                      id="references"
                      {...register('references')}
                      placeholder="Ej: Cerca del banco, frente a la tienda..."
                    />
                    <FieldError>{errors.references?.message}</FieldError>
                  </Field>
                </div>
              </FieldGroup>

              <DialogFooter>
                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar dirección
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
