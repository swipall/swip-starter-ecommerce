'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { AddressForm } from './address-form';
import { createAddress, updateAddress, deleteAddress } from './actions';
import { useRouter } from 'next/navigation';
import { AddressInterface } from '@/lib/swipall/users/user.types';
import { toast } from 'sonner';

interface AddressesClientProps {
    addresses: AddressInterface[];
}

export function AddressesClient({ addresses }: AddressesClientProps) {
    const router = useRouter();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<AddressInterface | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAddNew = () => {
        setEditingAddress(null);
        setDialogOpen(true);
    };

    const handleEdit = (address: AddressInterface) => {
        setEditingAddress(address);
        setDialogOpen(true);
    };

    const handleDelete = (addressId: string) => {
        setAddressToDelete(addressId);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;

        setIsDeleting(true);
        try {
            await deleteAddress(addressToDelete);
            router.refresh();
            setDeleteDialogOpen(false);
            setAddressToDelete(null);
            toast.success('Dirección eliminada');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Error al eliminar dirección', { description: error instanceof Error ? error.message : 'Error desconocido' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmit = async (data: Partial<AddressInterface>) => {
        setIsSubmitting(true);
        try {
            if (editingAddress) {
                await updateAddress(data as AddressInterface);
            } else {
                await createAddress(data as AddressInterface);
            }
            router.refresh();
            setDialogOpen(false);
            setEditingAddress(null);
            toast.success(editingAddress ? 'Dirección actualizada' : 'Dirección guardada');
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Error al guardar dirección', { description: error instanceof Error ? error.message : 'Error desconocido' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Mis Direcciones</h1>
                    <p className="text-foreground mt-2">
                        Administra tus direcciones de envío guardadas
                    </p>
                </div>
                <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar nueva dirección
                </Button>
            </div>

            {addresses.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-foreground mb-4">No tienes direcciones guardadas aún</p>
                        <Button onClick={handleAddNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar tu primera dirección
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <Card key={address.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <CardTitle className="text-lg">{address.receiver || 'Dirección'}</CardTitle>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label="Acciones de dirección"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(address)}>
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(address.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-foreground space-y-1">
                                    <div className='border border-muted p-2 rounded-lg'>
                                        <small className='font-bold text-muted-foreground'>Dirección</small>
                                        <p>{address.address}</p>
                                    </div>
                                    <div className='border border-muted p-2 rounded-lg'>
                                        <small className='font-bold text-muted-foreground'>Ciudad</small>
                                        <p>{address.city}, {address.state}, {address.country && <p>{address.country}.</p>}</p>
                                    </div>
                                    <div className='border border-muted p-2 rounded-lg'>
                                        <small className='font-bold text-muted-foreground'>Código Postal y colonia</small>
                                        <p>{address.postal_code}, {address.suburb}. </p>
                                    </div>
                                    <div className='border border-muted p-2 rounded-lg'>
                                        <small className='font-bold text-muted-foreground'>Teléfono</small>
                                        {address.mobile && <p className="font-medium text-foreground">{address.mobile}</p>}
                                    </div>
                                    <div className='border border-muted p-2 rounded-lg'>
                                        <small className='font-bold text-muted-foreground'>Referencias</small>
                                        {address.references && <p className="text-xs">{address.references}.</p>}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAddress ? 'Editar dirección' : 'Agregar nueva dirección'}</DialogTitle>
                        <DialogDescription>
                            {editingAddress
                                ? 'Actualiza los detalles de tu dirección'
                                : 'Completa el formulario para agregar una nueva dirección'}
                        </DialogDescription>
                    </DialogHeader>
                    <AddressForm
                        address={editingAddress || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setDialogOpen(false);
                            setEditingAddress(null);
                        }}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente esta dirección.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
