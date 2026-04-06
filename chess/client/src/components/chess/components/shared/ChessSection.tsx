import type { ReactNode } from "react";

type ChessSectionProps = {
  children?: ReactNode;
  title?: ReactNode;
  hint?: ReactNode;
  className?: string;
  titleClassName?: string;
  hintClassName?: string;
  titleAs?: "h3" | "h4";
  as?: "section" | "div";
};

export default function ChessSection({
  children,
  title,
  hint,
  className = "",
  titleClassName = "",
  hintClassName = "",
  titleAs = "h3",
  as = "section",
}: ChessSectionProps) {
  const SectionTag = as;
  const TitleTag = titleAs;

  return (
    <SectionTag className={className}>
      {title ? <TitleTag className={titleClassName}>{title}</TitleTag> : null}
      {hint ? <p className={hintClassName}>{hint}</p> : null}
      {children}
    </SectionTag>
  );
}