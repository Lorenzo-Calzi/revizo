import React from "react";
import styles from "./Input.module.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, className, ...props }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
        <div className={`${styles.wrapper} ${className || ""}`}>
            <label htmlFor={inputId} className={styles.label}>
                {label}
            </label>
            <input id={inputId} className={styles.input} {...props} aria-invalid={!!error} />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};
