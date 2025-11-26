import React, { useEffect, useState } from "react";
import styles from "./PublicCatalog.module.scss";

import type { BusinessItem } from "@/types/database";

type Props = {
    item: BusinessItem | null;
    businessType: string;
    onClose: () => void;
};

export default function PublicItemModal({ item, businessType, onClose }: Props) {
    const [isVisible, setIsVisible] = useState(false); // controlla ingresso/uscita
    const [isClosing, setIsClosing] = useState(false); // controlla animazione uscita

    // Se item arriva → apri la modale
    useEffect(() => {
        if (item) {
            setIsVisible(true);
            setIsClosing(false);
        }
    }, [item]);

    // ESC → chiudi
    useEffect(() => {
        if (!item) return;

        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") startClose();
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [item]);

    if (!item) return null;

    const allergens = Array.isArray(item.allergens) ? item.allergens : [];

    // Funzione per chiusura animata
    const startClose = () => {
        if (isClosing) return; // evita doppie chiusure
        setIsClosing(true);

        // aspetta la durata dell’animazione e poi chiudi
        setTimeout(() => {
            onClose();
            setIsVisible(false);
        }, 260); // durata animazione CSS
    };

    return (
        <div
            className={`${styles.modalOverlay} ${
                isVisible && !isClosing ? styles.open : styles.close
            }`}
            onClick={startClose}
        >
            <div
                className={`
                    ${styles.modal}
                    ${isVisible && !isClosing ? styles.modalOpen : styles.modalClosing}
                `}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={`Dettaglio ${item.name}`}
            >
                {/* IMMAGINE */}
                {item.image ? (
                    <img src={item.image} className={styles.modalImage} alt={item.name} />
                ) : (
                    <div className={styles.modalImagePlaceholder}>Nessuna immagine</div>
                )}

                {/* CORPO */}
                <div className={styles.modalBody}>
                    <div className={styles.modalHeader}>
                        <h2 className={styles.modalTitle}>{item.name}</h2>

                        {item.price != null && (
                            <div className={styles.modalPrice}>€ {item.price.toFixed(2)}</div>
                        )}
                    </div>

                    {item.description && (
                        <p className={styles.modalDescription}>{item.description}</p>
                    )}

                    {/* Extra variabili per tipo */}
                    {businessType === "hairdresser" && item.duration && (
                        <p className={styles.modalExtra}>Durata: {item.duration} min</p>
                    )}

                    {businessType === "bar" && item.description && (
                        <p className={styles.modalExtra}>Ingredienti: {item.description}</p>
                    )}

                    {businessType === "restaurant" && allergens.length > 0 && (
                        <div className={styles.modalAllergens}>
                            {allergens.map(a => (
                                <span key={a} className={styles.modalTag}>
                                    {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* CLOSE BUTTON */}
                <button className={styles.modalClose} onClick={startClose} aria-label="Chiudi">
                    ✕
                </button>
            </div>
        </div>
    );
}
