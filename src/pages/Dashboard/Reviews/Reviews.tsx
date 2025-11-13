import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@context/useAuth";
import { getUserRestaurants } from "@services/supabase/restaurants";
import {
    getRestaurantReviews,
    deleteReview,
    updateReviewResponse
} from "@services/supabase/reviews";
import type { Review, Restaurant } from "@/types/database";
import styles from "./Reviews.module.scss";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import Text from "@components/ui/Text/Text";

export default function Reviews() {
    const { user } = useAuth();
    const location = useLocation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({});
    const [loadingResponse, setLoadingResponse] = useState<string | null>(null);
    const [average, setAverage] = useState<number | null>(null);
    const [chartData, setChartData] = useState<{ date: string; avg: number }[]>([]);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const preselectedRestaurantId: string | null = location.state?.restaurantId ?? null;
    const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setLoading(true);

            const rest = await getUserRestaurants(user.id);
            setRestaurants(rest);

            // 1) Se ho un ristorante pre-selezionato (da navigate state), usa quello
            // 2) Altrimenti, se ho già una selezione precedente, mantienila
            // 3) Altrimenti usa il primo disponibile
            const initialId =
                preselectedRestaurantId ||
                selectedRestaurant ||
                (rest.length > 0 ? rest[0].id : null);

            setSelectedRestaurant(initialId);

            if (initialId) {
                const data = await getRestaurantReviews(initialId);
                updateDashboard(data);
            } else {
                resetDashboard();
            }

            setLoading(false);
        }

        fetchData();
        // dipendenze: se cambia l'utente o arrivi con un nuovo preselect, ricalcola
    }, [user, preselectedRestaurantId]);

    function resetDashboard() {
        setSelectedRestaurant(null);
        setReviews([]);
        setAverage(0);
        setChartData([]);
    }

    // ✅ Carica le recensioni (usata sia manualmente che per filtro automatico)
    async function refreshReviews(restaurantId?: string | null) {
        if (!user) return;
        setLoading(true);

        const data = restaurantId ? await getRestaurantReviews(restaurantId) : [];

        setReviews(data);
        setLoading(false);

        if (data.length > 0) {
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            setAverage(parseFloat(avg.toFixed(1)));

            // raggruppa per data
            const grouped = data.reduce<Record<string, number[]>>((acc, review) => {
                const date = new Date(review.created_at).toLocaleDateString("it-IT");
                if (!acc[date]) acc[date] = [];
                acc[date].push(review.rating);
                return acc;
            }, {});

            const chartPoints = Object.entries(grouped)
                .map(([date, ratings]) => ({
                    date,
                    avg: ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setChartData(chartPoints);
        } else {
            setAverage(null);
            setChartData([]);
        }
    }

    function updateDashboard(data: Review[]) {
        setReviews(data);
        if (data.length > 0) {
            const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
            setAverage(parseFloat(avg.toFixed(1)));

            const grouped = data.reduce<Record<string, number[]>>((acc, r) => {
                const d = new Date(r.created_at).toLocaleDateString("it-IT");
                (acc[d] ||= []).push(r.rating);
                return acc;
            }, {});

            const chartPoints = Object.entries(grouped)
                .map(([date, ratings]) => ({
                    date,
                    avg: ratings.reduce((s, r) => s + r, 0) / ratings.length
                }))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            setChartData(chartPoints);
        } else {
            setAverage(0);
            setChartData([]);
        }
    }

    async function handleDelete() {
        if (!reviewToDelete) return;
        try {
            await deleteReview(reviewToDelete);
            await refreshReviews(selectedRestaurant || undefined);
            setShowModal(false);
            setReviewToDelete(null);
        } catch (err) {
            console.error("Errore eliminazione recensione:", err);
        }
    }

    async function handleResponseSubmit(reviewId: string) {
        const text = responseText[reviewId];
        if (!text) return;
        try {
            setLoadingResponse(reviewId);
            await updateReviewResponse(reviewId, text);
            await refreshReviews(selectedRestaurant || undefined);
            setResponseText(prev => ({ ...prev, [reviewId]: "" }));
        } catch (err) {
            console.error("Errore risposta:", err);
        } finally {
            setLoadingResponse(null);
        }
    }

    // 🔹 Filtri applicati
    const filteredReviews = useMemo(
        () =>
            reviews.filter(r => {
                const matchRating = filterRating ? r.rating === filterRating : true;
                const matchDate = filterDate
                    ? new Date(r.created_at).toLocaleDateString("it-IT") === filterDate
                    : true;
                return matchRating && matchDate;
            }),
        [reviews, filterRating, filterDate]
    );

    // ✅ Cambio manuale dal menu a tendina
    async function handleRestaurantChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const id = e.target.value || null;
        setSelectedRestaurant(id);
        await refreshReviews(id);
    }

    return (
        <div className={styles.reviews}>
            <header className={styles.header}>
                <div className={styles.selectRestaurant}>
                    <Text as="label" variant="body">
                        Ristorante:
                    </Text>
                    <div className={styles.filter}>
                        <select
                            id="restaurant-select"
                            value={selectedRestaurant ?? ""}
                            onChange={handleRestaurantChange}
                        >
                            <option value="">Tutti i locali</option>
                            {restaurants.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statBox}>
                        <Text variant="title-sm">⭐ {average}</Text>
                        <Text variant="caption" colorVariant="muted">
                            Valutazione media
                        </Text>
                    </div>
                    <div className={styles.statBox}>
                        <Text variant="title-sm">{reviews.length}</Text>
                        <Text variant="caption" colorVariant="muted">
                            Totale recensioni
                        </Text>
                    </div>
                </div>
            </header>

            {loading ? (
                <Text variant="body" align="center" colorVariant="muted">
                    Caricamento recensioni...
                </Text>
            ) : (
                <>
                    {/* Grafico */}
                    <section className={styles.chart} aria-label="Andamento recensioni">
                        <Text variant="title-md" align="center">
                            Andamento delle recensioni
                        </Text>
                        {chartData.length === 0 ? (
                            <Text variant="body" align="center" colorVariant="muted">
                                Nessun dato disponibile per il grafico.
                            </Text>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#fff",
                                            borderRadius: "8px"
                                        }}
                                        labelStyle={{ fontWeight: 600 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="avg"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </section>

                    {/* Filtri */}
                    <section className={styles.filters} aria-label="Filtri recensioni">
                        <div>
                            <Text as="label" variant="body" colorVariant="muted">
                                Filtra per voto:
                            </Text>
                            <select
                                onChange={e =>
                                    setFilterRating(e.target.value ? Number(e.target.value) : null)
                                }
                            >
                                <option value="">Tutti</option>
                                {[5, 4, 3, 2, 1].map(r => (
                                    <option key={r} value={r}>
                                        {r} ⭐
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Text as="label" variant="body" colorVariant="muted">
                                Filtra per data:
                            </Text>
                            <input
                                type="date"
                                onChange={e =>
                                    setFilterDate(
                                        e.target.value
                                            ? new Date(e.target.value).toLocaleDateString("it-IT")
                                            : null
                                    )
                                }
                            />
                        </div>
                    </section>

                    {/* Lista recensioni */}
                    <section className={styles.list} aria-label="Lista recensioni">
                        {filteredReviews.map(review => (
                            <article key={review.id} className={styles.review}>
                                <div className={styles.headerRow}>
                                    <Text
                                        variant="title-sm"
                                        colorVariant={review.rating >= 4 ? "success" : "error"}
                                    >
                                        ⭐ {review.rating}
                                    </Text>
                                    <Text variant="caption" colorVariant="muted">
                                        {new Date(review.created_at).toLocaleDateString("it-IT")}
                                    </Text>

                                    <Text
                                        variant="caption"
                                        className={`${styles.badge} ${
                                            review.source === "public"
                                                ? styles.public
                                                : styles.verified
                                        }`}
                                    >
                                        {review.source === "public" ? "Pubblica" : "Verificata"}
                                    </Text>
                                </div>

                                <Text variant="body">
                                    {review.comment || (
                                        <span className={styles.noComment}>Nessun commento</span>
                                    )}
                                </Text>

                                {/* Risposta gestore */}
                                {review.response ? (
                                    <div className={styles.responseBox}>
                                        <Text variant="body">{review.response}</Text>
                                        <Text variant="caption" colorVariant="muted">
                                            Risposta del{" "}
                                            {new Date(
                                                review.response_date || ""
                                            ).toLocaleDateString("it-IT")}
                                        </Text>
                                    </div>
                                ) : (
                                    <form
                                        className={styles.responseForm}
                                        onSubmit={e => {
                                            e.preventDefault();
                                            handleResponseSubmit(review.id);
                                        }}
                                    >
                                        <textarea
                                            placeholder="Scrivi una risposta..."
                                            value={responseText[review.id] || ""}
                                            onChange={e =>
                                                setResponseText({
                                                    ...responseText,
                                                    [review.id]: e.target.value
                                                })
                                            }
                                        />
                                        <button
                                            type="submit"
                                            disabled={loadingResponse === review.id}
                                            aria-busy={loadingResponse === review.id}
                                        >
                                            {loadingResponse === review.id
                                                ? "Invio..."
                                                : "Rispondi"}
                                        </button>

                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => {
                                                setShowModal(true);
                                                setReviewToDelete(review.id);
                                            }}
                                        >
                                            Elimina
                                        </button>
                                    </form>
                                )}
                            </article>
                        ))}
                    </section>
                </>
            )}

            {/* Modale di conferma */}
            {showModal && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <Text variant="body">Sei sicuro di voler eliminare questa recensione?</Text>
                        <div className={styles.modalActions}>
                            <button onClick={handleDelete} className={styles.confirm}>
                                Elimina
                            </button>
                            <button onClick={() => setShowModal(false)} className={styles.cancel}>
                                Annulla
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
