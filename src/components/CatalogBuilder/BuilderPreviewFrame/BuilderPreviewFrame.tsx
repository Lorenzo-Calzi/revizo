import styles from "@/styles/catalog-builder/builderPreviewFrame.module.scss";

export default function BuilderPreviewFrame({ mode }) {
    const width = mode === "mobile" ? 390 : mode === "tablet" ? 768 : 1280;

    return (
        <div className={styles.previewWrap}>
            <div className={styles.preview} style={{ width }}>
                {/* Qui dentro renderizzi la PublicCatalogPage */}
                <div className={styles.placeholder}>
                    Preview Catalogo (qui andrà la public page)
                </div>
            </div>
        </div>
    );
}
