import React, { useState } from "react";
import ConfirmModal from "@/components/ui/ConfirmModal/ConfirmModal";
import Text from "@components/ui/Text/Text";
import { QRCodeSVG } from "qrcode.react";
import styles from "./BusinessCard.module.scss";
import type { BusinessCardProps } from "@/types/Businesses";

export const BusinessCard: React.FC<BusinessCardProps> = ({
    business,
    onEdit,
    onDelete,
    onOpenCatalog,
    onOpenEditor,
    onOpenReviews
}) => {
    const publicUrl = `${window.location.origin}/business/${business.slug}`;

    // Stato modale QR
    const [showQrModal, setShowQrModal] = useState(false);

    // Funzione per scaricare il QR code in PNG
    function downloadQrAsPng() {
        const el = document.getElementById("qr-download");

        if (!(el instanceof SVGSVGElement)) {
            console.error("QR element is not an SVG!");
            return;
        }

        const svg = el;

        const xml = new XMLSerializer().serializeToString(svg);
        const svg64 = btoa(xml);
        const image64 = `data:image/svg+xml;base64,${svg64}`;

        const img = new Image();
        img.src = image64;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 2000; // alta qualità stampa
            canvas.width = size;
            canvas.height = size;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, size, size);

            ctx.drawImage(img, 0, 0, size, size);

            const pngFile = canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = pngFile;
            link.download = `qr-${business.slug}.png`;
            link.click();
        };
    }

    return (
        <>
            <article className={styles.card}>
                <div className={styles.top}>
                    {/* Thumbnail */}
                    <div className={styles.thumbnail}>
                        {business.cover_image ? (
                            <img src={business.cover_image} alt={`Copertina di ${business.name}`} />
                        ) : (
                            <div className={styles.thumbnailPlaceholder} />
                        )}
                    </div>

                    {/* Info testo */}
                    <div className={styles.info}>
                        <Text as="h3" variant="title-sm" weight={600}>
                            {business.name}
                        </Text>

                        <Text variant="body" colorVariant="muted">
                            {business.address}, {business.city}
                        </Text>

                        <a
                            className={styles.publicUrl}
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {publicUrl}
                        </a>
                    </div>

                    {/* QR (in alto a destra) */}
                    <div className={styles.qrWrapper} onClick={() => setShowQrModal(true)}>
                        <QRCodeSVG value={publicUrl} bgColor="#f8f9fb" fgColor="#000000" />
                    </div>
                </div>

                {/* ACTIONS */}
                <div className={styles.actions}>
                    <button className={styles.primary} onClick={() => onOpenCatalog(business.id)}>
                        Menù
                    </button>

                    <button className={styles.secondary} onClick={() => onOpenEditor(business.id)}>
                        Editor
                    </button>

                    <button className={styles.secondary} onClick={() => onOpenReviews(business.id)}>
                        Recensioni
                    </button>

                    <button className={styles.ghost} onClick={() => onEdit(business)}>
                        Modifica
                    </button>

                    <button className={styles.danger} onClick={() => onDelete(business.id)}>
                        Elimina
                    </button>
                </div>
            </article>

            {/* MODALE QR */}
            <ConfirmModal
                isOpen={showQrModal}
                title="QR code dell’attività"
                description="Scansiona o scarica il QR code per accedere alla pagina pubblica."
                confirmLabel="Chiudi"
                onConfirm={() => setShowQrModal(false)}
            >
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <QRCodeSVG
                        id="qr-download"
                        value={publicUrl}
                        size={240}
                        bgColor="#ffffff"
                        fgColor="#000000"
                    />

                    <button
                        style={{
                            marginTop: "1rem",
                            padding: "10px 16px",
                            borderRadius: 8,
                            background: "#000",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                        onClick={downloadQrAsPng}
                    >
                        Scarica QR code
                    </button>
                </div>
            </ConfirmModal>
        </>
    );
};
