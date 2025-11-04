import { useEffect, useState } from "react";
import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { useAuth } from "@context/useAuth";
import { QRCodeCanvas } from "qrcode.react";
import {
    getUserRestaurants,
    addRestaurant,
    deleteRestaurant
} from "@services/supabase/restaurants";
import type { Restaurant } from "@/types/database";
import styles from "./Restaurants.module.scss";

export default function Restaurants() {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [slug, setSlug] = useState("");

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
        try {
            await addRestaurant(user.id, name, city, slug);
            setName("");
            setCity("");
            setSlug("");
            await refreshRestaurants();
        } catch (e) {
            console.error("Errore aggiunta locale:", e);
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteRestaurant(id);
            await refreshRestaurants();
        } catch (e) {
            console.error("Errore eliminazione locale:", e);
        }
    }

    return (
        <DashboardLayout>
            <div className={styles.restaurants}>
                <h1>I tuoi locali</h1>

                <form onSubmit={handleAdd} className={styles.addForm}>
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
                    <button type="submit">Aggiungi locale</button>
                </form>

                <ul className={styles.list}>
                    {restaurants.map(r => {
                        const publicUrl = `${window.location.origin}/r/${r.slug}`;

                        function handleDownloadQR() {
                            const canvas = document.getElementById(
                                `qr-${r.id}`
                            ) as HTMLCanvasElement;
                            const link = document.createElement("a");
                            link.download = `${r.slug}-qr.png`;
                            link.href = canvas.toDataURL("image/png");
                            link.click();
                        }

                        return (
                            <li key={r.id}>
                                <div className={styles.info}>
                                    <strong>{r.name}</strong> – {r.city || "N/D"}
                                    <a
                                        href={publicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.slug}
                                    >
                                        {publicUrl}
                                    </a>
                                </div>

                                <div className={styles.actions}>
                                    <QRCodeCanvas
                                        id={`qr-${r.id}`}
                                        value={publicUrl}
                                        size={80}
                                        bgColor="#ffffff"
                                        fgColor="#230089"
                                        level="M"
                                        includeMargin={true}
                                    />
                                    <button onClick={handleDownloadQR}>Scarica QR</button>
                                    <button onClick={() => handleDelete(r.id)}>Elimina</button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </DashboardLayout>
    );
}
