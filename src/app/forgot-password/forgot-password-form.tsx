'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requestPasswordResetAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
    emailAddress: z.email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
    const [isPending, startTransition] = useTransition();
    const [success, setSuccess] = useState(false);

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            emailAddress: '',
        },
    });

    const onSubmit = (data: ForgotPasswordFormData) => {
        if (isPending) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append('emailAddress', data.emailAddress);

            const result = await requestPasswordResetAction(undefined, formData);
            if (result?.error) {
                toast.error('Error', { description: result.error });
            } else if (result?.success) {
                setSuccess(true);
            }
        });
    };

    if (success) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revisa tu correo</CardTitle>
                    <CardDescription>
                        Si existe una cuenta con ese correo, hemos enviado instrucciones para restablecer la contraseña.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setSuccess(false)} asChild>
                        <Link href="/sign-in">
                            Volver a Iniciar Sesión
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recuperar contraseña</CardTitle>
                <CardDescription>
                    Ingresa tu correo electrónico y recibe las instrucciones para recuperar tu contraseña
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="emailAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Enviando...' : 'Recuperar contraseña'}
                        </Button>
                        <Link
                            href="/sign-in"
                            className="text-sm text-center text-foreground hover:text-primary"
                        >
                            Volver a Iniciar Sesión
                        </Link>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
