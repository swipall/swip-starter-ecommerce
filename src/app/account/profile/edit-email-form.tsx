'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { requestEmailUpdateAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditEmailFormProps {
    currentEmail: string;
}

export function EditEmailForm({ currentEmail }: EditEmailFormProps) {
    const [state, formAction, isPending] = useActionState(requestEmailUpdateAction, undefined);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-email-form') as HTMLFormElement;
            form?.reset();
            toast.success('Correo actualizado', { description: 'Se envió un correo de verificación a tu nueva dirección.' });
        }
        if (state?.error) {
            toast.error('Error', { description: state.error });
        }
    }, [state]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Correo electrónico</CardTitle>
                <CardDescription>
                    Actualiza tu dirección de correo electrónico. Deberás verificar la nueva dirección de correo electrónico.
                </CardDescription>
            </CardHeader>
            <form id="edit-email-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentEmail">Correo actual</Label>
                        <Input
                            id="currentEmail"
                            type="email"
                            value={currentEmail}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newEmailAddress">Ingresa el nuevo correo electrónico</Label>
                        <Input
                            id="newEmailAddress"
                            name="newEmailAddress"
                            type="email"
                            placeholder="new.email@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña actual</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-foreground">
                            Introduce tu contraseña para confirmar este cambio.
                        </p>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Sending...' : 'Actualizar correo electrónico'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
