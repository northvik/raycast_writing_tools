import { Action, ActionPanel } from "@raycast/api";
import { ProcessingState } from "../utils/textProcessing";
import {LanguageSelector} from "./LanguageSelector";
import {defaultLanguages, Language} from "../utils/DefaultLanguages";

export interface ProcessingActionsProps {
  state: ProcessingState;
  title: string;
  onSubmit: () => Promise<void>;
  languages?: Language[];
  selectedLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
}


export function ProcessingActions({
  state,
  title,
  onSubmit,
  languages,
  selectedLanguage,
  onLanguageChange,
}: ProcessingActionsProps) {
  return (
    <ActionPanel>
      {languages && onLanguageChange ? (
        <ActionPanel.Submenu title="Select Language" icon={{ source: "🌐" }}>
          <LanguageSelector
            languages={languages}
            selectedLanguage={selectedLanguage || defaultLanguages[0]}
            onLanguageChange={onLanguageChange}
          />
        </ActionPanel.Submenu>
      ) : state.processedText && (
        <Action
          title={`Apply ${title}`}
          onAction={onSubmit}
        />
      )}
    </ActionPanel>
  );
}
