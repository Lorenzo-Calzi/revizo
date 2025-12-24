export type FieldType =
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "multiselect"
    | "switch"
    | "chips" // lista di stringhe (ingredienti, ecc.)
    | "datetime"; // per events

export type FieldOption = { value: string; label: string };

export type FieldDef = {
    key: string; // dove salvarlo (base o metadata)
    label: string;
    type: FieldType;

    // UX
    placeholder?: string;
    helpText?: string;
    required?: boolean;

    // per select
    options?: FieldOption[];

    // dove persistere
    storage: "base" | "metadata"; // base -> colonne (name, description, base_price, duration), metadata -> jsonb
};
