import { Smartphone, Tablet, Laptop } from "lucide-react";
import styles from "./BuilderToolbar.module.scss";

interface BuilderToolbarProps {
    mode: "mobile" | "tablet" | "desktop";
    tab: "style" | "content";
    setMode: React.Dispatch<React.SetStateAction<"mobile" | "tablet" | "desktop">>;
    onSave: () => Promise<void>;
    saving: boolean;
    isDirty: boolean;
}

export default function BuilderToolbar({
    mode,
    tab,
    setMode,
    onSave,
    saving,
    isDirty
}: BuilderToolbarProps) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <span className={styles.logo}>Revizo Builder</span>
            </div>

            {tab === "style" && (
                <div className={styles.center}>
                    <button
                        className={mode === "mobile" ? styles.active : ""}
                        onClick={() => setMode("mobile")}
                    >
                        <Smartphone strokeWidth={1} />
                    </button>

                    <button
                        className={mode === "tablet" ? styles.active : ""}
                        onClick={() => setMode("tablet")}
                    >
                        <Tablet strokeWidth={1} />
                    </button>

                    <button
                        className={mode === "desktop" ? styles.active : ""}
                        onClick={() => setMode("desktop")}
                    >
                        <Laptop size={30} strokeWidth={1} />
                    </button>
                </div>
            )}

            <div className={styles.right}>
                <button className={styles.saveBtn} onClick={onSave} disabled={saving || !isDirty}>
                    {saving ? "Salvataggio..." : "Salva"}
                </button>
            </div>
        </div>
    );
}
