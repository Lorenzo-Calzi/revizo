import PublicCatalog from "@components/PublicCatalog/PublicCatalog";
import type { Business, BusinessCategory, BusinessItem } from "@/types/database";
import type { CatalogTheme } from "@/types/theme";
import styles from "./BuilderPreviewFrame.module.scss";

type ItemsByCategory = Record<string, BusinessItem[]>;

interface BuilderPreviewFrameProps {
    mode: "mobile" | "tablet" | "desktop";
    business: Business;
    categories: BusinessCategory[];
    items: ItemsByCategory;
    theme: CatalogTheme;
}

export default function BuilderPreviewFrame({
    mode,
    business,
    categories,
    items,
    theme
}: BuilderPreviewFrameProps) {
    const width = mode === "mobile" ? 390 : mode === "tablet" ? 768 : 1280;

    const deviceClass =
        mode === "mobile"
            ? "device-mobile"
            : mode === "tablet"
            ? "device-tablet"
            : "device-desktop";

    return (
        <div className={styles.previewWrap}>
            <div className={`${styles.preview} ${deviceClass}`} style={{ width }}>
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
