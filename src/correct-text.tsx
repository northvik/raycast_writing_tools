import {Clipboard, Detail, popToRoot} from "@raycast/api";
import {ProcessingActions} from "./components/ProcessingActions";
import {formatMarkdown, useTextProcessing} from "./utils/textProcessing";
import {PreferencesErrorView, validatePreferences} from "./utils/preferenceValidation";

export default function Command() {
    const validation = validatePreferences();

    if (!validation.isValid) {
        return <PreferencesErrorView error={validation.error || "Unknown error"} />;
    }


    const state = useTextProcessing({
        systemPrompt: `Your task is to output USER's input and make it typo-free.
               - You ALWAYS maintain the language used in the text to correct, original meaning and tone of the text while making corrections.
               - When correcting text in a non-English language (like French), DO NOT translate or modify technical terms, work-related vocabulary, or specialized terminology that appears in English.
               - ALWAYS Preserve all original formatting including:
                 * markdown formatting
                 * Line breaks and paragraph spacing
                 * Indentation and text alignment
                 * Special characters, symbols, emojis, slack emojis (don't replace by emoji keep :emoji: formating).
                 * Lists and bullet points structure
               - If the user text does not include any typo just output the text`,
        options: {
            temperature: 0.3,
        }
    });

    // Show PreferencesErrorView for LLM errors
    if (state.error?.type === 'LLMError') {
        return <PreferencesErrorView error={state.error.message || "Unknown LLM error"} />;
    }

    return (
        <Detail
            isLoading={state.isLoading}
            navigationTitle="Text Correction"
            markdown={formatMarkdown(state, "Text Correction")}
            actions={
                <ProcessingActions
                    state={state}
                    title="Text Correction"
                    onSubmit={async () => {
                        if (state.processedText) {
                            await Clipboard.paste(state.processedText);
                            await popToRoot({clearSearchBar: true});
                        }
                    }}
                />
            }
        />
    );
}
