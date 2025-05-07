import {getSelectedText} from "@raycast/api";
import {useState, useEffect} from "react";
import {processWithAI, ProcessingOptions} from "./aiProcessing";
import {ErrorState, handleError, handleSelectionError} from "./errorHandling";
import { PreferencesErrorView } from "./preferenceValidation";

export type ProcessingState = {
    isLoading: boolean;
    selectedText: string;
    processedText: string;
    error: ErrorState | null;
    setSkipProcess: (skip: boolean) => void;
    showPreferencesError: boolean;
};

export type ProcessingConfig = {
    systemPrompt: string;
    options?: ProcessingOptions;
    skipInitialProcess?: boolean;
};

export function useGetSelectedText() {
    const [selectedText, setSelectedText] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ErrorState | null>(null);
    useEffect(() => {
        async function fetchHighlightedText() {
            let text: string | undefined;
            try {
                text = await getSelectedText();
            } catch (error) {
                const handledError = handleSelectionError();
                setError(handledError);
                setSelectedText("");
            }
            if (text) {
                setSelectedText(text);
                setError(null);
            }
            setIsLoading(false);
        }

        fetchHighlightedText();
    }, []);
    return {selectedText: selectedText, isLoading: isLoading, error: error};
}

export function useTextProcessing(config: ProcessingConfig) {
    const [skipProcess, setSkipProcess] = useState(!!config.skipInitialProcess);
    const [isLoading, setIsLoading] = useState(!skipProcess);
    const {selectedText, isLoading: isLoadingSelectedText, error: selectionError} = useGetSelectedText();
    const [processedText, setProcessedText] = useState("");
    const [error, setError] = useState<ErrorState | null>(null);


    // Handle selection errors
    useEffect(() => {
        if (selectionError) {
            setError(selectionError);
        }
    }, [selectionError]);

    // Process text when conditions are met
    useEffect(() => {
        if (!skipProcess && config.systemPrompt && selectedText && !isLoadingSelectedText && !selectionError) {
            processText();
        }
    }, [selectedText, config.systemPrompt, skipProcess, isLoadingSelectedText, selectionError]);

    async function processText() {
        if (!config.systemPrompt || !selectedText) {
            return;
        }

        try {
            setIsLoading(true);
            const processed = await processWithAI(selectedText, config.systemPrompt, config.options);
            setProcessedText(processed);
            setError(null);
            setIsLoading(false);
        } catch (err) {
            setError(handleError(err));
            setIsLoading(false);
        }
    }

    const state: ProcessingState = {
        isLoading,
        setSkipProcess,
        selectedText: selectedText || "",
        processedText,
        error,
        showPreferencesError: error?.type === 'LLMError'
    };

    return {
        ...state,
        reprocess: processText,
    };
}

export function formatMarkdown(state: ProcessingState, title: string): string {
    if (state.error) {
        return `# Error\n${state.error.message}`;
    }

    if (state.isLoading) {
        return '# Loading...\nPlease wait while processing your text.';
    }

    if (!state.selectedText) {
        return '# No Text Selected\nPlease select some text to translate.';
    }

    return `
## ${title}:

---

${state.processedText}
`;
}
