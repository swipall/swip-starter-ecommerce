'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {loginAction} from './actions';
import {setAuthUser} from '@/lib/auth-client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardFooter} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.email('Por favor ingresa un correo electrónico válido'),
    password: z.string().min(1, 'Por favor ingresa una contraseña'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    redirectTo?: string;
}

export function LoginForm({redirectTo}: LoginFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: LoginFormData) => {
        setServerError(null);

        startTransition(async () => {
            const formData = new FormData();
            formData.append('email', data.email);
            formData.append('password', data.password);
            if (redirectTo) {
                formData.append('redirectTo', redirectTo);
            }

            try {
                const result = await loginAction(undefined, formData);                
                if (result?.error) {
                    setServerError(result.error);
                } else if (result?.success && result?.user) {
                    // Save user to localStorage
                    setAuthUser(result.user);
                    // Redirect after successful login and user saved
                    router.push(result.redirectTo || '/');
                    router.refresh();
                }
            } catch (error) {
                // Log any unexpected errors
                console.error('Login error:', error);
            }
        });
    };

    const registerHref = redirectTo
        ? `/register?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/register';

    return (
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="you@example.com"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Contraseña</FormLabel>
                                        <Link
                                            href="/forgot-password"
                                            className="text-muted-foreground hover:text-primary text-sm"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>

                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            disabled={isPending}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {serverError && (
                            <div className="text-sm text-destructive">
                                {serverError}
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 mt-2">
                        <div className="text-muted-foreground text-sm text-center">
                            ¿No tienes una cuenta?{' '}
                            <Link href={registerHref} className="hover:text-primary underline">
                                Regístrate
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}
