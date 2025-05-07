import {Action} from "@raycast/api";
import {Language} from "../utils/DefaultLanguages";

export interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageSelector({ languages, selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return languages.map((lang) => (
    <Action
      key={lang.id}
      title={lang.name}
      icon={lang.id === selectedLanguage.id ? { source: "✓" } : undefined}
      onAction={() => onLanguageChange(lang)}
    />
  ));
}
