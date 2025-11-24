// Input formatting helpers for date/time fields (MM/DD/YYYY and HH:MM)
export const formatDateInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4, 8)}`;
};

export const formatTimeInput = (value: string) => {
  const digitsOnly = value.replace(/[^\d]/g, "").slice(0, 4);
  if (digitsOnly.length <= 2) return digitsOnly;
  return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2, 4)}`;
};

const range = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const parseScore = (value: string | undefined): number | undefined => {
  if (value) {
    const numeric = Number(value.replace(/[^\d]/g, ""));
    if (Number.isNaN(numeric)) return 0;
    return range(numeric, 1, 100);
  } else {
    return 0;
  }
};


