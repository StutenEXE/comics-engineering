import type { OwnedEdition, SimpleOwnedEdition } from "~/models/ownedEdition";

export function formatCurrency(amount: number, currency: string, locale: string): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function calcCost(oe?: SimpleOwnedEdition | OwnedEdition) {
    return (oe?.purchasePrice ?? 0) + (oe?.fees ?? 0)
}

export function calcSavings(oe?: SimpleOwnedEdition | OwnedEdition) {
    return (oe?.retailPrice ?? 0) - calcCost(oe);
}

export function calcReduction(oe?: SimpleOwnedEdition | OwnedEdition) {
    return (calcSavings(oe) / (oe?.retailPrice ?? 1)) * 100;
}

// Text color of a savings value : green when saved, red when overpaid
export function savingsClassName(value: number) {
    if (value > 0) return "text-emerald-400";
    if (value < 0) return "text-rose-400";
    return "";
}
