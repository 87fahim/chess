import type { ReactNode } from "react";
import "./main-content-window.css";

type MainContentWindowProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export default function MainContentWindow({ children, className = "", ariaLabel }: MainContentWindowProps) {
  return (
    <section className={`main-content-window ${className}`.trim()} aria-label={ariaLabel}>
      {children}
    </section>
  );
}
