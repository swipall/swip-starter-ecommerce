import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex flex-row-reverse md:flex-row items-center gap-8">
                        <Link href="/" className="text-xl font-bold">
                            <Image src="/hanny-pulido logo-black.svg" alt="Hanny Pulido Cosméticos" width={40} height={27} className="w-40 dark:hidden" />
                            <Image src="/hanny-pulido logo-white.svg" alt="Hanny Pulido Cosméticos" width={40} height={27} className="w-40 hidden dark:flex" />
                        </Link>
                        <div className="py-2 border-t flex md:hidden">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full pl-8 justify-end">
                        <div className="hidden lg:flex w-full">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>
                        <ThemeSwitcher />
                        <Suspense>
                            <NavbarCart />
                        </Suspense>
                        <NavbarUser />
                    </div>
                </div>
            </div>
            <div className="py-2 border-t hidden md:flex">
                <div className="container mx-auto">
                    <Suspense>
                        <NavbarCollections />
                    </Suspense>
                </div>
            </div>
            <div className="md:hidden container mx-auto border-t border-muted bg-background py-2">
                <div className="flex md:hidden ">
                    <Suspense fallback={<SearchInputSkeleton />}>
                        <SearchInput />
                    </Suspense>
                    <nav className="hidden md:flex items-center gap-6">
                        <Suspense>
                            <NavbarCollections />
                        </Suspense>
                    </nav>
                </div>
            </div>
        </header>
    );
}