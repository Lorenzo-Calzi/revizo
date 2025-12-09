import { useState, useMemo } from "react";
import Text from "@/components/ui/Text/Text";
import styles from "./ItemSelectionPanel.module.scss";
import type { BusinessItem } from "@/types/database";

type Props = {
    items: BusinessItem[];
    alreadySelected: string[];
    onSelect: (itemIds: string[]) => void;
};

export default function ItemSelectionPanel({ items, alreadySelected, onSelect }: Props) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);

    // Filtra gli item escludendo quelli già presenti e applica la ricerca
    const filtered = useMemo(() => {
        return items
            .filter(i => !alreadySelected.includes(i.id))
            .filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    }, [items, alreadySelected, search]);

    function toggle(itemId: string) {
        setSelected(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    }

    function handleConfirm() {
        onSelect(selected);
    }

    return (
        <div className={styles.wrapper}>
            {/* Ricerca */}
            <input
                className={styles.search}
                type="text"
                placeholder="Cerca elemento..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Lista item */}
            <div className={styles.list}>
                {filtered.length === 0 && (
                    <Text colorVariant="muted">Nessun elemento trovato.</Text>
                )}

                {filtered.map(item => (
                    <label key={item.id} className={styles.row}>
                        <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => toggle(item.id)}
                        />

                        {/* Thumbnail o placeholder */}
                        {item.image ? (
                            <img src={item.image} className={styles.thumb} />
                        ) : (
                            <div className={styles.thumbPlaceholder}>🍽️</div>
                        )}

                        <Text>{item.name}</Text>
                    </label>
                ))}
            </div>

            {/* Conferma */}
            <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={selected.length === 0}
            >
                Aggiungi elementi
            </button>
        </div>
    );
}
