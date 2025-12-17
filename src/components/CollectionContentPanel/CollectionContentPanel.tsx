import { useState, memo } from "react";
import Text from "@/components/ui/Text/Text";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import type { CollectionSection, CollectionItemWithItem, Item } from "@/types/database";
import styles from "./CollectionContentPanel.module.scss";

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
    const [overSectionId, setOverSectionId] = useState<string | null>(null);
    const [overItemId, setOverItemId] = useState<string | null>(null);

    return (
        <>
            <Text variant="title-sm" weight={600}>
                Sezioni
            </Text>

            {/* CREATE SECTION */}
            <form
                className={styles.addSection}
                onSubmit={async e => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem(
                        "sectionName"
                    ) as HTMLInputElement | null;

                    const name = input?.value.trim();
                    if (!name) return;

                    await onCreateSection(name);
                    if (input) input.value = "";
                }}
            >
                <Input name="sectionName" placeholder="Nuova sezione (es. Antipasti)" label="" />
                <Button type="submit" variant="secondary" label="Aggiungi" />
            </form>

            {/* SECTION LIST */}
            <div className={styles.sectionList} role="list">
                {sections.map(s => {
                    const active = s.id === activeSectionId;

                    return (
                        <button
                            key={s.id}
                            type="button"
                            draggable
                            className={[
                                active ? styles.sectionActive : styles.section,
                                draggingSectionId === s.id ? styles.sectionDragging : ""
                            ].join(" ")}
                            onClick={() => onSelectSection(s.id)}
                            role="listitem"
                            onDragStart={() => onDragStart(s.id)}
                            onDragEnd={onDragEnd}
                            onDragOver={e => {
                                e.preventDefault();
                                setOverSectionId(s.id);
                            }}
                            onDrop={() => {
                                setOverSectionId(null);
                                onReorderSections(draggingSectionId!, s.id);
                            }}
                        >
                            <span
                                className={styles.dragHandle}
                                draggable
                                aria-label="Trascina sezione"
                                onDragStart={() => onDragStart(s.id)}
                                onDragEnd={onDragEnd}
                            >
                                ⋮⋮
                            </span>
                            <Text variant="body" weight={600}>
                                {s.name}
                            </Text>
                        </button>
                    );
                })}
            </div>

            <div className={styles.divider} />

            <Text variant="title-sm" weight={600}>
                Aggiungi contenuto
            </Text>

            <div className={styles.searchBox}>
                <Input
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    label=""
                    placeholder={
                        activeSectionId
                            ? "Cerca nel catalogo o scrivi per creare..."
                            : "Seleziona prima una sezione"
                    }
                    disabled={!activeSectionId}
                />

                <Button
                    variant="primary"
                    onClick={onCreateItem}
                    label="Crea"
                    disabled={!activeSectionId || !search.trim()}
                />
            </div>

            {searching && <Text variant="body">Ricerca in corso…</Text>}

            {!searching && searchResults.length > 0 && (
                <div className={styles.searchResults} role="list">
                    {searchResults.map(it => (
                        <button
                            key={it.id}
                            type="button"
                            className={styles.searchResult}
                            onClick={() => onAddItem(it)}
                            role="listitem"
                        >
                            <Text variant="body" weight={600}>
                                {it.name}
                            </Text>
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.divider} />

            <Text variant="title-sm" weight={600}>
                Contenuti sezione
            </Text>

            {!activeSectionId ? (
                <Text variant="body">Seleziona una sezione per vedere i contenuti.</Text>
            ) : itemsInActiveSection.length === 0 ? (
                <Text variant="body">Nessun contenuto in questa sezione.</Text>
            ) : (
                <div className={styles.itemsList}>
                    {itemsInActiveSection.map(ci => (
                        <div
                            key={ci.id}
                            className={[
                                styles.itemRow,
                                draggingItemId === ci.id ? styles.itemDragging : ""
                            ].join(" ")}
                            draggable
                            onDragStart={() => onItemDragStart(ci.id)}
                            onDragEnd={onItemDragEnd}
                            onDragOver={e => {
                                e.preventDefault();
                                setOverItemId(ci.id);
                            }}
                            onDrop={() => {
                                setOverItemId(null);
                                onReorderItems(draggingItemId!, ci.id);
                            }}
                        >
                            <span
                                className={styles.dragHandle}
                                draggable
                                aria-label="Trascina elemento"
                                onDragStart={() => onItemDragStart(ci.id)}
                                onDragEnd={onItemDragEnd}
                            >
                                ⋮⋮
                            </span>

                            <Text variant="body" weight={600}>
                                {ci.item.name}
                            </Text>

                            <Button
                                variant="ghost"
                                label={ci.visible ? "Nascondi" : "Mostra"}
                                onClick={() => onToggleVisibility(ci.id, !ci.visible)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

CollectionContentPanel.displayName = "CollectionContentPanel";

export default memo(CollectionContentPanel);
