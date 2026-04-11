import dayjs from "dayjs";

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
      currency,
      maximumFractionDigits: 2,
    }).format(numericValue);

    return `€${formattedNumber}`;
  } catch (error) {
    return `€${numericValue.toFixed(2)}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
