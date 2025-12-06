import { useContext } from "react";
import { CatalogThemeContext } from "./CatalogThemeContext";

export function useCatalogTheme() {
    const ctx = useContext(CatalogThemeContext);
    if (!ctx) {
        throw new Error("useCatalogTheme must be used inside a CatalogThemeProvider");
    }
    return ctx;
}
