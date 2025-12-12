import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import {
    getCollections,
    createCollection,
    getFullCollection,
    deleteCollection,
    updateCollection
} from "@/services/supabase/collections";
import type { Collection, FullCollection } from "@/types/database";
import { setActiveSpecialCollection } from "@/services/supabase/businesses";
import Text from "@/components/ui/Text/Text";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import { Input } from "@/components/ui";
import { Pencil, Trash } from "lucide-react";
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
    const [activeSpecialId, setActiveSpecialId] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newHighlighted, setNewHighlighted] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [editName, setEditName] = useState("");
    const [editHighlighted, setEditHighlighted] = useState(false);

    /* =============================
       LOAD COLLECTIONS
    ==============================*/
    const loadCollections = useCallback(async () => {
        setLoading(true);

        // 1) Carica tutte le collection
        const data = await getCollections(businessId);
        setCollections(data);

        // 2) Carica il business per ottenere active_special_collection_id
        const bizRes = await supabase
            .from("businesses")
            .select("active_special_collection_id")
            .eq("id", businessId)
            .single();

        if (!bizRes.error) {
            setActiveSpecialId(bizRes.data.active_special_collection_id);
        }

        setLoading(false);
    }, [businessId]);

    useEffect(() => {
        void loadCollections();
    }, [loadCollections]);

    // Quando il parent imposta un activeCollectionId, aggiorniamo anche il selected
    useEffect(() => {
        if (!activeCollectionId) return;

        // aggiorna la selezione visiva
        setActiveId(activeCollectionId);

        // carica la collection solo se non è già stata caricata da handleSelect
        getFullCollection(activeCollectionId).then(full => {
            onSelectCollection(full);
        });
    }, [activeCollectionId, onSelectCollection]);

    /* =============================
       CREATE NEW COLLECTION
    ==============================*/
    function openCreate() {
        setNewName("");
        setOpenCreateModal(true);
    }

    async function handleCreateCollection() {
        if (!newName.trim()) return;

        setCreating(true);

        // 1. Creiamo il menù con il flag highlighted
        const newCollection = await createCollection(businessId, {
            name: newName.trim(),
            highlighted: newHighlighted
        });

        // 3. Aggiorna la lista (lo aggiungiamo in fondo)
        setCollections(prev => prev.concat(newCollection));

        // 4. Seleziona automaticamente il nuovo gruppo
        await handleSelect(newCollection.id);

        // 5. Reset modale
        setCreating(false);
        setOpenCreateModal(false);
        setNewName("");
        setNewHighlighted(false);
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

    function askDelete(col: Collection) {
        setDeleteTarget(col);
    }

    async function handleConfirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);

        await deleteCollection(deleteTarget.id);

        setCollections(prev => prev.filter(c => c.id !== deleteTarget.id));

        // Se stavi visualizzando quel menù nell’editor
        if (activeId === deleteTarget.id) {
            setActiveId(null);
        }

        // Se era il menù "pubblicato", lo azzeri a livello di stato
        if (activeCollectionId === deleteTarget.id) {
            setActiveCollectionId(null as unknown as string);
            // (in realtà setActiveCollectionId accetta string | null nel parent)
        }

        // Se era il menu speciale attivo → reset
        if (activeSpecialId === deleteTarget.id) {
            await setActiveSpecialCollection(businessId, null);
            setActiveSpecialId(null);
        }

        setDeleting(false);
        setDeleteTarget(null);
    }

    function openEditModal(col: Collection) {
        setEditingCollection(col);
        setEditName(col.name);
        setEditHighlighted(col.highlighted);
        setEditOpen(true);
    }

    async function handleSaveEdit() {
        if (!editingCollection) return;

        try {
            await updateCollection(editingCollection.id, {
                name: editName,
                highlighted: editHighlighted
            });

            // 3. ricarica lista / stato
            await loadCollections(); // <-- usa qui la tua funzione che aggiorna lo stato

            setEditOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <Text variant="title-sm" as="h3" weight={600}>
                    I tuoi menu
                </Text>

                <button
                    className={styles.addButton}
                    onClick={openCreate}
                    disabled={creating}
                    aria-busy={creating}
                >
                    +
                </button>
            </div>

            {loading ? (
                <Text as="p">Caricamento…</Text>
            ) : collections.length === 0 ? (
                <div className={styles.empty}>
                    <Text as="p">
                        Non hai ancora creato nessun menu. Clicca su “Nuovo” per iniziare.
                    </Text>
                </div>
            ) : (
                <>
                    {/* ============================
             SEZIONE MENU SPECIALI
        ============================ */}
                    {collections.some(c => c.highlighted) && (
                        <>
                            <Text
                                variant="caption"
                                as="h4"
                                weight={400}
                                className={styles.sectionTitle}
                            >
                                Menu Speciali
                            </Text>

                            <ul className={styles.list} role="list">
                                {collections
                                    .filter(col => col.highlighted)
                                    .map(col => {
                                        const isSelected = activeId === col.id;
                                        const isActiveSpecial = activeSpecialId === col.id;

                                        return (
                                            <li
                                                key={col.id}
                                                className={`${styles.itemRow} ${
                                                    isSelected ? styles.active : ""
                                                }`}
                                                onClick={() => handleSelect(col.id)}
                                            >
                                                {/* ROW TOP → titolo + stellina */}
                                                <div className={styles.rowTop}>
                                                    <Text as="span" weight={600}>
                                                        {col.name}
                                                    </Text>

                                                    <span className={styles.starBadge}>★</span>
                                                </div>

                                                {/* ROW BOTTOM → usa speciale + icone */}
                                                <div className={styles.rowBottom}>
                                                    <button
                                                        type="button"
                                                        className={styles.specialButton}
                                                        onClick={async e => {
                                                            e.stopPropagation();

                                                            if (isActiveSpecial) {
                                                                await setActiveSpecialCollection(
                                                                    businessId,
                                                                    null
                                                                );
                                                                setActiveSpecialId(null);
                                                            } else {
                                                                await setActiveSpecialCollection(
                                                                    businessId,
                                                                    col.id
                                                                );
                                                                setActiveSpecialId(col.id);
                                                            }

                                                            await loadCollections();
                                                        }}
                                                    >
                                                        {isActiveSpecial ? "Rimuovi" : "Usa"}
                                                    </button>

                                                    <div className={styles.rightSide}>
                                                        <button
                                                            type="button"
                                                            className={styles.iconButton}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                openEditModal(col);
                                                            }}
                                                            aria-label={`Modifica ${col.name}`}
                                                        >
                                                            <Pencil size={18} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={styles.iconButton}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                askDelete(col);
                                                            }}
                                                            aria-label={`Elimina ${col.name}`}
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                            </ul>

                            <hr className={styles.separator} />
                        </>
                    )}

                    {/* ============================
             SEZIONE MENU PRINCIPALI
        ============================ */}
                    <Text variant="caption" as="h4" weight={400} className={styles.sectionTitle}>
                        Menu Principali
                    </Text>

                    <ul className={styles.list} role="list">
                        {collections
                            .filter(col => !col.highlighted)
                            .map(col => {
                                const isSelected = activeId === col.id;
                                const isActive = activeCollectionId === col.id;

                                return (
                                    <li
                                        key={col.id}
                                        className={`${styles.itemRow} ${
                                            isSelected ? styles.active : ""
                                        }`}
                                        onClick={() => handleSelect(col.id)}
                                    >
                                        {/* ROW TOP → titolo */}
                                        <div className={styles.rowTop}>
                                            <Text as="span" weight={600}>
                                                {col.name}
                                            </Text>
                                        </div>

                                        {/* ROW BOTTOM → usa + icone */}
                                        <div className={styles.rowBottom}>
                                            <div className={styles.leftSide}>
                                                {isActive ? (
                                                    <span className={styles.inUseBadge}>
                                                        In uso
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={styles.useButton}
                                                        onClick={async e => {
                                                            e.stopPropagation();
                                                            setActiveCollectionId(col.id);
                                                            await handleSelect(col.id);
                                                        }}
                                                    >
                                                        Usa
                                                    </button>
                                                )}
                                            </div>

                                            <div className={styles.rightSide}>
                                                <button
                                                    type="button"
                                                    className={styles.iconButton}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        openEditModal(col);
                                                    }}
                                                    aria-label={`Modifica ${col.name}`}
                                                >
                                                    <Pencil size={18} />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.iconButton}
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        askDelete(col);
                                                    }}
                                                    aria-label={`Elimina ${col.name}`}
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </>
            )}

            <ConfirmModal
                isOpen={openCreateModal}
                title="Crea un nuovo menu"
                description="Dai un nome al tuo nuovo menu."
                confirmLabel="Crea"
                cancelLabel="Annulla"
                onConfirm={handleCreateCollection}
                onCancel={() => setOpenCreateModal(false)}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Input
                        label="Nome del menu"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Es. Menu Pranzo"
                        autoFocus
                    />

                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            marginBottom: "1rem"
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={newHighlighted}
                            onChange={e => setNewHighlighted(e.target.checked)}
                        />
                        <Text variant="caption" weight={500}>
                            Imposta come menù speciale (in evidenza)
                        </Text>
                    </label>
                </div>
            </ConfirmModal>

            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                title="Elimina menù"
                description={
                    deleteTarget
                        ? `Sei sicuro di voler eliminare il menù “${deleteTarget.name}”? Questa azione non può essere annullata.`
                        : ""
                }
                confirmLabel={deleting ? "Eliminazione..." : "Elimina"}
                cancelLabel="Annulla"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <ConfirmModal
                isOpen={editOpen}
                title="Modifica menù"
                description=""
                confirmLabel="Salva"
                cancelLabel="Annulla"
                onCancel={() => setEditOpen(false)}
                onConfirm={handleSaveEdit}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <Input
                        label="Nome del menu"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Es. Menu Pranzo"
                        autoFocus
                    />

                    {/* TOGGLE IN EVIDENZA */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            cursor: "pointer",
                            marginBottom: "1rem"
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={editHighlighted}
                            onChange={e => setEditHighlighted(e.target.checked)}
                        />
                        <Text weight={500}>Mostra come menù del giorno</Text>
                    </label>
                </div>
            </ConfirmModal>
        </div>
    );
}
