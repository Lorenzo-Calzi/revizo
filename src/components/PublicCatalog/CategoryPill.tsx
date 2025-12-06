import { useState } from "react";

type Props = {
    label: string;
    isActive: boolean;
    colors: {
        activeBg: string;
        activeText: string;
        normalBg: string;
        normalText: string;
        hoverBg: string;
        hoverText: string;
    };
    onClick: () => void;
    className?: string;
};

export default function CategoryPill({ label, isActive, colors, onClick, className }: Props) {
    const [hovered, setHovered] = useState(false);

    let bg = colors.normalBg;
    let text = colors.normalText;

    if (isActive) {
        bg = colors.activeBg;
        text = colors.activeText;
    } else if (hovered) {
        bg = colors.hoverBg;
        text = colors.hoverText;
    }

    return (
        <button
            className={className}
            style={{
                backgroundColor: bg,
                color: text,
                transition: "background-color 0.15s ease, color 0.15s ease"
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
