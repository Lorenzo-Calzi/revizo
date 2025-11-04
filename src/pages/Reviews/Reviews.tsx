import { useEffect, useState } from "react";
import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { useAuth } from "@context/useAuth";
import { getUserRestaurants } from "@services/supabase/restaurants";
import {
    getUserReviews,
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

export default function Reviews() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({});
    const [loadingResponse, setLoadingResponse] = useState<string | null>(null);
    const [average, setAverage] = useState<number>(0);
    const [chartData, setChartData] = useState<{ date: string; avg: number }[]>([]);
    const [filterRating, setFilterRating] = useState<number | null>(null);
    const [filterDate, setFilterDate] = useState<string | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            if (!user) return;
            setLoading(true);

            // 1️⃣ Carica tutti i ristoranti dell'utente
            const rest = await getUserRestaurants(user.id);
            setRestaurants(rest);

            // 2️⃣ Se l'utente ha almeno un locale, seleziona il primo
            if (rest.length > 0) {
                const firstRestaurantId = rest[0].id;
                setSelectedRestaurant(firstRestaurantId);

                // 3️⃣ Carica le recensioni relative al primo locale
                const data = firstRestaurantId
                    ? await getRestaurantReviews(firstRestaurantId)
                    : await getUserReviews(user.id);

                setReviews(data);

                if (data.length > 0) {
                    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
                    setAverage(parseFloat(avg.toFixed(1)));

                    // Raggruppa recensioni per giorno
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
                    setAverage(0);
                    setChartData([]);
                }
            } else {
                // Nessun ristorante → reset dashboard
                setSelectedRestaurant(null);
                setReviews([]);
                setAverage(0);
                setChartData([]);
            }
            setLoading(false);
        }

        fetchData();
    }, [user]);

    async function refreshReviews(restaurantId?: string) {
        if (!user) return;
        const data = restaurantId
            ? await getRestaurantReviews(restaurantId)
            : await getUserReviews(user.id);

        setReviews(data);

        if (data.length > 0) {
            const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
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
        if (!reviewToDelete || !user) return;
        try {
            await deleteReview(reviewToDelete);
            await refreshReviews();
            setReviews(prev => prev.filter(r => r.id !== reviewToDelete));
            setShowModal(false);
            setReviewToDelete(null);
        } catch (err) {
            console.error("Errore eliminazione recensione:", err);
        }
    }

    const filteredReviews = reviews.filter(r => {
        const matchRating = filterRating ? r.rating === filterRating : true;
        const matchDate = filterDate
            ? new Date(r.created_at).toLocaleDateString("it-IT") === filterDate
            : true;
        return matchRating && matchDate;
    });

    async function handleResponseSubmit(reviewId: string) {
        if (!responseText[reviewId]) return;
        try {
            setLoadingResponse(reviewId);
            await updateReviewResponse(reviewId, responseText[reviewId]);
            await refreshReviews();
            setReviews(prev =>
                prev.map(r =>
                    r.id === reviewId
                        ? {
                              ...r,
                              response: responseText[reviewId],
                              response_date: new Date().toISOString()
                          }
                        : r
                )
            );
            setResponseText(prev => ({ ...prev, [reviewId]: "" }));
        } catch (err) {
            console.error("Errore durante l'invio risposta:", err);
        } finally {
            setLoadingResponse(null);
        }
    }

    return (
        <DashboardLayout>
            <div className={styles.reviews}>
                <header className={styles.header}>
                    <h1>Le tue recensioni</h1>

                    <div className={styles.selectRestaurant}>
                        <label htmlFor="restaurant">Ristorante:</label>
                        <select
                            id="restaurant"
                            value={selectedRestaurant || ""}
                            onChange={async e => {
                                const id = e.target.value;
                                setSelectedRestaurant(id);
                                if (user && id) {
                                    await refreshReviews(id);
                                }
                            }}
                        >
                            {restaurants.length === 0 ? (
                                <option value="">Nessun locale</option>
                            ) : (
                                restaurants.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} {r.city ? `(${r.city})` : ""}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className={styles.stats}>
                        <span className={styles.statBox}>
                            ⭐ <strong>{average}</strong> / 5<p>Valutazione media</p>
                        </span>
                        <span className={styles.statBox}>
                            💬 <strong>{reviews.length}</strong>
                            <p>Totale recensioni</p>
                        </span>
                    </div>
                </header>

                {/* Form di inserimento recensione */}
                {/* <section className={styles.addReview}>
                    <h2>Aggiungi una recensione</h2>
                    <form
                        onSubmit={async e => {
                            e.preventDefault();
                            if (!user) return;
                            setSubmitting(true);
                            try {
                                await addReview(user.id, newRating, newComment);
                                await refreshReviews();
                                setNewComment("");
                                setNewRating(5);
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        <label htmlFor="rating">Valutazione:</label>
                        <select
                            id="rating"
                            value={newRating}
                            onChange={e => setNewRating(Number(e.target.value))}
                            required
                        >
                            <option value={5}>⭐️⭐️⭐️⭐️⭐️ - Eccellente</option>
                            <option value={4}>⭐️⭐️⭐️⭐️ - Buono</option>
                            <option value={3}>⭐️⭐️⭐️ - Nella media</option>
                            <option value={2}>⭐️⭐️ - Scarso</option>
                            <option value={1}>⭐️ - Pessimo</option>
                        </select>

                        <label htmlFor="comment">Commento:</label>
                        <textarea
                            id="comment"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Scrivi qui il tuo commento..."
                            rows={3}
                            required
                        />

                        <button type="submit" disabled={submitting}>
                            {submitting ? "Invio in corso..." : "Aggiungi recensione"}
                        </button>
                    </form>
                </section> */}

                {loading ? (
                    <p className={styles.loading}>Caricamento recensioni...</p>
                ) : (
                    <>
                        {/* Grafico */}
                        <section className={styles.chart}>
                            <h2>Andamento delle recensioni</h2>
                            {chartData.length === 0 ? (
                                <p className={styles.empty}>
                                    Nessun dato disponibile per il grafico.
                                </p>
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
                                            stroke="#230089"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </section>

                        {/* Filtri */}
                        <section className={styles.filters}>
                            <div>
                                <label>Filtra per voto:</label>
                                <select
                                    onChange={e =>
                                        setFilterRating(
                                            e.target.value ? Number(e.target.value) : null
                                        )
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
                                <label>Filtra per data:</label>
                                <input
                                    type="date"
                                    onChange={e =>
                                        setFilterDate(
                                            e.target.value
                                                ? new Date(e.target.value).toLocaleDateString(
                                                      "it-IT"
                                                  )
                                                : null
                                        )
                                    }
                                />
                            </div>
                        </section>

                        {/* Lista recensioni */}
                        <section className={styles.list}>
                            {filteredReviews.map(review => (
                                <div key={review.id} className={styles.review}>
                                    <div className={styles.rating}>⭐ {review.rating}</div>
                                    <p className={styles.comment}>{review.comment}</p>
                                    <span
                                        className={`${styles.badge} ${
                                            review.source === "public"
                                                ? styles.public
                                                : styles.verified
                                        }`}
                                    >
                                        {review.source === "public" ? "Pubblica" : "Verificata"}
                                    </span>

                                    {/* Risposta del gestore */}
                                    {review.response ? (
                                        <div className={styles.responseBox}>
                                            <p className={styles.responseText}>{review.response}</p>
                                            <span className={styles.responseDate}>
                                                Risposta del{" "}
                                                {new Date(
                                                    review.response_date || ""
                                                ).toLocaleDateString("it-IT")}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className={styles.responseForm}>
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
                                                onClick={() => handleResponseSubmit(review.id)}
                                                disabled={loadingResponse === review.id}
                                            >
                                                {loadingResponse === review.id
                                                    ? "Invio..."
                                                    : "Rispondi"}
                                            </button>
                                        </div>
                                    )}

                                    <div className={styles.footer}>
                                        <span className={styles.date}>
                                            {new Date(review.created_at).toLocaleDateString(
                                                "it-IT"
                                            )}
                                        </span>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => {
                                                setShowModal(true);
                                                setReviewToDelete(review.id);
                                            }}
                                        >
                                            🗑️ Elimina
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                )}

                {/* Modale di conferma */}
                {showModal && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <p>Sei sicuro di voler eliminare questa recensione?</p>
                            <div className={styles.modalActions}>
                                <button onClick={handleDelete} className={styles.confirm}>
                                    Elimina
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className={styles.cancel}
                                >
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
