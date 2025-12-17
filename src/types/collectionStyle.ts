export type CardTemplate = "left" | "right" | "no-image";

export type CollectionStyle = {
    backgroundColor?: string; // "#ffffff"
    cardRadius?: number; // px, es 12
    cardTemplate?: CardTemplate;
};

export const DEFAULT_COLLECTION_STYLE: Required<CollectionStyle> = {
    backgroundColor: "#ffffff",
    cardRadius: 12,
    cardTemplate: "left"
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function safeCollectionStyle(style: unknown): CollectionStyle {
    if (!isRecord(style)) return {};

    const backgroundColor =
        typeof style.backgroundColor === "string" ? style.backgroundColor : undefined;

    const cardRadius = typeof style.cardRadius === "number" ? style.cardRadius : undefined;

    const cardTemplate =
        style.cardTemplate === "left" ||
        style.cardTemplate === "right" ||
        style.cardTemplate === "no-image"
            ? style.cardTemplate
            : undefined;

    return { backgroundColor, cardRadius, cardTemplate };
}

export function resolveCollectionStyle(saved: unknown, draft: unknown): Required<CollectionStyle> {
    return {
        ...DEFAULT_COLLECTION_STYLE,
        ...safeCollectionStyle(saved),
        ...safeCollectionStyle(draft)
    };
}
