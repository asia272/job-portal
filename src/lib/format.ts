export function formatDate(d: Date) {
    // Fixed timezone so server and browser render the same text
    return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}
export function timeAgo(d: Date) {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? "" : "s"} ago`;
}
const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
});

// Change "$" here if you want another currency (for example "Rs ")
export function formatSalary(min?: number | null, max?: number | null) {
    if (min == null && max == null) return "Not disclosed";
    if (min != null && max != null) {
        return min === max
            ? `$${compact.format(min)}`
            : `$${compact.format(min)} - $${compact.format(max)}`;
    }
    return `$${compact.format((min ?? max) as number)}`;
}