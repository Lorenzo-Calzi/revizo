import { useState } from "react";
import styles from "@/styles/catalog-builder/builderSidebar.module.scss";

export default function BuilderSidebar() {
    const [tab, setTab] = useState<"content" | "style" | "catalog">("content");

    return (
        <div className={styles.sidebar}>
            <div className={styles.tabs}>
                <button
                    className={tab === "content" ? styles.active : ""}
                    onClick={() => setTab("content")}
                >
                    Contenuto
                </button>

                <button
                    className={tab === "style" ? styles.active : ""}
                    onClick={() => setTab("style")}
                >
                    Stile
                </button>

                <button
                    className={tab === "catalog" ? styles.active : ""}
                    onClick={() => setTab("catalog")}
                >
                    Catalogo
                </button>
            </div>

            <div className={styles.panel}>
                {tab === "content" && <p>Impostazioni contenuto…</p>}
                {tab === "style" && <p>Impostazioni stile…</p>}
                {tab === "catalog" && <p>Gestione catalogo…</p>}
            </div>
        </div>
    );
}
