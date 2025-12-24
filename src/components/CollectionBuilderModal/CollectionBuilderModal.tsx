import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CollectionPreviewFrame, {
    DeviceMode
} from "./CollectionPreviewFrame/CollectionPreviewFrame";
import Text from "@/components/ui/Text/Text";
import { Button } from "../ui";
import type { CollectionStyle } from "@/types/collectionStyle";
import { resolveCollectionStyle, safeCollectionStyle } from "@/types/collectionStyle";
import { useToast } from "@/context/Toast/ToastContext";

import {
    addItemToCollection,
    createItem,
    createSection,
    getCollectionBuilderData,
    getCollectionItemsWithData,
    renameSection,
    searchItems,
    updateCollection,
    updateCollectionItem
} from "@/services/supabase/collections";

import type { Collection, CollectionItemWithItem, CollectionSection, Item } from "@/types/database";

import CollectionStylePanel from "./CollectionStylePanel/CollectionStylePanel";
import CollectionContentPanel from "./CollectionContentPanel/CollectionContentPanel";
import CollectionView from "../PublicCollectionView/CollectionView/CollectionView";
import { ChevronLeft, ChevronRight, Laptop, Smartphone, Tablet } from "lucide-react";
import styles from "./CollectionBuilderModal.module.scss";

type Props = {
    isOpen: boolean;
    collectionId: string | null;
    onClose: () => void;
};

type ActiveTab = "content" | "style";

type BuilderState = {
    collection: Collection;
    sections: CollectionSection[];
    items: CollectionItemWithItem[];
};

