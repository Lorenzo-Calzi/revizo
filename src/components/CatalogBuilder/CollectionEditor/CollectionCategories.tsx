import Text from "@/components/ui/Text/Text";
import type { BusinessCategory } from "@/types/database";
import styles from "./CollectionEditor.module.scss";

interface CollectionCategoriesProps {
    categories: BusinessCategory[];
    availableCategories?: BusinessCategory[];
    activeCategoryId: string | null;
    onSelectCategory: (id: string) => void;

    // 👇 ORA non accetta più un ID, ma un semplice trigger
    onAddCategory?: () => void;

    onRemoveCategory?: (id: string) => void;
}

export default function CollectionCategories({
    categories,
    availableCategories = [],
    activeCategoryId,
    onSelectCategory,
    onAddCategory,
    onRemoveCategory
}: CollectionCategoriesProps) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <Text as="h4" weight={600}>
                    Categorie
                </Text>

                {!!availableCategories.length && onAddCategory && (
                    <button className={styles.sectionAddBtn} onClick={onAddCategory}>
                        +
                    </button>
                )}
            </div>

            {categories.length === 0 ? (
                <div className={styles.emptyBox}>
                    <Text weight={500}>Nessuna categoria associata.</Text>
                </div>
            ) : (
                <div className={styles.categoryList}>
                    {categories.map(category => {
                        const isActive = activeCategoryId === category.id;

                        return (
                            <div
                                key={category.id}
                                className={`${styles.categoryCard} ${
                                    isActive ? styles.categoryCardActive : ""
                                }`}
                                onClick={() => onSelectCategory(category.id)}
                            >
                                <Text weight={500}>{category.name}</Text>

                                {onRemoveCategory && (
                                    <button
                                        className={styles.cardRemove}
                                        onClick={e => {
                                            e.stopPropagation();
                                            onRemoveCategory(category.id);
                                        }}
                                        aria-label={`Rimuovi categoria ${category.name}`}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
