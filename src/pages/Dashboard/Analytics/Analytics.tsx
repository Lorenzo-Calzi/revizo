import { useEffect, useState, useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { getAnalyticsReviews } from "@services/supabase/reviews";
import { useAuth } from "@context/useAuth";
import Text from "@components/ui/Text/Text";
import Skeleton from "@components/ui/Skeleton/Skeleton";
import type { AnalyticsReview } from "@services/supabase/reviews";
import styles from "./Analytics.module.scss";

type Range = 7 | 30 | 90;
const COLORS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6"];

export default function Analytics() {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<AnalyticsReview[]>([]);
    const [range, setRange] = useState<Range>(30);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        setIsLoading(true);
        getAnalyticsReviews().then(data => {
            setReviews(data);
            setIsLoading(false);
        });
    }, [user?.id]);

    // Filtra per periodo
    const filtered = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - range);
        return reviews.filter(r => new Date(r.created_at) >= cutoff);
    }, [reviews, range]);

    const total = filtered.length;
    const avgRating = filtered.length
        ? filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length
        : 0;
    const positive = filtered.filter(r => r.rating >= 4).length;
    const negative = filtered.filter(r => r.rating <= 3).length;

    const ratingDist = [1, 2, 3, 4, 5].map(stars => ({
        name: `${stars} ⭐`,
        value: filtered.filter(r => r.rating === stars).length
    }));

    const sourceDist = ["google", "internal"].map(src => ({
        name: src === "google" ? "Google" : "Interna",
        value: filtered.filter(r => r.source === src).length
    }));

    const barData = useMemo(() => {
        const map = new Map<string, number>();
        filtered.forEach(r => {
            const date = new Date(r.created_at).toLocaleDateString("it-IT");
            map.set(date, (map.get(date) || 0) + 1);
        });
        return Array.from(map.entries()).map(([date, count]) => ({
            name: date,
            recensioni: count
        }));
    }, [filtered]);

    // 🔹 Stato caricamento — skeleton realistici
    if (isLoading) {
        return (
            <div className={styles.analytics} aria-busy="true" aria-live="polite">
                <div className={styles.kpiGrid} aria-busy="true" aria-live="polite">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} height="90px" radius="12px" />
                    ))}
                </div>
                <div className={styles.chartsGrid}>
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} height="280px" radius="12px" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <main className={styles.analytics} aria-label="Sezione analytics recensioni">
            <header className={styles.header}>
                <div className={styles.rangeSelector}>
                    {[7, 30, 90].map(days => (
                        <button
                            key={days}
                            className={`${styles.rangeBtn} ${range === days ? styles.active : ""}`}
                            onClick={() => setRange(days as Range)}
                            aria-pressed={range === days}
                        >
                            <Text
                                as="span"
                                variant="caption"
                                colorVariant={range === days ? "white" : "default"}
                            >
                                Ultimi {days} giorni
                            </Text>
                        </button>
                    ))}
                </div>
            </header>

            {/* KPI */}
            <section className={styles.kpiGrid} role="group" aria-label="Statistiche principali">
                <KPI label="Recensioni totali" value={total.toString()} />
                <KPI label="Valutazione media" value={avgRating.toFixed(1)} highlight />
                <KPI label="Positive" value={positive.toString()} color="success" />
                <KPI label="Negative" value={negative.toString()} color="error" />
            </section>

            {/* GRAFICI */}
            <section className={styles.chartsGrid} aria-label="Grafici di distribuzione e trend">
                <ChartCard title="Distribuzione per punteggio">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={ratingDist}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={90}
                                label
                            >
                                {ratingDist.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Distribuzione per fonte">
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={sourceDist}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                label
                            >
                                <Cell fill="#2563eb" />
                                <Cell fill="#10b981" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Andamento recensioni nel periodo">
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="recensioni" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </section>
        </main>
    );
}

// 🔸 COMPONENTI DI SUPPORTO
function KPI({
    label,
    value,
    color,
    highlight = false
}: {
    label: string;
    value: string;
    color?: "success" | "error";
    highlight?: boolean;
}) {
    const colorClass = color === "success" ? styles.success : color === "error" ? styles.error : "";
    return (
        <div className={`${styles.kpiCard} ${colorClass}`} role="group">
            <Text variant="caption" colorVariant="muted">
                {label}
            </Text>
            <Text
                variant={highlight ? "title-lg" : "title-md"}
                weight={600}
                colorVariant={
                    color === "success" ? "success" : color === "error" ? "error" : "default"
                }
            >
                {value}
            </Text>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className={styles.chartCard}>
            <Text variant="title-sm" align="center">
                {title}
            </Text>
            {children}
        </div>
    );
}
