import { cacheLife } from 'next/cache';
import { getCatalogs } from '@/lib/swipall/cached';
import { getTaxonomies, TaxonomyInterface, type Collection } from '@/lib/swipall/rest-adapter';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from '@/components/ui/navigation-menu';
import { NavbarLink } from '@/components/layout/navbar/navbar-link';

export async function NavbarCollections() {
    "use cache";
    cacheLife('days');
    const params = {
        kind: 'family',
        is_visible_on_web: true,
    }
    const taxonomies = await getTaxonomies(params);
    
    return (
        <NavigationMenu>
            <NavigationMenuList>
                {taxonomies.results.map((collection: TaxonomyInterface) => (
                    <NavigationMenuItem key={collection.slug}>
                        <NavbarLink href={`/collection/${collection.slug}`}>
                            {collection.value}
                        </NavbarLink>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
