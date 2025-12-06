import React from "react";
import type { Toast } from "@/types/toast";
import styles from "./Toast.module.scss";

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

const EXIT_ANIMATION_MS = 250; // deve combaciare con la durata in SCSS

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
    const [isLeaving, setIsLeaving] = React.useState(false);

    React.useEffect(() => {
        const autoHideTimer = setTimeout(() => {
            setIsLeaving(true);
        }, toast.duration);

        return () => {
            clearTimeout(autoHideTimer);
        };
    }, [toast.duration]);

    React.useEffect(() => {
        if (!isLeaving) return;

        const removeTimer = setTimeout(() => {
            onRemove();
        }, EXIT_ANIMATION_MS);

        return () => {
            clearTimeout(removeTimer);
        };
    }, [isLeaving, onRemove]);

    const typeClass =
        toast.type === "success"
            ? styles.toastSuccess
            : toast.type === "error"
            ? styles.toastError
            : styles.toastInfo;

    const stateClass = isLeaving ? styles.toastLeaving : styles.toastEntering;

    return (
        <div className={`${styles.toast} ${typeClass} ${stateClass}`}>
            <div className={styles.toastContent}>
                <span className={styles.toastMessage}>{toast.message}</span>
            </div>
            <button
                type="button"
                className={styles.toastClose}
                onClick={() => setIsLeaving(true)}
                aria-label="Chiudi notifica"
            >
                ×
            </button>
        </div>
    );
};
