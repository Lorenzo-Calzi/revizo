import { useEffect, useState, useCallback } from "react";
import Text from "@/components/ui/Text/Text";
import {
    getCollections,
    createCollection,
    getFullCollection
} from "@/services/supabase/collections";
import type { Collection, FullCollection } from "@/types/database";
import styles from "./EditorCollectionsPanel.module.scss";

interface EditorCollectionsPanelProps {
    businessId: string;
    onSelectCollection: (data: FullCollection) => void;
    activeCollectionId: string | null;
    setActiveCollectionId: (id: string) => void;
}

export default function EditorCollectionsPanel({
    businessId,
    onSelectCollection,
    activeCollectionId,
    setActiveCollectionId
}: EditorCollectionsPanelProps) {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);

    /* =============================
       LOAD COLLECTIONS
    ==============================*/
    const loadCollections = useCallback(async () => {
        setLoading(true);
        const data = await getCollections(businessId);
        setCollections(data);

        // seleziona automaticamente la prima collection disponibile
        if (data.length > 0) {
            handleSelect(data[0].id, false);
        }

        setLoading(false);
    }, [businessId]);

    useEffect(() => {
        void loadCollections();
    }, [loadCollections]);

    /* =============================
       CREATE NEW COLLECTION
    ==============================*/
    async function handleCreateCollection() {
        const name = window.prompt("Nome del gruppo di contenuti:");

        if (!name || !name.trim()) return;

        setCreating(true);

        const newCollection = await createCollection(businessId, { name });

        setCollections(prev => [...prev, newCollection]);
        await handleSelect(newCollection.id);

        setCreating(false);
    }

    /* =============================
       SELECT COLLECTION
    ==============================*/
    async function handleSelect(id: string, fetchData = true) {
        setActiveId(id);

        if (fetchData) {
            const fullData = await getFullCollection(id);
            onSelectCollection(fullData);
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <Text as="h3" weight={600}>
                    Gruppi di contenuti
                </Text>

                <button
                    className={styles.addButton}
                    onClick={handleCreateCollection}
                    disabled={creating}
                    aria-busy={creating}
                >
                    + Nuovo
                </button>
            </div>

            {loading ? (
                <Text as="p">Caricamento…</Text>
            ) : collections.length === 0 ? (
                <div className={styles.empty}>
                    <Text as="p">
                        Non hai ancora creato nessun gruppo. Clicca su “Nuovo” per iniziare.
                    </Text>
                </div>
            ) : (
                <ul className={styles.list} role="list">
                    {collections.map(col => (
                        <li key={col.id}>
                            <button
                                className={`${styles.item} ${
                                    activeId === col.id ? styles.active : ""
                                }`}
                                onClick={() => handleSelect(col.id)}
                                aria-current={activeId === col.id ? "true" : undefined}
                            >
                                <Text as="span" weight={500}>
                                    {col.name}
                                </Text>
                            </button>

                            {activeCollectionId === col.id ? (
                                <span className={styles.activeLabel}>✓ Attivo</span>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.useButton}
                                    onClick={async () => {
                                        setActiveCollectionId(col.id);
                                        await handleSelect(col.id);
                                    }}
                                >
                                    Usa questo menu
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
