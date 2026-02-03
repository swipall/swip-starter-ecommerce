'use client';

import { useActionState, useEffect } from 'react';
import { updatePasswordAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthUser } from '@/lib/auth-client';
import { CurrentUser } from '@/lib/swipall/types/types';

export function ChangePasswordForm() {
    const storedUser: CurrentUser | null = getAuthUser();
    const [state, formAction, isPending] = useActionState(updatePasswordAction, undefined);

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
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva Contraseña</Label>
                        <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
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
