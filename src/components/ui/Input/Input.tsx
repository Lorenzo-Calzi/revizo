import React from "react";
import Text from "@components/ui/Text/Text";
import styles from "./Input.module.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, id, className, ...props }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
        <div className={`${styles.wrapper} ${className || ""}`}>
            {/* LABEL */}
            <Text as="label" variant="body" weight={600} className={styles.label}>
                {label}
            </Text>

            {/* INPUT */}
            <input id={inputId} className={styles.input} aria-invalid={!!error} {...props} />

            {/* ERROR */}
            {error && (
                <Text as="span" variant="caption" colorVariant="error" className={styles.error}>
                    {error}
                </Text>
            )}
        </div>
    );
};
