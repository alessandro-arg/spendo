export function formatCurrency(
  value: number | string,
  currency: string = "EUR",
): string {
  const numericValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numericValue)) {
    return "€0.00";
  }

  try {
    const formattedNumber = new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);

    return `€${formattedNumber}`;
  } catch (error) {
    return `€${numericValue.toFixed(2)}`;
  }
}
