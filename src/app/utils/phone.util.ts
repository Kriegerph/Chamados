const COUNTRY_CODE = "55";
const LOCAL_LENGTH = 10;
const LOCAL_WITH_NINTH_DIGIT_LENGTH = 11;

const digitsOnly = (value: unknown): string =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

const stripCountryCode = (digits: string): string =>
  digits.startsWith(COUNTRY_CODE) ? digits.slice(COUNTRY_CODE.length) : digits;

const removeNinthDigit = (localDigits: string): string =>
  localDigits.length === LOCAL_WITH_NINTH_DIGIT_LENGTH
    ? `${localDigits.slice(0, 2)}${localDigits.slice(3)}`
    : localDigits;

export const normalizePhoneTo12Digits = (value: unknown): string => {
  const cleaned = digitsOnly(value);
  if (!cleaned) {
    return "";
  }

  const localDigits = removeNinthDigit(stripCountryCode(cleaned));
  if (localDigits.length !== LOCAL_LENGTH) {
    return "";
  }

  return `${COUNTRY_CODE}${localDigits}`;
};

export const isValidPhone12Digits = (value: unknown): boolean =>
  normalizePhoneTo12Digits(value).length === 12;

export const formatPhoneInput = (value: unknown): string => {
  const cleaned = digitsOnly(value);
  if (!cleaned) {
    return "";
  }

  const localDigits = removeNinthDigit(stripCountryCode(cleaned)).slice(0, LOCAL_LENGTH);
  if (!localDigits) {
    return "";
  }

  if (localDigits.length <= 2) {
    return `(${localDigits}`;
  }

  if (localDigits.length <= 6) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2)}`;
  }

  return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6, 10)}`;
};
