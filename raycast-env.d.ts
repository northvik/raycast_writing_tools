/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** AI Model - Select which AI model to use */
  "selectedModel": "openai" | "mistral",
  /** API Key - API key for the selected AI model */
  "apiKey": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `correct-text` command */
  export type CorrectText = ExtensionPreferences & {}
  /** Preferences accessible in the `change-tone` command */
  export type ChangeTone = ExtensionPreferences & {}
  /** Preferences accessible in the `translate` command */
  export type Translate = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `correct-text` command */
  export type CorrectText = {}
  /** Arguments passed to the `change-tone` command */
  export type ChangeTone = {}
  /** Arguments passed to the `translate` command */
  export type Translate = {}
}

