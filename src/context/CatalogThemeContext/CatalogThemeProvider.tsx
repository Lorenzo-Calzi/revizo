import { type ReactNode } from "react";
import { CatalogThemeContext } from "./CatalogThemeContext";
import type { CatalogTheme } from "@/types/theme";

export function CatalogThemeProvider({
    theme,
    children
}: {
    theme: CatalogTheme;
    children: ReactNode;
}) {
    return <CatalogThemeContext.Provider value={theme}>{children}</CatalogThemeContext.Provider>;
}
