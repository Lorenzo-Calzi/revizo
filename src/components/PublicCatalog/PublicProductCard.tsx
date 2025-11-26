import React from "react";
import styles from "./PublicCatalog.module.scss";

import type { BusinessItem } from "@/types/database";

type Props = {
    item: BusinessItem;
    businessType: string;
    onSelect: (item: BusinessItem) => void;
};

export default function PublicProductCard({ item, businessType, onSelect }: Props) {
    return (
        <div
            className={styles.card}
            role="button"
            tabIndex={0}
            aria-label={`Apri dettagli: ${item.name}`}
            onClick={() => onSelect(item)}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(item);
                }
            }}
        >
            {/* FOTO */}
            {item.image ? (
                <img src={item.image} alt={item.name} className={styles.cardImage} />
            ) : (
                <div className={styles.cardImagePlaceholder}>
                    <span>No foto</span>
                </div>
            )}

            {/* TESTO */}
            <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{item.name}</h3>

                    {item.price != null && (
                        <div className={styles.cardPrice}>€ {item.price.toFixed(2)}</div>
                    )}
                </div>

                {item.description && <p className={styles.cardDescription}>{item.description}</p>}

                {/* Extra in base al tipo di business */}
                {businessType === "restaurant" && item.allergens && (
                    <div className={styles.cardExtraRow}>
                        {item.allergens.map(a => (
                            <span key={a} className={styles.cardTag}>
                                {a}
                            </span>
                        ))}
                    </div>
                )}

                {businessType === "bar" && item.description && (
                    <p className={styles.cardExtra}>Ingredienti: {item.description}</p>
                )}

                {businessType === "hairdresser" && item.duration && (
                    <p className={styles.cardExtra}>Durata: {item.duration} min</p>
                )}
            </div>
        </div>
    );
}
