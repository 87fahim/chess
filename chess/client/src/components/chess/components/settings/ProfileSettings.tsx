import "./profile-settings.css";
import ChessSection from "../shared/ChessSection";

export default function ProfileSettings() {
  return (
    <ChessSection
      className="chess-settings-view__card settings-profile"
      title="Profile"
      hint="Profile settings are coming next. Current saves are linked to guest/session or user account."
      hintClassName="chess-settings-view__hint chess-section__hint"
    />
  );
}
