// Tu archivo original (NavbarCollections)
import { NavbarLink } from '@/components/layout/navbar/navbar-link';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { getPosts } from '@/lib/swipall/rest-adapter';
import { CmsPost } from '@/lib/swipall/types/types';
import { cacheLife } from 'next/cache';
import { NavbarMobileWrapper } from './navbar-mobile-wrapper';

export async function NavbarCollections() {
    "use cache";
    cacheLife('days');

    const params = { parent__slug: 'menu-principal', ordering: 'ordering'};
    const taxonomies = await getPosts(params);

    const redirectUrl = (collection: CmsPost) => {
        return collection.link ? collection.link : `/collection/${collection.slug}`;
    };

    const links = taxonomies.results.map((collection: CmsPost) => (
        <NavigationMenuItem key={collection.slug}>
            <NavbarLink href={redirectUrl(collection)}>
                {collection.title}
            </NavbarLink>
        </NavigationMenuItem>
    ));

    return (
        <NavigationMenu>
            {/* Escritorio: Siempre visible */}
            <NavigationMenuList className="hidden md:flex">
                {links}
            </NavigationMenuList>

            {/* Móvil: Controlado por el componente de cliente */}
            <NavbarMobileWrapper>
                <div className='absolute md:hidden left-[-16px] top-0 z-10 left-0 w-screen bg-card pb-10 left-0 right-0 flex-col flex'>

                    <NavigationMenuList className='flex-col flex' >
                        {links}
                    </NavigationMenuList>
                </div>
            </NavbarMobileWrapper>
        </NavigationMenu>
    );
}