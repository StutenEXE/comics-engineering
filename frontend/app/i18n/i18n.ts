import { useSelector } from "react-redux";
import type { RootState } from "~/store/store";
import en from "./messages/en";
import fr from "./messages/fr";
import { capitalize as capFn } from "~/utils/strings";

export type Locale = "en-EN" | "fr-FR";

const messages: any = { "en-EN": en, "fr-FR": fr };

export type TranslationKeys = keyof typeof messages.fr;

interface TranslationOptions {
  capitalize?: boolean;
  allCaps?: boolean;
}

export function getMessage(locale: Locale, key: TranslationKeys, fallback?: string): string {
  if (!messages[locale]) {
    console.warn(`Locale ${locale} not found, falling back to English.`);
    locale = "en-EN";
  }
  return messages[locale][key] ?? fallback ?? key;
}

export function useTranslation() {
  const locale = useSelector((state: RootState) => state.locale.value as Locale);

  function t(key: TranslationKeys, options: TranslationOptions = {}): string {
    let message = getMessage(locale, key);
    const { capitalize, allCaps } = options;
    if (capitalize) message = capFn(message);
    if (allCaps) message = message.toUpperCase();
    return message;
  }

  return { t, locale };
}