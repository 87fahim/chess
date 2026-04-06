import { type CSSProperties, type MouseEventHandler, type ReactNode, type RefObject } from "react";

type ChessOverlayModalProps = {
  open: boolean;
  ariaLabel: string;
  backdropClassName?: string;
  surfaceClassName?: string;
  surfaceRef?: RefObject<HTMLDivElement>;
  surfaceStyle?: CSSProperties;
  onBackdropClick?: MouseEventHandler<HTMLDivElement>;
  onSurfaceClick?: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
};

export default function ChessOverlayModal({
  open,
  ariaLabel,
  backdropClassName = "game-over-backdrop",
  surfaceClassName = "game-over-modal",
  surfaceRef,
  surfaceStyle,
  onBackdropClick,
  onSurfaceClick,
  children,
}: ChessOverlayModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={backdropClassName} onClick={onBackdropClick}>
      <div
        ref={surfaceRef}
        className={surfaceClassName}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={surfaceStyle}
        onClick={onSurfaceClick}
      >
        {children}
      </div>
    </div>
  );
}