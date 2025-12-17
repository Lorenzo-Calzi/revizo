import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Text from "@/components/ui/Text/Text";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import {
    createItem,
    deleteItem,
    listItems,
    searchItems,
    updateItem
} from "@/services/supabase/collections";
import type { Item } from "@/types/database";
import styles from "./CatalogManagerModal.module.scss";
import { uploadCatalogItemImage } from "@/services/supabase/upload";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

type DraftMap = Record<
    string,
    {
        name: string;
        description: string;
        base_price: string;
        duration: string;
        image?: string | null;
        allergens?: string[];
    }
>;

function normalizeNumber(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
}

export default function CatalogManagerModal({ isOpen, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [query, setQuery] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const [openId, setOpenId] = useState<string | null>(null);

    const [createName, setCreateName] = useState("");
    const [createError, setCreateError] = useState<string | null>(null);

    const [drafts, setDrafts] = useState<DraftMap>({});

    const firstFocusRef = useRef<HTMLInputElement | null>(null);

    const loadInitial = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listItems(50);
            setItems(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Errore nel caricamento del catalogo");
        } finally {
            setLoading(false);
        }
    }, []);

    // open/close lifecycle
    useEffect(() => {
        if (!isOpen) return;
        loadInitial();

        // focus
        setTimeout(() => firstFocusRef.current?.focus(), 0);
    }, [isOpen, loadInitial]);

    // esc close
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // search debounce
    useEffect(() => {
        if (!isOpen) return;

        const t = setTimeout(async () => {
            const q = query.trim();

            // se query vuota → lista base (più performante di ilike "%%")
            if (!q) {
                await loadInitial();
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await searchItems(q);
                setItems(data);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Errore nella ricerca");
            } finally {
                setLoading(false);
            }
        }, 250);

        return () => clearTimeout(t);
    }, [query, isOpen, loadInitial]);

    const sorted = useMemo(() => {
        // lasciamo l’ordine già dato da query/listItems
        return items;
    }, [items]);

    const ensureDraft = useCallback((it: Item) => {
        setDrafts(prev => {
            if (prev[it.id]) return prev;
            return {
                ...prev,
                [it.id]: {
                    name: it.name ?? "",
                    description: it.description ?? "",
                    base_price: it.base_price != null ? String(it.base_price) : "",
                    duration: it.duration != null ? String(it.duration) : "",
                    image: it.metadata?.image ?? null,
                    allergens: it.metadata?.allergens ?? []
                }
            };
        });
    }, []);

    const onToggle = useCallback(
        (it: Item) => {
            const next = openId === it.id ? null : it.id;
            setOpenId(next);
            if (next) ensureDraft(it);
        },
        [openId, ensureDraft]
    );

    const onChangeDraft = useCallback(
        <K extends keyof DraftMap[string]>(id: string, key: K, value: DraftMap[string][K]) => {
            setDrafts(prev => ({
                ...prev,
                [id]: {
                    ...(prev[id] ?? {
                        name: "",
                        description: "",
                        base_price: "",
                        duration: "",
                        image: null,
                        allergens: []
                    }),
                    [key]: value
                }
            }));
        },
        []
    );

    const onSave = useCallback(
        async (it: Item) => {
            const d = drafts[it.id];
            if (!d) return;

            const name = d.name.trim();
            if (!name) {
                setError("Il nome non può essere vuoto.");
                return;
            }

            setSavingId(it.id);
            setError(null);

            try {
                const updated = await updateItem(it.id, {
                    name,
                    description: d.description.trim() || null,
                    base_price: normalizeNumber(d.base_price),
                    duration: normalizeNumber(d.duration),
                    metadata: {
                        image: d.image ?? null,
                        allergens: d.allergens ?? []
                    }
                });

                setItems(prev => prev.map(x => (x.id === it.id ? updated : x)));
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Errore nel salvataggio");
            } finally {
                setSavingId(null);
            }
        },
        [drafts]
    );

    const onRemove = useCallback(
        async (id: string) => {
            setSavingId(id);
            setError(null);
            try {
                await deleteItem(id);
                setItems(prev => prev.filter(x => x.id !== id));
                setDrafts(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                });
                if (openId === id) setOpenId(null);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Errore durante l’eliminazione");
            } finally {
                setSavingId(null);
            }
        },
        [openId]
    );

    const onCreate = useCallback(async () => {
        const name = createName.trim();
        if (!name) {
            setCreateError("Inserisci un nome.");
            return;
        }

        setCreateError(null);
        setSavingId("create");

        try {
            const newItem = await createItem({ name });
            setItems(prev => [newItem, ...prev]);

            // apriamo subito l’accordion appena creato
            setOpenId(newItem.id);
            ensureDraft(newItem);

            setCreateName("");
        } catch (e: unknown) {
            setCreateError(e instanceof Error ? e.message : "Errore nella creazione dell’item");
        } finally {
            setSavingId(null);
        }
    }, [createName, ensureDraft]);

    if (!isOpen) return null;

    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-title"
        >
            <div className={styles.modal}>
                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Text as="h2" variant="title-md" weight={700}>
                            Catalogo
                        </Text>
                        <Text variant="caption" colorVariant="muted">
                            Gestisci i contenuti globali riutilizzabili nelle collezioni.
                        </Text>
                    </div>

                    <Button label="Chiudi" variant="ghost" onClick={onClose} />
                </header>

                <div className={styles.toolbar}>
                    <div className={styles.search}>
                        <input
                            ref={firstFocusRef}
                            className={styles.searchInput}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Cerca un contenuto…"
                            aria-label="Cerca contenuto"
                        />
                    </div>

                    <div className={styles.createRow}>
                        <Input
                            label="Nuovo contenuto"
                            value={createName}
                            onChange={e => setCreateName(e.target.value)}
                            placeholder="Es. Carbonara"
                            error={createError ?? undefined}
                        />
                        <Button label="Crea" loading={savingId === "create"} onClick={onCreate} />
                    </div>
                </div>

                <div className={styles.content}>
                    {error && (
                        <div className={styles.errorBox} role="alert">
                            <Text>{error}</Text>
                        </div>
                    )}

                    {loading && <Text colorVariant="muted">Caricamento…</Text>}

                    {!loading && sorted.length === 0 && (
                        <Text colorVariant="muted">Nessun contenuto trovato.</Text>
                    )}

                    <ul className={styles.list}>
                        {sorted.map(it => {
                            const isOpenRow = openId === it.id;
                            const d = drafts[it.id];

                            return (
                                <li key={it.id} className={styles.itemCard}>
                                    <button
                                        className={styles.itemHeader}
                                        onClick={() => onToggle(it)}
                                        aria-expanded={isOpenRow}
                                        aria-controls={`item-panel-${it.id}`}
                                        type="button"
                                    >
                                        <div className={styles.itemHeaderLeft}>
                                            <Text weight={700}>{it.name}</Text>
                                            {(it.description ?? "").trim() && (
                                                <Text variant="caption" colorVariant="muted">
                                                    {it.description}
                                                </Text>
                                            )}
                                        </div>

                                        <div className={styles.itemHeaderRight}>
                                            {typeof it.base_price === "number" && (
                                                <Text weight={700}>
                                                    € {it.base_price.toFixed(2)}
                                                </Text>
                                            )}
                                            <span className={styles.chevron} aria-hidden />
                                        </div>
                                    </button>

                                    {isOpenRow && d && (
                                        <div
                                            id={`item-panel-${it.id}`}
                                            className={styles.itemPanel}
                                        >
                                            <div className={styles.grid}>
                                                <div className={styles.fullWidth}>
                                                    <Text variant="body" weight={600}>
                                                        Immagine
                                                    </Text>

                                                    {d.image ? (
                                                        <img
                                                            src={d.image}
                                                            alt={d.name}
                                                            className={styles.imagePreview}
                                                        />
                                                    ) : (
                                                        <Text
                                                            variant="caption"
                                                            colorVariant="muted"
                                                        >
                                                            Nessuna immagine caricata
                                                        </Text>
                                                    )}

                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={async e => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            setSavingId(it.id);
                                                            try {
                                                                const url =
                                                                    await uploadCatalogItemImage(
                                                                        it.id,
                                                                        file
                                                                    );

                                                                onChangeDraft(it.id, "image", url);
                                                            } catch {
                                                                setError(
                                                                    "Errore nel caricamento dell'immagine"
                                                                );
                                                            } finally {
                                                                setSavingId(null);
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <Input
                                                    label="Nome"
                                                    value={d.name}
                                                    onChange={e =>
                                                        onChangeDraft(it.id, "name", e.target.value)
                                                    }
                                                />

                                                <Input
                                                    label="Prezzo base"
                                                    value={d.base_price}
                                                    onChange={e =>
                                                        onChangeDraft(
                                                            it.id,
                                                            "base_price",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Es. 12,50"
                                                    inputMode="decimal"
                                                />

                                                <Input
                                                    label="Durata (min)"
                                                    value={d.duration}
                                                    onChange={e =>
                                                        onChangeDraft(
                                                            it.id,
                                                            "duration",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Es. 30"
                                                    inputMode="numeric"
                                                />

                                                <div className={styles.fullWidth}>
                                                    <label className={styles.textareaLabel}>
                                                        <Text variant="body" weight={600}>
                                                            Descrizione
                                                        </Text>
                                                    </label>
                                                    <textarea
                                                        className={styles.textarea}
                                                        value={d.description}
                                                        onChange={e =>
                                                            onChangeDraft(
                                                                it.id,
                                                                "description",
                                                                e.target.value
                                                            )
                                                        }
                                                        rows={3}
                                                    />
                                                </div>

                                                <div className={styles.fullWidth}>
                                                    <Text variant="body" weight={600}>
                                                        Allergeni
                                                    </Text>

                                                    <div className={styles.allergens}>
                                                        {[
                                                            "glutine",
                                                            "lattosio",
                                                            "frutta a guscio"
                                                        ].map(a => (
                                                            <label
                                                                key={a}
                                                                className={styles.allergen}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(
                                                                        d.allergens ?? []
                                                                    ).includes(a)}
                                                                    onChange={e => {
                                                                        const current =
                                                                            d.allergens ?? [];
                                                                        const next = e.target
                                                                            .checked
                                                                            ? [...current, a]
                                                                            : current.filter(
                                                                                  x => x !== a
                                                                              );

                                                                        onChangeDraft(
                                                                            it.id,
                                                                            "allergens",
                                                                            next
                                                                        );
                                                                    }}
                                                                />
                                                                <Text variant="caption">{a}</Text>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.actions}>
                                                <Button
                                                    label="Salva"
                                                    loading={savingId === it.id}
                                                    onClick={() => onSave(it)}
                                                />
                                                <Button
                                                    label="Elimina"
                                                    variant="secondary"
                                                    loading={savingId === it.id}
                                                    onClick={() => onRemove(it.id)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
