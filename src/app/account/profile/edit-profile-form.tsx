'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateCustomerAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditProfileFormProps {
    customer: {
        firstName?: string;
        lastName?: string;
    } | null;
}

export function EditProfileForm({ customer }: EditProfileFormProps) {
    const [state, formAction, isPending] = useActionState(updateCustomerAction, undefined);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-profile-form') as HTMLFormElement;
            form?.reset();
            toast.success('Perfil actualizado', { description: 'Tu información personal fue guardada.' });
        }
        if (state?.error) {
            toast.error('Error', { description: state.error });
        }
    }, [state]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Información personal</CardTitle>
                <CardDescription>
                    Actualiza los detalles de tu información.
                </CardDescription>
            </CardHeader>
            <form id="edit-profile-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Name</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            defaultValue={customer?.firstName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellidos</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            defaultValue={customer?.lastName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Updating...' : 'Actualizar perfil'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
