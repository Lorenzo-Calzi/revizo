export function generateSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, "-") // spazi e underscore -> trattino
        .replace(/[^a-z0-9-]/g, "") // mantiene solo lettere, numeri e trattini
        .replace(/--+/g, "-") // comprime doppie lineette
        .replace(/^-+/, "") // rimuove trattini iniziali
        .replace(/-+$/, ""); // rimuove trattini finali
}
