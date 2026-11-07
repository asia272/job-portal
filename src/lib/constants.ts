export const CATEGORIES = [
    { value: "PROGRAMMING", label: "Programming" },
    { value: "MARKETING", label: "Marketing" },
    { value: "DESIGNING", label: "Designing" },
    { value: "ACCOUNTING", label: "Accounting" },
    { value: "ANALYTICS", label: "Analytics" },
] as const;

export const LEVEL_LABELS: Record<string, string> = {
    BEGINNER: "Beginner level",
    INTERMEDIATE: "Intermediate level",
    SENIOR: "Senior level",
};