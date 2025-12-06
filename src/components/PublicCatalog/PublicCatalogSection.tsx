// import Text from "@components/ui/Text/Text";
import PublicProductCard from "./PublicProductCard";
import styles from "./PublicCatalog.module.scss";

import type { BusinessCategory, BusinessItem } from "@/types/database";

type Props = {
    category: BusinessCategory;
    items: BusinessItem[];
    businessType: string;
    onSelectItem: (item: BusinessItem) => void;
};

export default function PublicCatalogSection({
    category,
    items,
    businessType,
    onSelectItem
}: Props) {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{category.name}</h2>

            <div className={styles.sectionItems}>
                {items.map(item => (
                    <PublicProductCard
                        key={item.id}
                        item={item}
                        businessType={businessType}
                        onSelect={onSelectItem}
                    />
                ))}
            </div>
        </section>
    );
}
