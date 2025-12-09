import { useEffect, useCallback } from "react";
import styles from "./SelectionDrawer.module.scss";
import Text from "@/components/ui/Text/Text";

type Props = {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    confirmLabel?: string;
    children: React.ReactNode;
    width?: number; // default 380px
};

export default function SelectionDrawer({
    title,
    isOpen,
    onClose,
    onConfirm,
    confirmLabel = "Conferma",
    children,
    width = 380
}: Props) {
    // Chiudi con ESC
    const handleKeydown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeydown);
        } else {
            document.removeEventListener("keydown", handleKeydown);
        }

        return () => {
            document.removeEventListener("keydown", handleKeydown);
        };
    }, [isOpen, handleKeydown]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} role="dialog" aria-modal="true">
            {/* Drawer panel */}
            <div className={styles.drawer} style={{ width }}>
                <header className={styles.header}>
                    <Text as="h3" weight={600}>
                        {title}
                    </Text>

                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Chiudi pannello"
                    >
                        ✕
                    </button>
                </header>

                <div className={styles.content}>{children}</div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Annulla
                    </button>

                    {onConfirm && (
                        <button className={styles.confirmBtn} onClick={onConfirm}>
                            {confirmLabel}
                        </button>
                    )}
                </footer>
            </div>

            {/* Clic esterno per chiudere */}
            <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
        </div>
    );
}
