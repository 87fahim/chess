import "./accessibility-settings.css";
import ChessSection from "../shared/ChessSection";

export default function AccessibilitySettings() {
  return (
    <ChessSection
      className="chess-settings-view__card settings-accessibility"
      title="Accessibility"
      hint="Accessibility options are coming next. High contrast and larger text controls will be added here."
      hintClassName="chess-settings-view__hint chess-section__hint"
    />
  );
}
