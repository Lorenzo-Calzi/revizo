import { useEffect, useState } from "react";
import { useAuth } from "@context/useAuth";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import {
    getUserRestaurants,
    addRestaurant,
    deleteRestaurant,
    updateRestaurant
} from "@services/supabase/restaurants";
import type { Restaurant } from "@/types/database";
import Text from "@components/ui/Text/Text";
import styles from "./Restaurants.module.scss";

export default function Restaurants() {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Restaurant>>({});
    const navigate = useNavigate();

    async function refreshRestaurants() {
        if (!user) return;
        const data = await getUserRestaurants(user.id);
        setRestaurants(data);
    }

    useEffect(() => {
        refreshRestaurants();
    }, [user]);

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            await addRestaurant(user.id, name, city, slug);
            setName("");
            setCity("");
            setSlug("");
            await refreshRestaurants();
        } catch (e) {
            console.error("Errore aggiunta locale:", e);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Eliminare questo locale?")) return;
        try {
            await deleteRestaurant(id);
            await refreshRestaurants();
        } catch (e) {
            console.error("Errore eliminazione locale:", e);
        }
    }

    function handleEditClick(restaurant: Restaurant) {
        setEditingId(restaurant.id);
        setEditData(restaurant);
    }

    async function handleSaveEdit(id: string) {
        try {
            await updateRestaurant(id, {
                name: editData.name || "",
                city: editData.city || "",
                slug: editData.slug || ""
            });
            setEditingId(null);
            await refreshRestaurants();
        } catch (e) {
            console.error("Errore aggiornamento locale:", e);
        }
    }

    return (
        <section className={styles.restaurants}>
            <Text variant="title-md">I tuoi locali</Text>

            <form onSubmit={handleAdd} className={styles.addForm} aria-label="Aggiungi locale">
                <input
                    type="text"
                    placeholder="Nome locale"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Città"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Slug (es. da-mario)"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Aggiunta..." : "Aggiungi locale"}
                </button>
            </form>

            {restaurants.length === 0 ? (
                <Text variant="body" align="center" colorVariant="muted">
                    Nessun locale aggiunto.
                </Text>
            ) : (
                <ul className={styles.list} role="list">
                    {restaurants.map(r => {
                        const publicUrl = `${window.location.origin}/r/${r.slug}`;
                        const isEditing = editingId === r.id;

                        return (
                            <li key={r.id} className={styles.item}>
                                <div className={styles.info}>
                                    {isEditing ? (
                                        <>
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
                                            <input
                                                type="text"
                                                value={editData.slug || ""}
                                                onChange={e =>
                                                    setEditData(prev => ({
                                                        ...prev,
                                                        slug: e.target.value
                                                    }))
                                                }
                                                placeholder="Slug"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Text variant="title-sm">{r.name}</Text>
                                            <Text variant="body" colorVariant="muted">
                                                {r.city || "N/D"}
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
                                        id={`qr-${r.id}`}
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
                                                <button onClick={() => handleSaveEdit(r.id)}>
                                                    Salva
                                                </button>
                                                <button onClick={() => setEditingId(null)}>
                                                    Annulla
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(r)}>
                                                    Modifica
                                                </button>
                                                <button onClick={() => handleDelete(r.id)}>
                                                    Elimina
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        navigate("/dashboard/reviews", {
                                                            state: { restaurantId: r.id }
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
