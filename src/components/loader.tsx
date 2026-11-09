type SpinnerProps = {
    size?: number;
    tone?: "default" | "light"; // "light" is for use inside blue buttons
    label?: string;
    className?: string;
};

/** The blue arc on a gray ring. Use it anywhere something is loading. */
export function Spinner({ size = 40, tone = "default", label = "Loading", className = "" }: SpinnerProps) {
    const ring =
        tone === "light" ? "border-white/30 border-t-white" : "border-[#D1D5DB] border-t-[#60A5FA]";
    return (
        <span
            role="status"
            aria-label={label}
            className={`inline-block shrink-0 animate-spin rounded-full border-solid ${ring} ${className}`}
            style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 16)) }}
        />
    );
}

/** Full screen (route changes, dashboard shell). */
export function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white">
            <Spinner size={64} />
        </div>
    );
}

/** Inside a page area (Suspense fallbacks). */
export function SectionLoader() {
    return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Spinner size={56} />
        </div>
    );
}

/** Small white spinner for buttons that are submitting. */
export function ButtonSpinner() {
    return <Spinner size={18} tone="light" label="Submitting" />;
}