export default function CollectionBuilderModal({ isOpen, collectionId, onClose }: Props) {
    const modalRef = useRef<HTMLDivElement | null>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BuilderState | null>(null);

    const [tab, setTab] = useState<ActiveTab>("content");
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<Item[]>([]);
    const [searching, setSearching] = useState(false);

    const [mode, setMode] = useState<DeviceMode>("mobile");

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

    // Stile (per ora 1 sola opzione)
    const [styleDraft, setStyleDraft] = useState<CollectionStyle>({});

    const { showToast } = useToast();

    const savedStyle = useMemo(() => safeCollectionStyle(data?.collection.style ?? null), [data]);

    const resolvedStyle = useMemo(
        () => resolveCollectionStyle(savedStyle, styleDraft),
        [savedStyle, styleDraft]
    );

    const refreshItems = useCallback(async (cid: string) => {
        const refreshed = await getCollectionItemsWithData(cid);
        setData(prev => (prev ? { ...prev, items: refreshed } : prev));
    }, []);

    const load = useCallback(async (cid: string) => {
        setLoading(true);
        try {
            const base = await getCollectionBuilderData(cid);
            const items = await getCollectionItemsWithData(cid);

            const next: BuilderState = {
                collection: base.collection,
                sections: base.sections,
                items
            };

            setData(next);
            setActiveSectionId(next.sections[0]?.id ?? null);
            setStyleDraft(safeCollectionStyle(next.collection.style));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen || !collectionId) return;
        void load(collectionId);
    }, [isOpen, collectionId, load]);

    // ESC close + focus trap basic
    useEffect(() => {
        if (!isOpen) return;

        // salva il focus precedente
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", onKey);

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;
            if (!modalRef.current) return;

            const focusables = getFocusableElements(modalRef.current);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);

        // focus iniziale sulla modale
        setTimeout(() => {
            modalRef.current?.focus();
        }, 0);

        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) return;

        // ripristina il focus al trigger
        previouslyFocusedRef.current?.focus();
    }, [isOpen]);

    // Search debounce
    useEffect(() => {
        if (!search.trim()) {
            setSearchResults([]);
            return;
        }

        const t = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await searchItems(search);
                setSearchResults(res);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(t);
    }, [search]);

    const sections = useMemo(() => {
        if (!data?.sections) return [];
        return [...data.sections].sort((a, b) => a.order_index - b.order_index);
    }, [data?.sections]);

    const items = data?.items ?? [];

    const itemsInActiveSection = useMemo(() => {
        if (!activeSectionId) return [];

        return items
            .filter(it => it.section_id === activeSectionId)
            .sort((a, b) => a.order_index - b.order_index);
    }, [items, activeSectionId]);

    const handleCreateSection = useCallback(
        async (name: string) => {
            if (!collectionId) return;

            const created = await createSection(collectionId, name);

            setData(prev => (prev ? { ...prev, sections: [...prev.sections, created] } : prev));

            setActiveSectionId(created.id);
        },
        [collectionId]
    );

    const handleRenameSection = useCallback(async (sectionId: string, name: string) => {
        const updated = await renameSection(sectionId, name);

        setData(prev =>
            prev
                ? {
                      ...prev,
                      sections: prev.sections.map(s => (s.id === sectionId ? updated : s))
                  }
                : prev
        );
    }, []);

    const handleAddItem = useCallback(
        async (selected: Item) => {
            if (!collectionId || !activeSectionId) return;

            // 1) se esiste già l'Item globale lo riusi: qui aggiungi direttamente
            await addItemToCollection(collectionId, selected.id, activeSectionId);

            // 2) refresh items with join
            await refreshItems(collectionId);

            // pulizia input
            setSearch("");
            setSearchResults([]);
        },
        [collectionId, activeSectionId, refreshItems]
    );

    const handleCreateAndAddItem = useCallback(async () => {
        if (!collectionId || !activeSectionId) return;
        if (!search.trim()) return;

        const created = await createItem({ name: search.trim() });
        await addItemToCollection(collectionId, created.id, activeSectionId);

        await refreshItems(collectionId);

        setSearch("");
        setSearchResults([]);
    }, [collectionId, activeSectionId, refreshItems, search]);

    const handleToggleVisibility = useCallback(
        async (collectionItemId: string, visible: boolean) => {
            if (!collectionId) return;

            await updateCollectionItem(collectionItemId, { visible });
            await refreshItems(collectionId);
        },
        [collectionId, refreshItems]
    );

    const handleSaveStyle = useCallback(async () => {
        if (!data) return;

        try {
            const safeDraft = safeCollectionStyle(styleDraft);

            const updated = await updateCollection(data.collection.id, {
                style: safeDraft
            });

            setData(prev => (prev ? { ...prev, collection: updated } : prev));

            // 🔄 riallinea il draft allo stato salvato
            setStyleDraft(safeCollectionStyle(updated.style));

            // ✅ TOAST SUCCESS
            showToast({
                type: "success",
                message: "Stile salvato correttamente",
                duration: 2500
            });
        } catch (error) {
            // ❌ TOAST ERROR
            showToast({
                type: "error",
                message: "Errore nel salvataggio dello stile",
                duration: 3000
            });
        }
    }, [data, styleDraft]);

    const handleReorderSections = useCallback(
        (sourceId: string, targetId: string) => {
            if (!data) return;
            if (sourceId === targetId) return;

            const current = [...data.sections];
            const sourceIndex = current.findIndex(s => s.id === sourceId);
            const targetIndex = current.findIndex(s => s.id === targetId);

            if (sourceIndex === -1 || targetIndex === -1) return;

            const reordered = [...current];
            const [moved] = reordered.splice(sourceIndex, 1);
            reordered.splice(targetIndex, 0, moved);

            const withOrder = reordered.map((s, index) => ({
                ...s,
                order_index: index
            }));

            setData(prev => (prev ? { ...prev, sections: withOrder } : prev));
        },
        [data]
    );

    const handleReorderItems = useCallback(
        (sourceId: string, targetId: string) => {
            if (!data || !activeSectionId) return;
            if (sourceId === targetId) return;

            const current = data.items.filter(it => it.section_id === activeSectionId);

            const sourceIndex = current.findIndex(it => it.id === sourceId);
            const targetIndex = current.findIndex(it => it.id === targetId);

            if (sourceIndex === -1 || targetIndex === -1) return;

            const reordered = [...current];
            const [moved] = reordered.splice(sourceIndex, 1);
            reordered.splice(targetIndex, 0, moved);

            const withOrder = reordered.map((it, index) => ({
                ...it,
                order_index: index
            }));

            setData(prev => {
                if (!prev) return prev;

                const others = prev.items.filter(it => it.section_id !== activeSectionId);

                return {
                    ...prev,
                    items: [...others, ...withOrder]
                };
            });
        },
        [data, activeSectionId]
    );

    const persistSectionOrder = useCallback(async () => {
        if (!data) return;

        await Promise.all(data.sections.map(s => renameSection(s.id, s.name, s.order_index)));
    }, [data]);

    const persistItemOrder = useCallback(async () => {
        if (!data || !activeSectionId) return;

        const itemsToSave = data.items.filter(it => it.section_id === activeSectionId);

        await Promise.all(
            itemsToSave.map(it =>
                updateCollectionItem(it.id, {
                    order_index: it.order_index
                })
            )
        );
    }, [data, activeSectionId]);

    function getFocusableElements(container: HTMLElement): HTMLElement[] {
        const selectors = [
            "a[href]",
            "button:not([disabled])",
            "textarea:not([disabled])",
            "input:not([disabled])",
            "select:not([disabled])",
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(container.querySelectorAll<HTMLElement>(selectors.join(",")));
    }

    if (!isOpen || !collectionId) return null;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-builder-title"
            onClick={onClose}
        >
            <div
                className={styles.modal}
                ref={modalRef}
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
            >
                {/* HEADER */}
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Text as="h2" variant="title-md" weight={600}>
                            {data?.collection.name ?? "Collezione"}
                        </Text>

                        <div className={styles.tabs} role="tablist" aria-label="Sezioni builder">
                            <button
                                type="button"
                                className={tab === "content" ? styles.tabActive : styles.tab}
                                role="tab"
                                aria-selected={tab === "content"}
                                onClick={() => setTab("content")}
                            >
                                <Text variant="body" weight={600}>
                                    Contenuto
                                </Text>
                            </button>

                            <button
                                type="button"
                                className={tab === "style" ? styles.tabActive : styles.tab}
                                role="tab"
                                aria-selected={tab === "style"}
                                onClick={() => setTab("style")}
                            >
                                <Text variant="body" weight={600}>
                                    Stile
                                </Text>
                            </button>
                        </div>
                    </div>

                    <div className={styles.headerRight}>
                        <div
                            className={styles.deviceGroup}
                            role="radiogroup"
                            aria-label="Modalità anteprima"
                        >
                            <button
                                type="button"
                                role="radio"
                                aria-checked={mode === "mobile"}
                                className={mode === "mobile" ? styles.deviceActive : styles.device}
                                onClick={() => setMode("mobile")}
                            >
                                <Smartphone size={20} />
                            </button>

                            <button
                                type="button"
                                role="radio"
                                aria-checked={mode === "tablet"}
                                className={mode === "tablet" ? styles.deviceActive : styles.device}
                                onClick={() => setMode("tablet")}
                            >
                                <Tablet size={20} />
                            </button>

                            <button
                                type="button"
                                role="radio"
                                aria-checked={mode === "desktop"}
                                className={mode === "desktop" ? styles.deviceActive : styles.device}
                                onClick={() => setMode("desktop")}
                            >
                                <Laptop />
                            </button>
                        </div>

                        {tab === "style" && (
                            <Button variant="primary" onClick={handleSaveStyle} label="Salva" />
                        )}

                        <Button variant="ghost" onClick={onClose} label="Chiudi" />
                    </div>
                </header>

                {/* BODY */}
                <div className={`${styles.body} ${!isSidebarOpen ? styles.bodyCollapsed : ""}`}>
                    <button
                        type="button"
                        className={styles.collapseToggle}
                        aria-label={isSidebarOpen ? "Nascondi pannello" : "Mostra pannello"}
                        onClick={() => setIsSidebarOpen(v => !v)}
                    >
                        {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
                    </button>

                    {/* LEFT PANEL */}
                    <aside className={styles.left}>
                        {tab === "content" ? (
                            <CollectionContentPanel
                                sections={sections}
                                itemsInActiveSection={itemsInActiveSection}
                                activeSectionId={activeSectionId}
                                search={search}
                                searching={searching}
                                searchResults={searchResults}
                                onSelectSection={setActiveSectionId}
                                onCreateSection={handleCreateSection}
                                onSearchChange={setSearch}
                                onCreateItem={handleCreateAndAddItem}
                                onAddItem={handleAddItem}
                                onToggleVisibility={handleToggleVisibility}
                                draggingSectionId={draggingSectionId}
                                onDragStart={id => setDraggingSectionId(id)}
                                onDragEnd={async () => {
                                    setDraggingSectionId(null);
                                    await persistSectionOrder();
                                }}
                                onReorderSections={handleReorderSections}
                                draggingItemId={draggingItemId}
                                onItemDragStart={id => setDraggingItemId(id)}
                                onItemDragEnd={async () => {
                                    setDraggingItemId(null);
                                    await persistItemOrder();
                                }}
                                onReorderItems={handleReorderItems}
                            />
                        ) : (
                            <CollectionStylePanel
                                styleDraft={styleDraft}
                                resolvedStyle={resolvedStyle}
                                onChange={next => setStyleDraft(prev => ({ ...prev, ...next }))}
                            />
                        )}
                    </aside>

                    {/* RIGHT PREVIEW */}
                    <section className={styles.right} aria-label="Anteprima collezione">
                        <CollectionPreviewFrame mode={mode}>
                            <CollectionView
                                mode="preview"
                                businessName={"PREVIEW"}
                                businessImage={""}
                                collectionTitle={data?.collection.name ?? "Collezione"}
                                sections={sections.map(s => ({
                                    id: s.id,
                                    name: s.name,
                                    items: items
                                        .filter(ci => ci.visible && ci.section_id === s.id)
                                        .sort((a, b) => a.order_index - b.order_index)
                                        .map(ci => ({
                                            id: ci.id,
                                            name: ci.item.name,
                                            description: ci.item.description ?? null,
                                            image: ci.item.metadata?.image ?? null,
                                            price:
                                                ci.item.base_price != null
                                                    ? Number(ci.item.base_price)
                                                    : null
                                        }))
                                }))}
                                style={resolvedStyle}
                            />
                        </CollectionPreviewFrame>
                    </section>
                </div>

                {loading && (
                    <div className={styles.loadingOverlay} aria-live="polite">
                        <Text variant="body">Caricamento…</Text>
                    </div>
                )}
            </div>
        </div>
    );
}
