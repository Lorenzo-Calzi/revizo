import styles from "@/styles/catalog-builder/builderToolbar.module.scss";

export default function BuilderToolbar({ mode, setMode }) {
    return (
        <div className={styles.toolbar}>
            <div className={styles.left}>
                <span className={styles.logo}>Revizo Builder</span>
            </div>

            <div className={styles.center}>
                <button
                    className={mode === "mobile" ? styles.active : ""}
                    onClick={() => setMode("mobile")}
                >
                    📱
                </button>

                <button
                    className={mode === "tablet" ? styles.active : ""}
                    onClick={() => setMode("tablet")}
                >
                    📟
                </button>

                <button
                    className={mode === "desktop" ? styles.active : ""}
                    onClick={() => setMode("desktop")}
                >
                    🖥
                </button>
            </div>

            <div className={styles.right}>
                <button className={styles.saveBtn}>Salva</button>
            </div>
        </div>
    );
}
