'use client'

import {ComponentProps, useTransition} from "react";
import {logoutAction} from "@/app/sign-in/actions";
import {useRouter} from "next/navigation";
import {removeAuthUser} from "@/lib/auth-client";

interface LoginButtonProps extends ComponentProps<'button'> {
    isLoggedIn: boolean;
}

export function LoginButton({isLoggedIn, ...props}: LoginButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <button {...props} aria-disabled={isPending}
                onClick={() => {
                    if (isLoggedIn) {
                        startTransition(async () => {
                            // Clear user from localStorage
                            removeAuthUser();
                            // Call logout action
                            await logoutAction();
                        })
                    } else {
                        router.push('/sign-in')
                    }
                }}>
            {isLoggedIn ? 'Cerrar sesión' : 'Iniciar sesión'}
        </button>
    )
}