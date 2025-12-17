import { useCallback, useEffect, useState } from "react";
import Text from "@/components/ui/Text/Text";
import { Button } from "@/components/ui";
import CatalogManagerModal from "@/components/CatalogManagerModal/CatalogManagerModal";
import { listCollections, createCollection } from "@/services/supabase/collections";
import type { Collection } from "@/types/database";
import CollectionBuilderModal from "@/components/CollectionBuilderModal/CollectionBuilderModal";
import styles from "./Collections.module.scss";

export default function Collections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
    const [catalogOpen, setCatalogOpen] = useState(false);

    const loadCollections = useCallback(async () => {
        try {
            setLoading(true);
            const data = await listCollections();
            setCollections(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCollections();
    }, [loadCollections]);

    const handleCreateCollection = async () => {
        const name = window.prompt("Nome della collezione");
        if (!name?.trim()) return;

        const collection = await createCollection({ name });
        setCollections(prev => [...prev, collection]);
        setActiveCollectionId(collection.id);
    };

    return (
        <>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <Text as="h1" variant="title-lg" weight={600}>
                        Collezioni
                    </Text>

                    <Button onClick={handleCreateCollection} label="Crea collezione" />
                    <Button
                        label="Apri catalogo"
                        variant="secondary"
                        onClick={() => setCatalogOpen(true)}
                    />
                </header>

                {loading && <Text colorVariant="muted">Caricamento…</Text>}

                {!loading && collections.length === 0 && (
                    <Text colorVariant="muted">Nessuna collezione creata.</Text>
                )}

                <ul className={styles.list}>
                    {collections.map(col => (
                        <li
                            key={col.id}
                            className={styles.card}
                            onClick={() => setActiveCollectionId(col.id)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === "Enter" && setActiveCollectionId(col.id)}
                        >
                            <Text variant="title-sm" weight={500}>
                                {col.name}
                            </Text>

                            {col.description && (
                                <Text colorVariant="muted" variant="caption">
                                    {col.description}
                                </Text>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <CollectionBuilderModal
                isOpen={Boolean(activeCollectionId)}
                collectionId={activeCollectionId}
                onClose={() => setActiveCollectionId(null)}
            />

            <CatalogManagerModal isOpen={catalogOpen} onClose={() => setCatalogOpen(false)} />
        </>
    );
}
