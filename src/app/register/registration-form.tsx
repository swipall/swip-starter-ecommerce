'use client';

import { useState, useTransition } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';

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
}).refine((data) => data.password1 === data.password2, {
    message: "Las contraseñas no coinciden",
    path: ["password2"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
    redirectTo?: string;
}

export function RegistrationForm({ redirectTo }: RegistrationFormProps) {
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
        },
    });

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
            if (redirectTo) {
                formData.append('redirectTo', redirectTo);
            }

            try {
                const result = await registerAction(undefined, formData);
                if (result?.error) {
                    setServerError(result.error);
                }
            } catch (error) {
                // Redirect errors are expected, ignore them
                if (error instanceof Error && error.message.includes('redirect')) {
                    return;
                }
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

                        {serverError && (
                            <div className="text-sm text-destructive">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
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
