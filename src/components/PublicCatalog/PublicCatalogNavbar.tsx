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
    return (
        <nav className={styles.navbar}>
            <div className={styles.navbarInner}>
                {/* Categorie */}
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.navItem} ${
                            activeCategory === cat.id ? styles.navItemActive : ""
                        }`}
                        onClick={() => onSelectCategory(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </nav>
    );
}
