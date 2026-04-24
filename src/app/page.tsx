import type {Metadata} from "next";
import { HomePageComponent } from "@/components/layout/home/home-page-component";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} - Distribuidores de Cosméticos Originales.`,
    },
    description:
        "Distribuidores de Cosméticos Originales. Las marcas más solicitadas, con novedades semanales y practicidad para tus pedidos.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} - Distribuidores de Cosméticos Originales.`,
        description:
            "Las marcas más solicitadas, con novedades semanales y practicidad para tus pedidos.",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    return (
        <HomePageComponent />
    );
}
