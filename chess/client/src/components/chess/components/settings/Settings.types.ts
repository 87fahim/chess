import type { ChessAppearanceSettings } from "../../Chess.types";

export type SettingsTheme = "light" | "dark";

export type SettingsTabKey = "board" | "gameplay" | "profile" | "accessibility";

export type SettingsPreviewPayload = {
  theme: SettingsTheme;
  boardZoom: number;
  appearanceSettings: ChessAppearanceSettings;
};

export type BoardPreset = {
  name: string;
  light: string;
  dark: string;
};

export type ThemePreset = {
  key: SettingsTheme;
  name: string;
  light: string;
  dark: string;
};
