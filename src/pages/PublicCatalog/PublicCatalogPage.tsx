import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Text from "@components/ui/Text/Text";
import PublicCatalog from "@components/PublicCatalog/PublicCatalog";

import { getBusinessBySlug } from "@services/supabase/businesses";
import { getPublicCollection } from "@services/supabase/collections";

import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import { CatalogThemeProvider } from "@context/CatalogThemeContext/CatalogThemeProvider";
import { defaultTheme } from "@/constants/catalogTheme";

/** Gli item pubblici che arrivano da getPublicCollection */
type PublicItem = {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image?: string;
    category_id: string;
};

type PublicCollectionData = {
    categories: { id: string; name: string; order_index: number }[];
    items: Record<string, PublicItem[]>;
};

// Mappa category_id → lista di BusinessItem, come si aspetta PublicCatalog
type ItemsByCategory = Record<string, BusinessItem[]>;

export default function PublicCatalogPage() {
    const { slug } = useParams<{ slug: string }>();

    const [business, setBusiness] = useState<Business | null>(null);
    const [categories, setCategories] = useState<BusinessCategory[]>([]);
    const [items, setItems] = useState<ItemsByCategory>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!slug) return;

            setLoading(true);
            setError(null);

            try {
                // 1) Business
                const biz = await getBusinessBySlug(slug);

                if (!biz) {
                    setError("Business non trovato.");
                    setLoading(false);
                    return;
                }

                setBusiness(biz);

                const mainId = biz.active_collection_id;
                const specialId = biz.active_special_collection_id;

                // 2) Menu principale e speciale (solo se esplicitamente scelto)
                const [mainData, specialData] = await Promise.all([
                    mainId
                        ? getPublicCollection(mainId)
                        : Promise.resolve<PublicCollectionData | null>(null),
                    specialId && specialId !== mainId
                        ? getPublicCollection(specialId)
                        : Promise.resolve<PublicCollectionData | null>(null)
                ]);

                // 3) Costruiamo i dati per PublicCatalog
                const { categories: viewCategories, items: viewItems } = buildViewData(
                    biz.id,
                    mainData,
                    specialData
                );

                setCategories(viewCategories);
                setItems(viewItems);
            } catch (err) {
                console.error(err);
                setError("Impossibile caricare il menù.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [slug]);

    if (loading) {
        return <Text>Caricamento menù…</Text>;
    }

    if (error) {
        return <Text colorVariant="warning">{error}</Text>;
    }

    if (!business) {
        return <Text colorVariant="warning">Business non trovato.</Text>;
    }

    if (!categories.length) {
        return (
            <CatalogThemeProvider theme={business.theme ?? defaultTheme}>
                <Text>Nessun contenuto disponibile per questo menù.</Text>
            </CatalogThemeProvider>
        );
    }

    return (
        <CatalogThemeProvider theme={business.theme ?? defaultTheme}>
            <PublicCatalog
                business={business}
                categories={categories}
                items={items}
                theme={business.theme ?? defaultTheme}
            />
        </CatalogThemeProvider>
    );
}

/**
 * Combina i dati del menù principale e del menù speciale (se presente)
 * in un unico set di categorie + items per PublicCatalog.
 *
 * - Le categorie del menù speciale vengono prima.
 * - Mostriamo solo le categorie che hanno almeno un item.
 */
function buildViewData(
    businessId: string,
    main: PublicCollectionData | null,
    special: PublicCollectionData | null
): { categories: BusinessCategory[]; items: ItemsByCategory } {
    const categories: BusinessCategory[] = [];
    const items: ItemsByCategory = {};

    let orderCounter = 0;

    const pushCollection = (source: PublicCollectionData, prefix: "special" | "main") => {
        for (const cat of source.categories) {
            const rawItems = source.items[cat.id] ?? [];
            if (!rawItems.length) continue; // saltiamo le categorie vuote

            const newCatId = `${prefix}-${cat.id}`;

            categories.push({
                id: newCatId,
                business_id: businessId,
                name: cat.name,
                order_index: orderCounter++,
                visible: true,
                created_at: "" // non usato nel front public, ma richiesto dal tipo
            });

            items[newCatId] = rawItems.map((i, idx) => ({
                id: i.id,
                category_id: newCatId,
                name: i.name,
                description: i.description ?? null,
                price: i.price ?? null,
                duration: null,
                allergens: null,
                image: i.image ?? null,
                order_index: idx,
                visible: true,
                created_at: "" // idem, campo dummy
            }));
        }
    };

    // Prima il menù speciale (se attivo), poi il principale
    if (special) {
        pushCollection(special, "special");
    }

    if (main) {
        pushCollection(main, "main");
    }

    return { categories, items };
}
