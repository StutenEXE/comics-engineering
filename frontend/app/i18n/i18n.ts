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
  parameters?: Record<string, any>;
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
    const { capitalize, allCaps, parameters } = options;
    if (parameters) message = insertParameters(message, parameters);
    if (capitalize) message = capFn(message);
    if (allCaps) message = message.toUpperCase();
    return message;
  }

  return { t, locale };
}

function insertParameters(message: string, parameters: Record<string, any>): string {
  Object.entries(parameters).forEach(([key, val]) => {
    const placeholder = `%${key}%`
    message = message.replaceAll(placeholder, String(val))
  })
  return message
}