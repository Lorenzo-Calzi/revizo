import { useEffect, useState } from "react";
import { useAuth } from "@context/useAuth";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
    getUserBusinesses,
    addBusiness,
    deleteBusiness,
    updateBusiness
} from "@services/supabase/businesses";
import type { Business } from "@/types/database";
import Text from "@components/ui/Text/Text";
import styles from "./Businesses.module.scss";

// Utility per generare uno slug pulito
function generateSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-") // spazi e underscore -> trattino
        .replace(/[^a-z0-9-]/g, "") // solo lettere, numeri e trattini
        .replace(/--+/g, "-") // niente doppie lineette
        .replace(/^-+/, "") // rimuove trattini iniziali
        .replace(/-+$/, ""); // rimuove trattini finali
}

export default function Businesses() {
    const { user } = useAuth();
    const [businesses, setBusinesses] = useState<Business[]>([]);

    // form add
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [slug, setSlug] = useState("");
    const [type, setType] = useState<Business["type"]>("restaurant");

    const [loading, setLoading] = useState(false);

    // edit
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Business>>({});

    const navigate = useNavigate();

    async function refreshBusinesses() {
        if (!user) return;
        const data = await getUserBusinesses(user.id);
        setBusinesses(data);
    }

    useEffect(() => {
        refreshBusinesses();
    }, [user]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        const cleanedSlug = generateSlug(slug || name);

        if (!cleanedSlug) {
            alert("Inserisci un nome o uno slug valido per il business.");
            return;
        }

        // Controllo unicità slug tra i business dell'utente
        const slugAlreadyUsed = businesses.some(b => b.slug === cleanedSlug);
        if (slugAlreadyUsed) {
            alert("Questo slug è già in uso per un altro business. Scegline un altro.");
            return;
        }

        setLoading(true);
        try {
            await addBusiness(user.id, name, city, address, cleanedSlug, type);
            setName("");
            setCity("");
            setAddress("");
            setSlug("");
            setType("restaurant");
            await refreshBusinesses();
        } catch (e) {
            console.error("Errore aggiunta business:", e);
            alert("Si è verificato un errore durante la creazione del business.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Eliminare questo business?")) return;
        try {
            await deleteBusiness(id);
            await refreshBusinesses();
        } catch (e) {
            console.error("Errore eliminazione business:", e);
            alert("Si è verificato un errore durante l'eliminazione del business.");
        }
    }

    function handleEditClick(business: Business) {
        setEditingId(business.id);
        setEditData(business);
    }

    async function handleSaveEdit(id: string) {
        const cleanedSlug = generateSlug(editData.slug || "");

        if (!cleanedSlug) {
            alert("Inserisci uno slug valido per il business.");
            return;
        }

        // Controllo unicità slug tra i business dell'utente (escludendo quello corrente)
        const slugAlreadyUsed = businesses.some(b => b.id !== id && b.slug === cleanedSlug);
        if (slugAlreadyUsed) {
            alert("Questo slug è già in uso per un altro business. Scegline un altro.");
            return;
        }

        try {
            await updateBusiness(id, {
                name: editData.name || "",
                city: editData.city || "",
                address: editData.address || "",
                slug: cleanedSlug,
                type: editData.type || "restaurant"
            });
            setEditingId(null);
            await refreshBusinesses();
        } catch (e) {
            console.error("Errore aggiornamento business:", e);
            alert("Si è verificato un errore durante l'aggiornamento del business.");
        }
    }

    const previewBaseUrl = window.location.origin;

    return (
        <section className={styles.businesses}>
            <header className={styles.header}>
                <Text variant="title-md">Le tue attività</Text>
                <Text variant="body" colorVariant="muted">
                    Gestisci le tue attività e genera il QR del sito pubblico.
                </Text>
            </header>

            {/* FORM AGGIUNTA */}
            <form onSubmit={handleAdd} className={styles.addForm} aria-label="Aggiungi business">
                <div className={styles.fieldGroup}>
                    <div className={styles.field}>
                        <label className={styles.label}>
                            Nome dell'attività
                            <input
                                type="text"
                                placeholder="Es. Snoopy Bar"
                                value={name}
                                onChange={e => {
                                    const value = e.target.value;
                                    setName(value);
                                }}
                                required
                            />
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Città
                            <input
                                type="text"
                                placeholder="Es. Milano"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Indirizzo
                            <input
                                type="text"
                                placeholder="Es. Via Roma 10"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </label>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Slug
                            <input
                                type="text"
                                placeholder="es. snoopy-bar"
                                value={slug}
                                onChange={e => setSlug(generateSlug(e.target.value))}
                                required
                            />
                        </label>
                        <Text variant="caption" colorVariant="muted">
                            URL finale:{" "}
                            <code>
                                {previewBaseUrl}/business/{slug || "<slug>"}
                            </code>
                        </Text>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>
                            Tipo di attività
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as Business["type"])}
                                required
                            >
                                <option value="restaurant">Ristorante</option>
                                <option value="bar">Bar</option>
                                <option value="hotel">Hotel</option>
                                <option value="hairdresser">Parrucchiere</option>
                                <option value="beauty">Centro estetico</option>
                                <option value="shop">Negozio</option>
                                <option value="other">Altro</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className={styles.actionsRow}>
                    <button type="submit" disabled={loading} className={styles.primaryButton}>
                        {loading ? "Aggiunta..." : "Aggiungi"}
                    </button>
                </div>
            </form>

            <hr className={styles.divider} />

            {/* LISTA BUSINESS */}
            {businesses.length === 0 ? (
                <Text variant="body" align="center" colorVariant="muted">
                    Nessun business aggiunto.
                </Text>
            ) : (
                <ul className={styles.list} role="list">
                    {businesses.map(b => {
                        const publicUrl = `${previewBaseUrl}/business/${b.slug}`;
                        const isEditing = editingId === b.id;

                        return (
                            <li key={b.id} className={styles.item}>
                                <div className={styles.info}>
                                    {isEditing ? (
                                        <>
                                            <div className={styles.fieldInline}>
                                                <label className={styles.label}>
                                                    Nome
                                                    <input
                                                        type="text"
                                                        value={editData.name || ""}
                                                        onChange={e =>
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                name: e.target.value
                                                            }))
                                                        }
                                                        placeholder="Nome"
                                                    />
                                                </label>
                                            </div>

                                            <div className={styles.fieldInline}>
                                                <label className={styles.label}>
                                                    Città
                                                    <input
                                                        type="text"
                                                        value={editData.city || ""}
                                                        onChange={e =>
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                city: e.target.value
                                                            }))
                                                        }
                                                        placeholder="Città"
                                                    />
                                                </label>
                                            </div>

                                            <div className={styles.fieldInline}>
                                                <label className={styles.label}>
                                                    Indirizzo
                                                    <input
                                                        type="text"
                                                        value={editData.address || ""}
                                                        onChange={e =>
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                address: e.target.value
                                                            }))
                                                        }
                                                        placeholder="Indirizzo"
                                                    />
                                                </label>
                                            </div>

                                            <div className={styles.fieldInline}>
                                                <label className={styles.label}>
                                                    Tipo
                                                    <select
                                                        value={editData.type || "restaurant"}
                                                        onChange={e =>
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                type: e.target
                                                                    .value as Business["type"]
                                                            }))
                                                        }
                                                    >
                                                        <option value="restaurant">
                                                            Ristorante
                                                        </option>
                                                        <option value="bar">Bar</option>
                                                        <option value="hotel">Hotel</option>
                                                        <option value="hairdresser">
                                                            Parrucchiere
                                                        </option>
                                                        <option value="beauty">
                                                            Centro estetico
                                                        </option>
                                                        <option value="shop">Negozio</option>
                                                        <option value="other">Altro</option>
                                                    </select>
                                                </label>
                                            </div>

                                            <div className={styles.fieldInline}>
                                                <label className={styles.label}>
                                                    Slug
                                                    <input
                                                        type="text"
                                                        value={editData.slug || ""}
                                                        onChange={e =>
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                slug: generateSlug(e.target.value)
                                                            }))
                                                        }
                                                        placeholder="Slug"
                                                    />
                                                </label>
                                                <Text variant="caption" colorVariant="muted">
                                                    URL:{" "}
                                                    <code>
                                                        {previewBaseUrl}/business/
                                                        {editData.slug || "<slug>"}
                                                    </code>
                                                </Text>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className={styles.titleRow}>
                                                <Text variant="title-sm">{b.name}</Text>
                                                <span className={styles.badge}>{b.type}</span>
                                            </div>

                                            <Text variant="body" colorVariant="muted">
                                                {b.address
                                                    ? `${b.address}${b.city ? `, ${b.city}` : ""}`
                                                    : b.city || "Indirizzo non specificato"}
                                            </Text>

                                            <a
                                                href={publicUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.slug}
                                            >
                                                {publicUrl}
                                            </a>
                                        </>
                                    )}
                                </div>

                                <div className={styles.actions}>
                                    <QRCodeCanvas
                                        id={`qr-${b.id}`}
                                        value={publicUrl}
                                        size={80}
                                        bgColor="#ffffff"
                                        fgColor="#2563eb"
                                        level="M"
                                        includeMargin
                                    />

                                    <div className={styles.buttons}>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveEdit(b.id)}
                                                >
                                                    Salva
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Annulla
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(b)}
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(b.id)}
                                                >
                                                    Elimina
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate("/dashboard/reviews", {
                                                            state: { businessId: b.id }
                                                        })
                                                    }
                                                >
                                                    Apri dettaglio
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
