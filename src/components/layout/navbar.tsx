import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { NavbarMobileHeader } from '@/components/layout/navbar/navbar-mobile-header';
import { PromoBar } from '@/components/layout/navbar/promo-bar';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';

const LOGO_URL =
    "https://mmcb.b-cdn.net/media/attachments/f/f/e/6/c77a2aed2634f9a90555c2db1507cad8ea06a1c4bf34c2e46ac3aeab0f61/logo-merida.png";

export function Navbar() {
    const cartSlot = (
        <Suspense fallback={<div className="w-8 h-8" />}>
            <NavbarCart />
        </Suspense>
    );

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            {/* Promo bar — contenido dinámico desde slug: barra-de-anuncio */}
            <Suspense>
                <PromoBar/>
            </Suspense>

            {/* Mobile header (< md) */}
            <NavbarMobileHeader logoUrl={LOGO_URL} cart={cartSlot} />

            {/* Desktop header (≥ md) */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 lg:px-8">
                <div className="flex items-center gap-4 h-16">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src={LOGO_URL}
                            alt="Mérida Mayoreo"
                            width={120}
                            height={32}
                            className="h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Nav con dropdowns — lg+ */}
                    <nav className="hidden lg:flex items-center flex-1 justify-center">
                        <Suspense>
                            <NavbarCollections />
                        </Suspense>
                    </nav>

                    {/* Search pill */}
                    <div className="flex flex-1 lg:flex-none lg:w-64">
                        <Suspense fallback={<SearchInputSkeleton />}>
                            <SearchInput />
                        </Suspense>
                    </div>

                    {/* User + Cart */}
                    <div className="flex items-center gap-1 shrink-0">
                        <NavbarUser />
                        {cartSlot}
                    </div>
                </div>
            </div>
        </header>
    );
}
