import {Clipboard, Action, ActionPanel, List, Detail} from "@raycast/api";
import {ProcessingActions} from "./components/ProcessingActions";
import {formatMarkdown, useTextProcessing} from "./utils/textProcessing";
import {PreferencesErrorView, validatePreferences} from "./utils/preferenceValidation";
import {useState} from "react";

type Tone = {
    id: string;
    name: string;
    emoji: string;
    prompt: string;
};

const tones: Tone[] = [
    {
        id: "neutral",
        name: "Original Tone",
        emoji: "😐",
        prompt: "Keep the original tone.",
    },
    {
        id: "concise",
        name: "Concise",
        emoji: "🩳",
        prompt: "Keep the original tone and make it as concise as possible.",
    },
    {
        id: "professional",
        name: "Professional",
        emoji: "👔",
        prompt: "Transform the text into a professional and clear tone while maintaining the original meaning.",
    },
    {
        id: "casual",
        name: "Casual",
        emoji: "😛",
        prompt: "Transform the text into a friendly tone while maintaining the original meaning.",
    },
    {
        id: "hyper-professional",
        name: "Hyper Professional",
        emoji: "🎩",
        prompt: "Transform the text into a highly formal and professional tone, using industry-standard terminology and sophisticated tone while maintaining the original meaning.",
    },
    {
        id: "hyper-casual",
        name: "Hyper Casual",
        emoji: "🤟",
        prompt: "Transform the text into a conversational tone, using common expressions and relaxed tone while maintaining the original meaning.",
    },
];

export default function Command() {
    const validation = validatePreferences();
    const [selectedTone, setSelectedTone] = useState<Tone | null>(null);
    const [step, setStep] = useState<'select_tone' | 'process_text'>('select_tone');

    // Check preferences validation before proceeding
    if (!validation.isValid) {
        return <PreferencesErrorView error={validation.error || "Unknown error"} />;
    }

    const state = useTextProcessing({
        systemPrompt: selectedTone ? `
    You are an assistant designed to improve the quality of written text.
    Your role is to enhance the clarity and tone of the user's text while maintaining its original intent.
    You should also ensure the text is grammatically correct and free from spelling errors.
    Keep the language of the original message.
    Preserve all original formatting including:
     * Line breaks and paragraph spacing
     * Indentation and text alignment
     * Special characters and symbols
     * Lists and bullet points structure
    The most important is that you need to adjust the following tone:
   ${selectedTone.prompt}
   ` : '',
        options: {
            temperature: 0.7,
        },
        skipInitialProcess: true, // Don't process until tone is selected
    });

    const handleToneSelect = (tone: Tone) => {
        setSelectedTone(tone);
        setStep('process_text');
        state.setSkipProcess(false);
    };

    // Show PreferencesErrorView for LLM errors
    if (state.error?.type === 'LLMError') {
        return <PreferencesErrorView error={state.error.message || "Unknown LLM error"} />;
    }

    if (step === 'select_tone') {
        return (
            <List>
                {tones.map((tone) => (
                    <List.Item
                        key={tone.id}
                        icon={tone.emoji}
                        title={tone.name}
                        actions={
                            <ActionPanel>
                                <Action
                                    title={`Use a ${tone.name} tone`}
                                    onAction={() => handleToneSelect(tone)}
                                />
                            </ActionPanel>
                        }
                    />
                ))}
            </List>
        );
    }

    return (
        <Detail
            isLoading={state.isLoading}
            navigationTitle="Adjust Writing Style"
            markdown={formatMarkdown(state, "Adjust Writing Style")}
            actions={
                <ProcessingActions
                    state={state}
                    title="Adjust Writing Style"
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
