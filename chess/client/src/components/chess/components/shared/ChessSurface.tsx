import type { HTMLAttributes, ReactNode } from "react";

type ChessSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export default function ChessSurface({ children, className = "", ...divProps }: ChessSurfaceProps) {
  return (
    <div className={["chess-surface", className].filter(Boolean).join(" ")} {...divProps}>
      {children}
    </div>
  );
}