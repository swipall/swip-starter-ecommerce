'use client'

import { ComponentProps, useTransition } from "react";
import { logoutAction } from "@/app/sign-in/actions";
import { useRouter } from "next/navigation";
import { removeAuthUser } from "@/lib/auth-client";
import { Menu, User } from "lucide-react";

interface LoginButtonProps extends ComponentProps<'button'> {
    isLoggedIn: boolean;
}

export function LoginButton({ isLoggedIn, ...props }: LoginButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <div>
            <div className="hidden md:block">
                <button className="bg-pink-400 hover:bg-pink-600 dark:bg-pink-900 dark:text-white  hover:bg-pink-600 font-bold" {...props} aria-disabled={isPending}
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
            </div>

            <div className="flex md:hidden">
                <button  {...props} aria-disabled={isPending}
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
                    {isLoggedIn ? 'Cerrar sesión' : <User />}
                </button>
            </div>
        </div>

    )
}