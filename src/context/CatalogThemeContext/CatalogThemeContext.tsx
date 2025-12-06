import { createContext } from "react";
import type { CatalogTheme } from "@/types/theme";

export const CatalogThemeContext = createContext<CatalogTheme | undefined>(undefined);
