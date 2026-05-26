'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updatePasswordAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthUser } from '@/lib/auth-client';
import { CurrentUser } from '@/lib/swipall/types/types';
import { Eye, EyeOff, User, Mail, Phone } from 'lucide-react';

export function ChangePasswordForm() {
    const storedUser: CurrentUser | null = getAuthUser();
    const [state, formAction, isPending] = useActionState(updatePasswordAction, undefined);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('change-password-form') as HTMLFormElement;
            form?.reset();
            toast.success('Contraseña actualizada', { description: '¡Tu contraseña fue actualizada con éxito!' });
        }
        if (state?.error) {
            toast.error('Error', { description: state.error });
        }
    }, [state]);

    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Información de la cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>{storedUser?.first_name ?? ''} {storedUser?.last_name ?? ''}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground  shrink-0" />
                    <span>{storedUser?.email ?? '—'}</span>
                </div>
                {storedUser?.mobile && (
                    <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{storedUser.mobile}</span>
                    </div>
                )}
            </CardContent>
        </Card>

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
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-foreground hover:text-foreground"
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
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-foreground hover:text-foreground"
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
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </Button>
                </CardContent>
            </form>
        </Card>
        </>
    );
}
