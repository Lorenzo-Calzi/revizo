import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./PublicReview.module.scss";
import { createClient } from "@supabase/supabase-js";

const publicClient = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: "" } }
    }
);

export default function PublicReview() {
    const { slug } = useParams();
    const [restaurant, setRestaurant] = useState<{ id: string; name: string } | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🔹 Recupera ristorante dal DB
    useEffect(() => {
        async function fetchRestaurant() {
            const { data, error } = await publicClient
                .from("restaurants")
                .select("id, name")
                .eq("slug", slug)
                .single();

            if (error || !data) setError("Ristorante non trovato");
            else setRestaurant(data);
        }

        fetchRestaurant();
    }, [slug]);

    // 🔹 Invia recensione a Supabase
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!restaurant) return;

        setSubmitting(true);
        const { error } = await publicClient
            .from("reviews")
            .insert([{ restaurant_id: restaurant.id, rating, comment, source: "public" }]);
        setSubmitting(false);

        if (error) {
            console.error("Errore invio recensione:", error.message);
            setError("Errore durante l'invio: " + (error.message || "Riprova più tardi."));
        } else {
            setSubmitted(true);
        }
    }

    // =======================
    // UI rendering
    // =======================
    if (error) {
        return (
            <div className={styles.container}>
                <p className={styles.error}>{error}</p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className={styles.container}>
                <p className={styles.loading}>Caricamento...</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className={styles.container}>
                <h2>Grazie per la tua recensione! 🙏</h2>
                <p>
                    La tua opinione aiuta <strong>{restaurant.name}</strong> a migliorare ogni
                    giorno.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>{restaurant.name}</h1>
            <p className={styles.subtitle}>Lascia la tua recensione</p>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.ratingGroup}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <span
                            key={star}
                            onClick={() => setRating(star)}
                            className={`${styles.star} ${rating >= star ? styles.active : ""}`}
                            role="button"
                            aria-label={`${star} stelle`}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    placeholder="Lascia un commento (facoltativo)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={4}
                />

                <button type="submit" disabled={rating === 0 || submitting}>
                    {submitting ? "Invio in corso..." : "Invia recensione"}
                </button>
            </form>
        </div>
    );
}
