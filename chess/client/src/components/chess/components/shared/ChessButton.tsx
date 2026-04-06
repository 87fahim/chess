import type { ButtonHTMLAttributes, ReactNode } from "react";

type ChessButtonVariant = "text" | "panel" | "chip" | "solid";
type ChessButtonTone = "default" | "secondary";
type ChessButtonAlign = "left" | "center";

type ChessButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ChessButtonVariant;
  tone?: ChessButtonTone;
  align?: ChessButtonAlign;
  active?: boolean;
  fullWidth?: boolean;
};

export default function ChessButton({
  children,
  variant = "panel",
  tone = "default",
  align = "left",
  active = false,
  fullWidth = false,
  className = "",
  type = "button",
  ...buttonProps
}: ChessButtonProps) {
  const classes = [
    "chess-button",
    `chess-button--${variant}`,
    `chess-button--${tone}`,
    align === "center" ? "chess-button--center" : "",
    fullWidth ? "chess-button--full-width" : "",
    active ? "is-active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}