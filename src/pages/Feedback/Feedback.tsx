import { useEffect, useState } from "react";
import { DashboardLayout } from "@layouts/DashboardLayout/DashboardLayout";
import { Card } from "@components/ui";
import { supabase } from "@services/supabase/client";
import type { Feedback } from "../../types/database";
import styles from "./Feedback.module.scss";

export default function Feedback() {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    async function fetchFeedback() {
        setLoading(true);
        const { data, error } = await supabase
            .from("feedback")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) console.error("Errore nel recupero feedback:", error.message);
        else setFeedback(data || []);
        setLoading(false);
    }

    return (
        <DashboardLayout>
            <header className={styles.header}>
                <h1>Feedback reali</h1>
                <p>Dati letti direttamente da Supabase.</p>
            </header>

            {loading ? (
                <p>Caricamento...</p>
            ) : (
                <Card>
                    {feedback.length === 0 ? (
                        <p>Nessun feedback trovato.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Commento</th>
                                    <th>Punteggio</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedback.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.customer_name}</td>
                                        <td>{item.comment}</td>
                                        <td>{item.rating} ⭐</td>
                                        <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            )}
        </DashboardLayout>
    );
}
