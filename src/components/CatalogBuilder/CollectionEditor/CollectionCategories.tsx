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
        <div>
            {/* Header */}
            <div className={styles.header}>
                <Text as="h4" weight={600}>
                    Categorie
                </Text>

                {!!availableCategories.length && onAddCategory && (
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => onAddCategory()}
                    >
                        + Aggiungi
                    </button>
                )}
            </div>

            {/* Stato vuoto */}
            {categories.length === 0 ? (
                <div className={styles.emptyState}>
                    <Text as="p">Nessuna categoria ancora associata a questo gruppo.</Text>
                </div>
            ) : (
                <div className={styles.categoryList} role="list">
                    {categories.map(category => (
                        <div key={category.id} className={styles.categoryRow}>
                            <button
                                type="button"
                                className={`${styles.categoryButton} ${
                                    activeCategoryId === category.id
                                        ? styles.categoryButtonActive
                                        : ""
                                }`}
                                onClick={() => onSelectCategory(category.id)}
                                aria-pressed={activeCategoryId === category.id}
                                role="listitem"
                            >
                                <Text as="span">{category.name}</Text>
                            </button>

                            {onRemoveCategory && (
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    aria-label={`Rimuovi categoria ${category.name}`}
                                    onClick={() => onRemoveCategory(category.id)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
