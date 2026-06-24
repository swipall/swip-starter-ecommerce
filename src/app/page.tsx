import type {Metadata} from "next";
import { HomePageComponent } from "@/components/layout/home/home-page-component";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} - Venta de ropa a mayoreo`,
    },
    description:
        "En Mérida Mayoreo impulsamos a mujeres emprendedoras con ropa premium y básica al mayoreo.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} Mérida Mayoreo - Coleccionables Pokémon,¡Haz que tu deck evolucione con KOI!`,
        description:
            "En Mérida Mayoreo impulsamos a mujeres emprendedoras con ropa premium y básica al mayoreo.",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    return (
        <HomePageComponent />
    );
}
