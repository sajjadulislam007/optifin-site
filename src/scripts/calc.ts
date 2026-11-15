// Small helpers shared by the free calculators. Inputs are clamped at zero;
// outputs that cannot be computed render as "—" rather than a fake zero.

export const num = (id: string): number => {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
  const value = Number(el?.value);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
};

export const set = (id: string, text: string) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};

export const money = (value: number | null) =>
  value === null || !Number.isFinite(value)
    ? "—"
    : `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const pct = (ratio: number | null, digits = 1) =>
  ratio === null || !Number.isFinite(ratio) ? "—" : `${(ratio * 100).toFixed(digits)}%`;

export const times = (value: number | null) =>
  value === null || !Number.isFinite(value) ? "—" : `${value.toFixed(2)}×`;

/** Run `calc` now and on every input or select change. */
export function bind(calc: () => void) {
  document.querySelectorAll(".calc-form input, .calc-form select").forEach((el) => {
    el.addEventListener("input", calc);
    el.addEventListener("change", calc);
  });
  calc();
}
