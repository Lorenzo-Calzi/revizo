import { useEffect, useMemo, useState } from "react";
import Text from "@/components/ui/Text/Text";
import { Button } from "@/components/ui/Button/Button";
import { listCollections } from "@/services/supabase/collections";
import { updateBusiness } from "@/services/supabase/businesses";
import type { Collection } from "@/types/database";
import styles from "./SelectCollectionModal.module.scss";

type Props = {
    isOpen: boolean;
    businessId: string;
    activeCollectionId: string | null;
    onClose: () => void;
    onUpdated?: (newActiveCollectionId: string | null) => void;
};

export default function SelectCollectionModal({
    isOpen,
    businessId,
    activeCollectionId,
    onClose,
    onUpdated
}: Props) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    /* ============================
       LOAD COLLECTIONS
    ============================ */
    useEffect(() => {
        if (!isOpen) return;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await listCollections();
                setCollections(data);
            } catch (e: unknown) {
                const message =
                    e instanceof Error ? e.message : "Errore nel caricamento delle collezioni";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isOpen]);

    /* ============================
       SORT: ACTIVE FIRST
    ============================ */
    const sortedCollections = useMemo(() => {
        const copy = [...collections];
        copy.sort((a, b) => {
            if (a.id === activeCollectionId) return -1;
            if (b.id === activeCollectionId) return 1;
            return 0;
        });
        return copy;
    }, [collections, activeCollectionId]);

    /* ============================
       ESC TO CLOSE
    ============================ */
    useEffect(() => {
        if (!isOpen) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="select-collection-title"
        >
            <div className={styles.modal}>
                <header className={styles.header}>
                    <Text as="h2" variant="title-md" weight={600}>
                        Seleziona collezione
                    </Text>

                    <Button label="Chiudi" variant="ghost" onClick={onClose} />
                </header>

                <div className={styles.content}>
                    <Text variant="caption" colorVariant="muted">
                        Associa una collezione a questa attività.
                    </Text>

                    {error && (
                        <div className={styles.errorBox} role="alert">
                            <Text>{error}</Text>
                        </div>
                    )}

                    {loading && <Text colorVariant="muted">Caricamento…</Text>}

                    {!loading && sortedCollections.length === 0 && (
                        <Text colorVariant="muted">Nessuna collezione trovata.</Text>
                    )}

                    <ul className={styles.list}>
                        {sortedCollections.map(col => {
                            const isActive = col.id === activeCollectionId;
                            const isSaving = savingId === col.id;

                            return (
                                <li key={col.id} className={styles.row}>
                                    <div className={styles.rowLeft}>
                                        <Text weight={600}>{col.name}</Text>
                                        {col.description && (
                                            <Text variant="caption" colorVariant="muted">
                                                {col.description}
                                            </Text>
                                        )}
                                    </div>

                                    <div className={styles.rowRight}>
                                        {isActive ? (
                                            <span className={styles.badge}>
                                                <Text variant="caption">Attiva</Text>
                                            </span>
                                        ) : (
                                            <Button
                                                label="Imposta"
                                                loading={isSaving}
                                                onClick={async () => {
                                                    setSavingId(col.id);
                                                    setError(null);

                                                    try {
                                                        await updateBusiness(businessId, {
                                                            active_collection_id: col.id
                                                        });

                                                        onUpdated?.(col.id);
                                                        onClose();
                                                    } catch (e: unknown) {
                                                        const message =
                                                            e instanceof Error
                                                                ? e.message
                                                                : "Errore nel salvataggio";
                                                        setError(message);
                                                    } finally {
                                                        setSavingId(null);
                                                    }
                                                }}
                                            />
                                        )}

                                        {isActive && (
                                            <Button
                                                label="Rimuovi"
                                                variant="secondary"
                                                loading={isSaving}
                                                onClick={async () => {
                                                    setSavingId(col.id);
                                                    setError(null);

                                                    try {
                                                        await updateBusiness(businessId, {
                                                            active_collection_id: null
                                                        });

                                                        onUpdated?.(null);
                                                        onClose();
                                                    } catch (e: unknown) {
                                                        const message =
                                                            e instanceof Error
                                                                ? e.message
                                                                : "Errore nella rimozione";
                                                        setError(message);
                                                    } finally {
                                                        setSavingId(null);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
