import {getPreferenceValues, Form, ActionPanel, Action, Detail, openExtensionPreferences} from "@raycast/api";

export interface Preferences {
    selectedModel: "openai" | "mistral";
    apiKey: string;
}

export function validatePreferences(): { isValid: boolean; error?: string } {
    try {
        const preferences = getPreferenceValues<Preferences>();

        // Check if model is selected
        if (!preferences.selectedModel) {
            return {isValid: false, error: "Please select an AI model"};
        }

        // Check if API key is set
        if (!preferences.apiKey || preferences.apiKey.trim() === "") {
            return {isValid: false, error: `API key for ${preferences.selectedModel} is not set`};
        }

        return {isValid: true};
    } catch (error) {
        return {isValid: false, error: "Failed to load preferences"};
    }
}

const configuration_markdown = `
### Configuration Guide

1. **Select AI Model**
   Choose one of the available models:
   - OpenAI
   - Mistral

2. **API Key**
   Enter your API key for the selected model.

Click the button **Open extension preferences** below or press **Enter** to access the configuration panel.
`;

export function PreferencesErrorView({error}: { error: string }) {
    const errorMarkdown = `
## ⚠️ Configuration Error
${error}

---
${configuration_markdown}
    `;

    return (
        <Detail
            markdown={errorMarkdown}
            actions={
                <ActionPanel>
                    <Action
                        title="Open Extension Preferences"
                        onAction={openExtensionPreferences}
                    />
                </ActionPanel>
            }
        />
    );
}
