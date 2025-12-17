import { memo } from "react";
import Text from "@/components/ui/Text/Text";
import { Input } from "@/components/ui";
import type { CollectionStyle } from "@/types/collectionStyle";
import type { CardTemplate } from "@/types/collectionStyle";
import styles from "./CollectionStylePanel.module.scss";

type Props = {
    styleDraft: CollectionStyle;
    resolvedStyle: Required<CollectionStyle>;
    onChange: (next: Partial<CollectionStyle>) => void;
};

function CollectionStylePanel({ styleDraft, resolvedStyle, onChange }: Props) {
    return (
        <>
            <Text variant="title-sm" weight={600}>
                Grafica e stile
            </Text>

            {/* Background */}
            <div className={styles.styleGroup}>
                <Text variant="body" weight={600}>
                    Colore di sfondo
                </Text>

                <div className={styles.colorRow}>
                    <input
                        type="color"
                        value={styleDraft.backgroundColor ?? resolvedStyle.backgroundColor}
                        onChange={e => onChange({ backgroundColor: e.target.value })}
                        aria-label="Seleziona colore di sfondo"
                        className={styles.colorInput}
                    />

                    <Input
                        value={styleDraft.backgroundColor ?? ""}
                        onChange={e => onChange({ backgroundColor: e.target.value })}
                        label=""
                        placeholder="#ffffff"
                    />
                </div>
            </div>

            {/* Card radius */}
            <div className={styles.styleGroup}>
                <Text variant="body" weight={600}>
                    Arrotondamento card
                </Text>

                <Input
                    value={styleDraft.cardRadius?.toString() ?? ""}
                    onChange={e => {
                        const n = Number(e.target.value);
                        onChange({
                            cardRadius: Number.isFinite(n) ? n : undefined
                        });
                    }}
                    label=""
                    placeholder="12"
                />
            </div>

            {/* Card template */}
            <div className={styles.styleGroup}>
                <Text variant="body" weight={600}>
                    Template card
                </Text>

                <div role="radiogroup" className={styles.templateRow}>
                    {(["left", "right", "no-image"] as CardTemplate[]).map(tpl => (
                        <button
                            key={tpl}
                            type="button"
                            role="radio"
                            aria-checked={
                                (styleDraft.cardTemplate ?? resolvedStyle.cardTemplate) === tpl
                            }
                            className={styles.templateBtn}
                            onClick={() => onChange({ cardTemplate: tpl })}
                        >
                            <Text variant="body" weight={600}>
                                {tpl}
                            </Text>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

CollectionStylePanel.displayName = "CollectionStylePanel";

export default memo(CollectionStylePanel);
