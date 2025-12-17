import { useMemo } from "react";
import Text from "@/components/ui/Text/Text";
import type { CollectionSection, CollectionItemWithItem } from "@/types/database";
import type { CollectionStyle } from "@/types/collectionStyle";
import styles from "./CollectionPreview.module.scss";

type Props = {
    title: string;
    sections: CollectionSection[];
    items: CollectionItemWithItem[];
    style: Required<CollectionStyle>;
};

export default function CollectionPreview({ title, sections, items, style }: Props) {
    const itemsBySection = useMemo(() => {
        const map = new Map<string, CollectionItemWithItem[]>();
        for (const it of items) {
            if (!it.visible) continue;
            if (!it.section_id) continue;
            const arr = map.get(it.section_id) ?? [];
            arr.push(it);
            map.set(it.section_id, arr);
        }

        return map;
    }, [items]);

    return (
        <div className={styles.preview} style={{ background: style.backgroundColor }}>
            <div className={styles.inner}>
                <Text as="h3" variant="title-lg" weight={700}>
                    {title}
                </Text>

                {sections.map(sec => {
                    const secItems = itemsBySection.get(sec.id) ?? [];
                    if (secItems.length === 0) return null;

                    return (
                        <div key={sec.id} className={styles.section}>
                            <Text variant="title-sm" weight={700}>
                                {sec.name}
                            </Text>

                            <div className={styles.cards}>
                                {secItems.map(ci => (
                                    <div
                                        key={ci.id}
                                        className={styles.card}
                                        style={{
                                            borderRadius: style.cardRadius,
                                            flexDirection:
                                                style.cardTemplate === "right"
                                                    ? "row-reverse"
                                                    : "row"
                                        }}
                                    >
                                        {style.cardTemplate !== "no-image" && (
                                            <div className={styles.imagePlaceholder}>
                                                <Text variant="caption" colorVariant="muted">
                                                    Img
                                                </Text>
                                            </div>
                                        )}

                                        <div className={styles.cardBody}>
                                            <div className={styles.cardTop}>
                                                <Text variant="body" weight={700}>
                                                    {ci.item.name}
                                                </Text>

                                                {ci.item.base_price != null && (
                                                    <Text variant="body" weight={700}>
                                                        € {Number(ci.item.base_price).toFixed(2)}
                                                    </Text>
                                                )}
                                            </div>

                                            {ci.item.description && (
                                                <Text variant="caption" colorVariant="muted">
                                                    {ci.item.description}
                                                </Text>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
