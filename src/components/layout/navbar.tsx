import Image from "next/image";
import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCollectionsMobile } from '@/components/layout/navbar/navbar-collections-mobile';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { MobileMenu } from '@/components/layout/navbar/mobile-menu';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-nav-background  border-b border-border/40">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-2">
                    {/* Left: hamburger (mobile) + logo + desktop nav */}
                    <div className="flex items-center gap-3">
                        <Suspense>
                            <MobileMenu>
                                <NavbarCollectionsMobile />
                            </MobileMenu>
                        </Suspense>

                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src="https://mmcb.b-cdn.net/media/attachments/0/c/4/0/60593b52331c1146353026da4cbc9ffbfd78b635db83fca47b25690df620/logo.jpg"
                                alt="Swipall"
                                width={40}
                                height={27}
                                className="h-14 w-auto"
                            />
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </nav>
                    </div>

                    {/* Right: search (desktop) + cart + user */}
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:flex">
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

                {/* Mobile: buscador debajo de la barra principal */}
                <div className="lg:hidden pb-2">
                    <Suspense fallback={<SearchInputSkeleton />}>
                        <SearchInput />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
