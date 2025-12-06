import { useCatalogTheme } from "@context/CatalogThemeContext/useCatalogTheme";
import CategoryPill from "./CategoryPill";
import { getPillColors } from "@/utils/pillColors";
import styles from "./PublicCatalog.module.scss";

import type { BusinessCategory } from "@/types/database";

type Props = {
    categories: BusinessCategory[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
};

export default function PublicCatalogNavbar({
    categories,
    activeCategory,
    onSelectCategory
}: Props) {
    const theme = useCatalogTheme();
    const pillColors = getPillColors(theme.categoryPillColor);

    return (
        <nav className={styles.navbar} style={{ backgroundColor: theme.headerBackground }}>
            <div className={styles.navbarInner}>
                {/* Categorie */}
                {categories.map(cat => (
                    <CategoryPill
                        key={cat.id}
                        label={cat.name}
                        isActive={activeCategory === cat.id}
                        colors={pillColors}
                        className={styles.navItem}
                        onClick={() => onSelectCategory(cat.id)}
                    />
                ))}
            </div>
        </nav>
    );
}
