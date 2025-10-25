type HamburgerButtonProps = {
    expanded: boolean;
    onToggle: () => void;
    controlsId?: string;
};

export const HamburgerButton = ({expanded, onToggle, controlsId = "mission-tools-panel"}: HamburgerButtonProps) => {
    const label = expanded ? "Hide mission tools" : "Show mission tools";

    return (
        <button
            type="button"
            className={`tool-toggle${expanded ? " tool-toggle--active" : ""}`}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={controlsId}
            aria-label={label}
        >
            <span className="tool-toggle__icon" aria-hidden="true">
                <span />
                <span />
                <span />
            </span>
        </button>
    );
};
