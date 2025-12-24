import { memo, useState } from "react";
import Text from "@/components/ui/Text/Text";
import { Input } from "@/components/ui";
import type { CollectionSection, CollectionItemWithItem, Item } from "@/types/database";
import styles from "./CollectionContentPanel.module.scss";
import { Eye, EyeOff, Plus } from "lucide-react";

type Props = {
    sections: CollectionSection[];
    itemsInActiveSection: CollectionItemWithItem[];
    activeSectionId: string | null;

    search: string;
    searching: boolean;
    searchResults: Item[];

    onSelectSection: (id: string) => void;
    onCreateSection: (name: string) => Promise<void>;

    onSearchChange: (value: string) => void;
    onCreateItem: () => Promise<void>;
    onAddItem: (item: Item) => Promise<void>;

    onToggleVisibility: (collectionItemId: string, visible: boolean) => Promise<void>;

    onReorderSections: (sourceId: string, targetId: string) => void;
    draggingSectionId: string | null;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;

    draggingItemId: string | null;
    onItemDragStart: (id: string) => void;
    onItemDragEnd: () => void;
    onReorderItems: (sourceId: string, targetId: string) => void;
};

function CollectionContentPanel({
    sections,
    itemsInActiveSection,
    activeSectionId,
    search,
    searching,
    searchResults,
    onSelectSection,
    onCreateSection,
    onSearchChange,
    onCreateItem,
    onAddItem,
    onToggleVisibility,
    onReorderSections,
    draggingSectionId,
    onDragStart,
    onDragEnd,
    draggingItemId,
    onItemDragStart,
    onItemDragEnd,
    onReorderItems
}: Props) {
    const [addingSection, setAddingSection] = useState(false);

    return (
        <div className={styles.panel}>
            {/* ======================
          SEZIONI
      ====================== */}
            <div className={styles.headerRow}>
                <Text variant="caption" weight={600}>
                    CATEGORIE
                </Text>

                {!addingSection && (
                    <button className={styles.inlineAction} onClick={() => setAddingSection(true)}>
                        <Plus size={14} />
                        Aggiungi
                    </button>
                )}
            </div>

            {addingSection && (
                <form
                    className={styles.inlineForm}
                    onSubmit={async e => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem(
                            "sectionName"
                        ) as HTMLInputElement | null;

                        const name = input?.value.trim();
                        if (!name) return;

                        await onCreateSection(name);
                        setAddingSection(false);
                    }}
                >
                    <Input name="sectionName" placeholder="es. Antipasti" autoFocus />
                </form>
            )}

            <div className={styles.sectionList}>
                {sections.map(s => {
                    const active = s.id === activeSectionId;

                    return (
                        <button
                            key={s.id}
                            type="button"
                            className={[
                                styles.sectionRow,
                                active ? styles.active : "",
                                draggingSectionId === s.id ? styles.dragging : ""
                            ].join(" ")}
                            onClick={() => onSelectSection(s.id)}
                            draggable
                            onDragStart={() => onDragStart(s.id)}
                            onDragEnd={onDragEnd}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => {
                                if (!draggingSectionId) return;
                                onReorderSections(draggingSectionId, s.id);
                            }}
                        >
                            <span className={styles.dragHandle}>⋮⋮</span>
                            <Text variant="body" weight={600}>
                                {s.name}
                            </Text>
                        </button>
                    );
                })}
            </div>

            <div className={styles.divider} />

            {/* ======================
          CONTENUTI
      ====================== */}
            <Text variant="caption" weight={600}>
                PRODOTTI
            </Text>

            <Input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder={
                    activeSectionId
                        ? "Aggiungi o cerca un contenuto…"
                        : "Seleziona prima una sezione"
                }
                disabled={!activeSectionId}
                onKeyDown={e => {
                    if (e.key === "Enter" && search.trim()) {
                        e.preventDefault();
                        onCreateItem();
                    }
                }}
            />

            {searching && (
                <Text variant="body" className={styles.helperText}>
                    Ricerca in corso…
                </Text>
            )}

            {!searching && searchResults.length > 0 && (
                <div className={styles.searchResults}>
                    {searchResults.map(it => (
                        <button
                            key={it.id}
                            className={styles.searchResult}
                            onClick={() => onAddItem(it)}
                        >
                            <Text variant="body" weight={600}>
                                {it.name}
                            </Text>
                        </button>
                    ))}
                </div>
            )}

            {!activeSectionId ? (
                <Text variant="body" className={styles.helperText}>
                    Aggiungi una categoria per gestire i contenuti.
                </Text>
            ) : itemsInActiveSection.length === 0 ? (
                <Text variant="body" className={styles.helperText}>
                    Nessun prodotto in questa sezione.
                </Text>
            ) : (
                <div className={styles.itemsList}>
                    {itemsInActiveSection.map(ci => (
                        <div
                            key={ci.id}
                            className={[
                                styles.itemRow,
                                draggingItemId === ci.id ? styles.dragging : ""
                            ].join(" ")}
                            draggable
                            onDragStart={() => onItemDragStart(ci.id)}
                            onDragEnd={onItemDragEnd}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => {
                                if (!draggingItemId) return;
                                onReorderItems(draggingItemId, ci.id);
                            }}
                        >
                            <div className={styles.itemLeft}>
                                <span className={styles.dragHandle}>⋮⋮</span>
                                <Text variant="body" weight={600}>
                                    {ci.item.name}
                                </Text>
                            </div>

                            <button
                                className={styles.visibilityToggle}
                                onClick={() => onToggleVisibility(ci.id, !ci.visible)}
                                aria-label={ci.visible ? "Nascondi" : "Mostra"}
                            >
                                {ci.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

CollectionContentPanel.displayName = "CollectionContentPanel";
export default memo(CollectionContentPanel);
