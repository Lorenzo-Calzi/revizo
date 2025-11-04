import { useState } from "react";
import { signIn } from "@services/supabase/auth";
import { Button, Input } from "@components/ui";
import styles from "./Auth.module.scss";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        try {
            await signIn(email, password);
            navigate("/dashboard");
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError("Errore sconosciuto");
        }
    }

    return (
        <div className={styles.auth}>
            <h1>Accedi</h1>
            <form onSubmit={handleLogin}>
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {error && <p className={styles.error}>{error}</p>}
                <Button label="Accedi" variant="primary" fullWidth />
            </form>
        </div>
    );
}
