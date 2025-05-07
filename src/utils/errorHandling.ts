import { Toast, showToast } from "@raycast/api";

export type ErrorState = {
  message: string | null;
  showToast: boolean;
  type?: 'LLMError' | 'SelectionError' | 'GeneralError';
};

export function handleError(err: unknown): ErrorState {
  const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
  const isLLMError = err instanceof Error && err.name === 'LLMError';
  const isAuthError = errorMessage.toLowerCase().includes("auth") || errorMessage.toLowerCase().includes("api key");

  if (isLLMError) {
    showToast({
      style: Toast.Style.Failure,
      title: "AI Model Error",
      message: "Check extension preferences",
    });

    return {
      message: errorMessage,
      showToast: true,
      type: 'LLMError'
    };
  }

  const message = isAuthError
    ? "Authentication failed. Please check your API key in the extension preferences."
    : "Failed to process text. Please try again.";

  showToast({
    style: Toast.Style.Failure,
    title: "Error",
    message: isAuthError ? "API Key error. Check extension preferences." : "Failed to process text",
  });

  return {
    message,
    showToast: true,
    type: 'GeneralError'
  };
}

export function handleSelectionError(): ErrorState {
  const message = "No text selected. Please select some text before translating.";

  showToast({
    style: Toast.Style.Failure,
    title: "No Text Selected",
    message: "Please select text to translate",
  });

  return {
    message,
    showToast: true,
    type: 'SelectionError'
  };
}

export function handleSuccess(action: string): void {
  showToast({
    style: Toast.Style.Success,
    title: "Success",
    message: `${action} completed`,
  });
}
