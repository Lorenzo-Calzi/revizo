import { useState, useRef } from "react";
import styles from "./BusinessCoverUploader.module.scss";
import Text from "@components/ui/Text/Text";
import { uploadBusinessCover, removeBusinessCover } from "@services/supabase/businesses";

interface Props {
    businessId: string;
    currentCover: string | null;
    onChange: (fileOrUrl: any) => void;
    temporaryMode?: boolean; // per la fase di creazione
}

export default function BusinessCoverUploader({
    businessId,
    currentCover,
    onChange,
    temporaryMode = false
}: Props) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(currentCover);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const pickFile = () => fileInputRef.current?.click();

    async function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // durante la creazione: NON carichiamo ora
        if (temporaryMode) {
            onChange(file);
            setPreview(URL.createObjectURL(file));
            return;
        }

        // durante la modifica → upload immediato
        setLoading(true);

        try {
            const url = await uploadBusinessCover(businessId, file);
            setPreview(url);
            onChange(url);
        } catch {
            alert("Errore durante l'upload.");
        } finally {
            setLoading(false);
        }
    }

    async function handleRemove() {
        if (temporaryMode) {
            onChange(null);
            setPreview(null);
            return;
        }

        setLoading(true);
        try {
            await removeBusinessCover(businessId);
            setPreview(null);
            onChange(null);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.coverUploader}>
            <Text as="h4" variant="caption">
                Foto copertina
            </Text>

            {!preview ? (
                <button
                    type="button"
                    className={styles.uploadBox}
                    onClick={pickFile}
                    disabled={loading}
                >
                    {loading ? "Caricamento..." : "Carica immagine"}
                </button>
            ) : (
                <div className={styles.previewWrap}>
                    <img src={preview} className={styles.previewImage} />

                    <div className={styles.actions}>
                        <button className={styles.changeBtn} onClick={pickFile} disabled={loading}>
                            Cambia
                        </button>
                        <button
                            className={styles.removeBtn}
                            onClick={handleRemove}
                            disabled={loading}
                        >
                            Rimuovi
                        </button>
                    </div>
                </div>
            )}

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className={styles.hiddenInput}
                onChange={handleSelectFile}
            />
        </div>
    );
}
