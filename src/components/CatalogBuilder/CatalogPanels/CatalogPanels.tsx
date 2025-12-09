import { useState, useMemo } from "react";
import Text from "@/components/ui/Text/Text";
import styles from "./CatalogPanels.module.scss";
import type { BusinessCategory } from "@/types/database";

type Props = {
    categories: BusinessCategory[];
    alreadySelected: string[];
    onSelect: (categoryIds: string[]) => void;
};

export default function CategorySelectionPanel({ categories, alreadySelected, onSelect }: Props) {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<string[]>([]);

    // Filtraggio categorie
    const filtered = useMemo(() => {
        return categories
            .filter(c => !alreadySelected.includes(c.id)) // escludi quelle già usate
            .filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }, [categories, alreadySelected, search]);

    function toggle(categoryId: string) {
        setSelected(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    }

    function handleConfirm() {
        onSelect(selected);
    }

    return (
        <div className={styles.wrapper}>
            {/* Campo ricerca */}
            <input
                className={styles.search}
                type="text"
                placeholder="Cerca categoria..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* Lista categorie */}
            <div className={styles.list}>
                {filtered.length === 0 && (
                    <Text colorVariant="muted">Nessuna categoria trovata.</Text>
                )}

                {filtered.map(cat => (
                    <label key={cat.id} className={styles.row}>
                        <input
                            type="checkbox"
                            checked={selected.includes(cat.id)}
                            onChange={() => toggle(cat.id)}
                        />
                        <Text>{cat.name}</Text>
                    </label>
                ))}
            </div>

            {/* Pulsante conferma */}
            <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={selected.length === 0}
            >
                Aggiungi categorie
            </button>
        </div>
    );
}
