import Text from "@/components/ui/Text/Text";
import type { BusinessItem } from "@/types/database";
import styles from "./CollectionEditor.module.scss";

interface CollectionItemsProps {
    items: BusinessItem[];
    categoryName?: string;
    availableItems: BusinessItem[];

    // PRIMA: onAddItem: () => void
    // ORA:
    onAddItem: (categoryId: string) => void;

    onRemoveItem: (id: string) => void;

    // NEW: passa anche l'id della categoria attiva
    activeCategoryId: string;
}

export default function CollectionItems({
    items,
    categoryName,
    availableItems,
    onAddItem,
    onRemoveItem,
    activeCategoryId
}: CollectionItemsProps) {
    return (
        <div>
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {categoryName && (
                    <Text as="h4" weight={600}>
                        Elementi in “{categoryName}”
                    </Text>
                )}

                {!!availableItems.length && (
                    <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => onAddItem(activeCategoryId)}
                    >
                        + Aggiungi
                    </button>
                )}
            </div>

            {/* EMPTY STATE */}
            {items.length === 0 ? (
                <div className={styles.emptyState}>
                    <Text as="p">Nessun elemento presente in questa categoria.</Text>
                </div>
            ) : (
                <div className={styles.itemsList}>
                    {items.map(item => (
                        <article key={item.id} className={styles.itemCard}>
                            <div className={styles.itemHeader}>
                                <Text as="h5" weight={600}>
                                    {item.name}
                                </Text>

                                <button
                                    type="button"
                                    className={styles.removeItemButton}
                                    aria-label={`Rimuovi ${item.name}`}
                                    onClick={() => onRemoveItem(item.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
