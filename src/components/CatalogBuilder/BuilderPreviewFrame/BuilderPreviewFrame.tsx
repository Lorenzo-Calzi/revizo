import PublicCatalog from "@components/PublicCatalog/PublicCatalog";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import type { CatalogTheme } from "@/types/theme";
import styles from "./BuilderPreviewFrame.module.scss";

type ItemsByCategory = Record<string, BusinessItem[]>;

interface BuilderPreviewFrameProps {
    mode: "mobile" | "tablet" | "desktop";
    business: Business;
    preview: {
        categories: Array<{
            id: string;
            name: string;
            items: Array<{
                id: string;
                name: string;
                description?: string;
                price?: number;
                image?: string;
                visible?: boolean;
            }>;
        }>;
    } | null;
    theme: CatalogTheme;
}

export default function BuilderPreviewFrame({
    mode,
    business,
    preview,
    theme
}: BuilderPreviewFrameProps) {
    const width = mode === "mobile" ? 390 : mode === "tablet" ? 768 : 1280;

    if (!preview) {
        return <div className={styles.previewWrap}>Seleziona un menu</div>;
    }

    // ---------------------------------------------
    // CATEGORIES (preview → BusinessCategory[])
    // ---------------------------------------------
    const filteredCategories = preview.categories.filter(cat =>
        cat.items.some(item => item.visible !== false)
    );

    const categories: BusinessCategory[] = filteredCategories.map(cat => ({
        id: cat.id,
        business_id: business.id,
        name: cat.name,
        order_index: 0, // non disponibile nella preview → fallback
        visible: true,
        created_at: "preview" // deve essere string
    }));

    // ---------------------------------------------
    // ITEMS (preview → ItemsByCategory)
    // ---------------------------------------------
    const items: ItemsByCategory = {};

    preview.categories.forEach(cat => {
        const visibleItems = cat.items.filter(item => item.visible !== false);

        items[cat.id] = visibleItems.map(item => ({
            id: item.id,
            category_id: cat.id,
            name: item.name,
            description: item.description ?? "",
            price: item.price ?? null,
            allergens: [],
            duration: null,
            image: item.image ?? null,
            order_index: 0,
            visible: item.visible !== false,
            created_at: "preview"
        }));
    });

    // ---------------------------------------------
    // RENDER
    // ---------------------------------------------
    return (
        <div className={styles.previewWrap}>
            <div className={`${styles.preview} device-${mode}`} style={{ width }}>
                <PublicCatalog
                    business={business}
                    categories={categories}
                    items={items}
                    theme={theme}
                />
            </div>
        </div>
    );
}
