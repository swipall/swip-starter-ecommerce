'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useZipAutoComplete from '@/lib/use-zip-auto-complete';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { registerAction } from './actions';
import { setAuthUser } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { CurrentUser } from '@/lib/swipall/types/types';

function indexSpaceBetween(value: string) {
    return value.search(" ");
}

const createUserName = (first_name: string, last_name: string): string => {
    let username = "";
    const randomNum = Math.floor(Math.random() * (9999 - 999) + 999);
    const fL = last_name.charAt(0).toLowerCase();
    const SlIndex = indexSpaceBetween(last_name);
    if (SlIndex !== -1) {
        const sL = last_name.charAt(SlIndex + 1).toLowerCase();
        const fNameIndex = indexSpaceBetween(first_name);
        if (fNameIndex !== -1) {
            username = fL + sL + first_name.substring(0, fNameIndex).toLowerCase();
        } else {
            username = fL + sL + first_name;
        }
    } else {
        const fNameIndex = indexSpaceBetween(first_name);
        if (fNameIndex !== -1) {
            username = fL + first_name.substring(0, fNameIndex).toLowerCase();
        } else {
            username = fL + first_name.toLowerCase();
        }
    }
    username += randomNum;
    return username;
};

const registrationSchema = z.object({
    email: z.string().email('Por favor ingresa un correo electrónico válido'),
    first_name: z.string().min(1, 'El nombre es requerido'),
    last_name: z.string().min(1, 'El apellido es requerido'),
    password1: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password2: z.string(),
    address: z.string().min(1, 'La dirección es requerida'),
    suburb: z.string().min(1, 'La localidad es requerida'),
    postal_code: z.string().min(1, 'El código postal es requerido'),
    city: z.string().min(1, 'La ciudad es requerida'),
    state: z.string().min(1, 'El estado es requerido'),
    country: z.string().min(1, 'El país es requerido'),
    mobile: z.string().min(1, 'El teléfono móvil es requerido'),
    references: z.string().optional(),
}).refine((data) => data.password1 === data.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    redirectTo?: string;
}

export function RegistrationForm({ redirectTo }: RegistrationFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            email: '',
            first_name: '',
            last_name: '',
            password1: '',
            password2: '',
            address: '',
            suburb: '',
            postal_code: '',
            city: '',
            state: '',
            country: 'México',
            mobile: '',
            references: '',
        },
    });

    // Watch postal code changes to auto-complete address fields
    const postalCode = form.watch('postal_code') || '';
    const { fetchingZip, states, cities, suburbs } = useZipAutoComplete(postalCode);

    const onSubmit = (data: RegistrationFormData) => {
        setServerError(null);

        // Validar que los nombres no sean vacíos
        if (!data.first_name.trim() || !data.last_name.trim()) {
            setServerError('El nombre y el apellido son requeridos');
            return;
        }

        // Generar username automáticamente
        const generatedUsername = createUserName(data.first_name, data.last_name);

        startTransition(async () => {
            const formData = new FormData();
            formData.append('email', data.email);
            formData.append('username', generatedUsername);
            formData.append('first_name', data.first_name);
            formData.append('last_name', data.last_name);
            formData.append('password1', data.password1);
            formData.append('password2', data.password2);
            formData.append('address', data.address);
            formData.append('suburb', data.suburb);
            formData.append('postal_code', data.postal_code);
            formData.append('city', data.city);
            formData.append('state', data.state);
            formData.append('country', data.country);
            formData.append('mobile', data.mobile);
            formData.append('references', data.references || '');
            if (redirectTo) {
                formData.append('redirectTo', redirectTo);
            }

            try {
                const result = await registerAction(undefined, formData);
                if (result?.error) {
                    setServerError(result.error);
                } else if (result?.success && result?.user) {
                    // Save user to localStorage
                    setAuthUser(result.user as CurrentUser);
                    // Redirect after successful registration and user saved
                    router.push(result.redirectTo || '/');
                    router.refresh();
                }
            } catch (error) {
                // Log any unexpected errors
                console.error('Registration error:', error);
            }
        });
    };

    const signInHref = redirectTo
        ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in';

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="tu@ejemplo.com"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Juan"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellido</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="García"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="password1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                disabled={isPending}
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" aria-hidden />
                                                ) : (
                                                    <Eye className="h-4 w-4" aria-hidden />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                disabled={isPending}
                                                className="pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" aria-hidden />
                                                ) : (
                                                    <Eye className="h-4 w-4" aria-hidden />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Address Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold text-sm mb-4">Información de Dirección</h3>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dirección *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Calle, número"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Código Postal *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="12345"
                                                maxLength={5}
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="suburb"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localidad/Barrio *</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={suburbs.length === 0 || fetchingZip || isPending}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={fetchingZip ? "Cargando..." : suburbs.length === 0 ? "Ingresa código postal" : "Selecciona una localidad"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {suburbs.map((suburb: string, idx: number) => (
                                                            <SelectItem key={idx} value={suburb}>
                                                                {suburb}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ciudad *</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={cities.length === 0 || fetchingZip || isPending}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={fetchingZip ? "Cargando..." : cities.length === 0 ? "Ingresa código postal" : "Selecciona una ciudad"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {cities.map((city: string, idx: number) => (
                                                            <SelectItem key={idx} value={city}>
                                                                {city}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado/Provincia *</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={states.length === 0 || fetchingZip || isPending}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={fetchingZip ? "Cargando..." : states.length === 0 ? "Ingresa código postal" : "Selecciona un estado"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {states.map((state: string, idx: number) => (
                                                            <SelectItem key={idx} value={state}>
                                                                {state}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>País</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="México"
                                                    disabled={true}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Teléfono Móvil *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="+52 1234567890"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="references"
                                render={({ field }) => (
                                    <FormItem className="mt-4">
                                        <FormLabel>Referencias</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Ej. Cerca del parque"
                                                disabled={isPending}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {serverError && (
                            <div className="text-sm text-destructive">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-pink-400 hover:bg-pink-600 dark:bg-pink-900 dark:text-white  hover:bg-pink-600 dark:bg-pink-900 dark:text-white font-bold" disabled={isPending}>
                            {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-4">

                        <div className="text-sm text-center text-muted-foreground">
                            ¿Ya tienes una cuenta?{' '}
                            <Link href={signInHref} className="hover:text-primary underline">
                                Inicia sesión
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
