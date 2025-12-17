import { useEffect, useMemo, useState } from "react";
import Text from "@/components/ui/Text/Text";
import { Button } from "@/components/ui/Button/Button";
import { getPreviewCollectionItemsWithOverrides } from "@/services/supabase/collections";
import type { CollectionItemWithItem } from "@/types/database";
import styles from "./BusinessPreviewModal.module.scss";

type BusinessForPreview = {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
    active_collection_id?: string | null;
    activeCollectionId?: string | null;
};

type Props = {
    isOpen: boolean;
    business: BusinessForPreview;
    onClose: () => void;
};

function getActiveCollectionId(business: BusinessForPreview): string | null {
    return business.active_collection_id ?? business.activeCollectionId ?? null;
}

export default function BusinessPreviewModal({ isOpen, business, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<CollectionItemWithItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const activeCollectionId = getActiveCollectionId(business);

    useEffect(() => {
        if (!isOpen) return;

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!activeCollectionId) {
                    setItems([]);
                    return;
                }

                const data = await getPreviewCollectionItemsWithOverrides(
                    activeCollectionId,
                    business.id
                );
                setItems(data);
            } catch (e: unknown) {
                const message =
                    e instanceof Error ? e.message : "Errore nel caricamento dell’anteprima";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [isOpen, activeCollectionId]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const visibleItems = useMemo(() => items.filter(i => i.visible), [items]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="biz-preview-title"
        >
            <div className={styles.modal}>
                <header className={styles.header}>
                    <Text as="h2" variant="title-md" weight={600}>
                        Anteprima sito
                    </Text>
                    <Button label="Chiudi" variant="ghost" onClick={onClose} />
                </header>

                <div className={styles.content}>
                    <div>
                        <Text variant="title-sm" weight={700}>
                            {business.name}
                        </Text>
                        <Text variant="caption" colorVariant="muted">
                            {business.city ?? ""}
                            {business.address ? ` • ${business.address}` : ""}
                        </Text>
                    </div>

                    {!activeCollectionId && (
                        <Text colorVariant="muted">
                            Nessuna collezione attiva associata a questa attività.
                        </Text>
                    )}

                    {loading && <Text colorVariant="muted">Caricamento…</Text>}

                    {error && (
                        <div className={styles.errorBox} role="alert">
                            <Text>{error}</Text>
                        </div>
                    )}

                    {!loading && activeCollectionId && visibleItems.length === 0 && (
                        <Text colorVariant="muted">
                            Nessun contenuto visibile nella collezione.
                        </Text>
                    )}

                    {!loading && visibleItems.length > 0 && (
                        <ul className={styles.items}>
                            {visibleItems.map(row => (
                                <li key={row.id} className={styles.item}>
                                    <div>
                                        <Text weight={600}>{row.item.name}</Text>
                                        {row.item.description && (
                                            <Text variant="caption" colorVariant="muted">
                                                {row.item.description}
                                            </Text>
                                        )}
                                    </div>

                                    {typeof row.item.base_price === "number" && (
                                        <Text weight={600}>€ {row.item.base_price.toFixed(2)}</Text>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
