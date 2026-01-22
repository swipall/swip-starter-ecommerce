'use client';

import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from "next/link";
import { LoginButton } from "@/components/layout/navbar/login-button";
import { useAuthUser } from '@/hooks/use-auth-user';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';


export function NavbarUser() {
    const { user, isLoading } = useAuthUser();

    if (isLoading) {
        return <NavbarUserSkeleton />;
    }

    if (!user) {
        return (
            <Button variant="ghost" asChild>
                <LoginButton isLoggedIn={false} />
            </Button>
        );
    }

    const firstName = user.first_name || user.firstName || 'Usuario';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                    <User className="h-5 w-5" />
                    Hola, {firstName}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem asChild>
                    <Link href="/account/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/orders">Pedidos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <LoginButton isLoggedIn={true} />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
