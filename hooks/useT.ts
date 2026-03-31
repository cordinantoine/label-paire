"use client";

import { useLangStore } from "@/lib/langStore";

export function useT() {
  const { lang, setLang } = useLangStore();

  function t(obj: { fr: string; en: string }): string {
    return obj[lang];
  }

  return { t, lang, setLang };
}
