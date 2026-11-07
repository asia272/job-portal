export function formatDate(d: Date) {
    // Fixed timezone so server and browser render the same text
    return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
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