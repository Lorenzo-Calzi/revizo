import { useState } from "react";
import BuilderToolbar from "../BuilderToolbar/BuilderToolbar";
import BuilderSidebar from "../BuilderSidebar/BuilderSidebar";
import BuilderPreviewFrame from "../BuilderPreviewFrame/BuilderPreviewFrame";
import styles from "@/styles/catalog-builder/builderLayout.module.scss";

export default function BuilderLayout() {
    const [mode, setMode] = useState<"mobile" | "tablet" | "desktop">("mobile");

    return (
        <div className={styles.builder}>
            <BuilderToolbar mode={mode} setMode={setMode} />

            <div className={styles.main}>
                <BuilderSidebar />

                <BuilderPreviewFrame mode={mode} />
            </div>
        </div>
    );
}
