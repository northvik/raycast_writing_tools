import {useState} from "react";
import {Clipboard, List, Action, ActionPanel, Detail} from "@raycast/api";
import {ProcessingActions} from "./components/ProcessingActions";
import {formatMarkdown, useTextProcessing} from "./utils/textProcessing";
import {defaultLanguages, Language} from "./utils/DefaultLanguages";
import {PreferencesErrorView, validatePreferences} from "./utils/preferenceValidation";

export default function Command() {
    const validation = validatePreferences();
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [step, setStep] = useState<'select_language' | 'process_text'>('select_language');

    if (!validation.isValid) {
        return <PreferencesErrorView error={validation.error || "Unknown error"} />;
    }

    const state = useTextProcessing({
        systemPrompt: selectedLanguage
            ? `You are a professional translator.
       Translate the following text to ${selectedLanguage.name}.
       Make it sound natural and native to the target language.
       Preserve all original formatting including:
         - Line breaks and paragraph spacing
         - Indentation and text alignment
         - Special characters and symbols
         - Lists and bullet points structure
       Only output the translated text without any explanations or additional content.`
            : '',
        options: {
            temperature: 0.3,
        },
        skipInitialProcess: true
    });

    const handleLanguageSelect = async (language: Language) => {
        setSelectedLanguage(language);
        setStep('process_text');
        state.setSkipProcess(false);
    };

    if (step === 'select_language') {
        return (
            <List>
                {defaultLanguages.map((language) => (
                    <List.Item
                        key={language.id}
                        icon="🌐"
                        title={language.name}
                        actions={
                            <ActionPanel>
                                <Action
                                    title={`Translate to ${language.name}`}
                                    onAction={() => handleLanguageSelect(language)}
                                />
                            </ActionPanel>
                        }
                    />
                ))}
            </List>
        );
    }

    // Show PreferencesErrorView for LLM errors
    if (state.error?.type === 'LLMError') {
        return <PreferencesErrorView error={state.error.message || "Unknown LLM error"} />;
    }

    return (
        <Detail
            isLoading={state.isLoading}
            navigationTitle="Translate Text"
            markdown={formatMarkdown(state, `Translate Text to ${selectedLanguage?.name}`)}
            actions={
                <ProcessingActions
                    state={state}
                    title="Translate Text"
                    onSubmit={async () => {
                        if (state.processedText) {
                            await Clipboard.paste(state.processedText);
                        }
                    }}
                />
            }
        />
    );
}
