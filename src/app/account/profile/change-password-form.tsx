'use client';

import { useActionState, useEffect, useState } from 'react';
import { updatePasswordAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthUser } from '@/lib/auth-client';
import { CurrentUser } from '@/lib/swipall/types/types';
import { Eye, EyeOff } from 'lucide-react';

export function ChangePasswordForm() {
    const storedUser: CurrentUser | null = getAuthUser();
    const [state, formAction, isPending] = useActionState(updatePasswordAction, undefined);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('change-password-form') as HTMLFormElement;
            form?.reset();
        }
    }, [state?.success]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>
                    Actualiza tu contraseña para mantener tu cuenta segura.
                </CardDescription>
            </CardHeader>
            <form id="change-password-form" action={formAction}>
                <CardContent className="space-y-4">
                    <input type="hidden" name="userToken" value={storedUser?.pk ?? ''} />
                    <div className="space-y-2 ">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                disabled={isPending}
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
                    </div>
                    <div className="space-y-2 ">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                disabled={isPending}
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
                    </div>
                    {state?.error && (
                        <div className="text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="text-sm text-green-600">
                            ¡Contraseña actualizada con éxito!
                        </div>
                    )}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
