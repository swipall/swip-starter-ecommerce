'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { useForm, Controller } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import useZipAutoComplete from '@/lib/use-zip-auto-complete';
import { AddressInterface } from '@/lib/swipall/users/user.types';

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

interface AddressFormProps {
  address?: AddressInterface;
  onSubmit: (data: Partial<AddressInterface>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AddressForm({ address, onSubmit, onCancel, isSubmitting }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors }, control, watch } = useForm<AddressFormData>({
    defaultValues: address ? {
      receiver: address.receiver || '',
      address: address.address,
      suburb: address.suburb || '',
      postal_code: address.postal_code,
      city: address.city,
      state: address.state,
      country: address.country,
      mobile: address.mobile || '',
      references: address.references || '',
    } : {
      country: 'México',
    }
  });

  const postalCode = watch('postal_code') || '';
  const { fetchingZip, states, cities, suburbs } = useZipAutoComplete(postalCode);

  const handleFormSubmit = async (data: AddressFormData) => {
    await onSubmit(address ? { ...data, id: address.id } : data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <FieldGroup className="my-6">
        <div className="grid grid-cols-2 gap-4">
          <Field className="col-span-2">
            <FieldLabel htmlFor="receiver">Nombre del receptor</FieldLabel>
            <Input
              id="receiver"
              {...register('receiver')}
              disabled={isSubmitting}
            />
            <FieldError>{errors.receiver?.message}</FieldError>
          </Field>

          <Field className="col-span-2">
            <FieldLabel htmlFor="address">Dirección *</FieldLabel>
            <Input
              id="address"
              {...register('address', { required: 'La dirección es requerida' })}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                  disabled={suburbs.length === 0 || fetchingZip || isSubmitting}
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
                  disabled={cities.length === 0 || fetchingZip || isSubmitting}
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
                  disabled={states.length === 0 || fetchingZip || isSubmitting}
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
              disabled={isSubmitting}
            />
            <FieldError>{errors.mobile?.message}</FieldError>
          </Field>

          <Field className="col-span-2">
            <FieldLabel htmlFor="references">Referencias adicionales</FieldLabel>
            <Input
              id="references"
              {...register('references')}
              placeholder="Ej: Cerca del banco, frente a la tienda..."
              disabled={isSubmitting}
            />
            <FieldError>{errors.references?.message}</FieldError>
          </Field>
        </div>
      </FieldGroup>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Guardando...' : 'Guardar dirección'}
        </Button>
      </div>
    </form>
  );
}
