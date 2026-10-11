export const money = (value: number | string): string =>
    Number(value).toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });