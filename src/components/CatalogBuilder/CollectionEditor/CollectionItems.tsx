import Text from "@/components/ui/Text/Text";
import type { BusinessItem } from "@/types/database";
import styles from "./CollectionEditor.module.scss";
import { Eye, EyeOff } from "lucide-react";

interface UiCollectionItem {
    entryId: string;
    data: BusinessItem;
    visible: boolean;
}

interface CollectionItemsProps {
    items: UiCollectionItem[];
    categoryName?: string;
    availableItems: BusinessItem[];
    activeCategoryId: string;

    onAddItem: (categoryId: string) => void;
    onRemoveItem: (id: string) => void;
    onToggleVisibility: (entryId: string, visible: boolean) => void;
}

export default function CollectionItems({
    items,
    categoryName,
    availableItems,
    activeCategoryId,
    onAddItem,
    onRemoveItem,
    onToggleVisibility
}: CollectionItemsProps) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <Text as="h4" weight={600}>
                    Elementi in “{categoryName}”
                </Text>

                {!!availableItems.length && (
                    <button
                        className={styles.sectionAddBtn}
                        onClick={() => onAddItem(activeCategoryId)}
                    >
                        +
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className={styles.emptyBox}>
                    <Text as="span" weight={500}>
                        Nessun elemento associato.
                    </Text>
                </div>
            ) : (
                <div className={styles.itemsList}>
                    {items.map(item => (
                        <div key={item.entryId} className={styles.itemCard}>
                            <div className={styles.itemMain}>
                                <Text as="span" weight={500}>
                                    {item.data.name}
                                </Text>

                                {/* SWITCH */}
                                <label className={styles.switchLabel}>
                                    <input
                                        type="checkbox"
                                        checked={item.visible}
                                        onChange={e =>
                                            onToggleVisibility(item.entryId, e.target.checked)
                                        }
                                    />

                                    <span className={styles.switchTrack}>
                                        <span className={styles.switchThumb} />
                                    </span>

                                    {item.visible ? <Eye size={17} /> : <EyeOff size={17} />}
                                </label>
                            </div>

                            <button
                                type="button"
                                className={styles.cardRemove}
                                aria-label={`Rimuovi ${item.data.name}`}
                                onClick={() => onRemoveItem(item.data.id)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
