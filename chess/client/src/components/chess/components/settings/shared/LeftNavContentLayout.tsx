import type { ReactNode } from "react";
import "./left-nav-content-layout.css";

export type LeftNavItem = {
  key: string;
  label: string;
  description?: string;
  icon?: ReactNode;
};

type LeftNavContentLayoutProps = {
  items: LeftNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  renderContent: (activeKey: string) => ReactNode;
  navAriaLabel?: string;
  className?: string;
  navClassName?: string;
  contentClassName?: string;
  wrapContent?: boolean;
  navHeader?: ReactNode;
  navFooter?: ReactNode;
  renderItem?: (item: LeftNavItem, isActive: boolean, onSelect: () => void) => ReactNode;
};

export default function LeftNavContentLayout({
  items,
  activeKey,
  onSelect,
  renderContent,
  navAriaLabel = "Navigation",
  className = "",
  navClassName = "",
  contentClassName = "",
  wrapContent = true,
  navHeader,
  navFooter,
  renderItem,
}: LeftNavContentLayoutProps) {
  return (
    <div className={`left-nav-content-layout ${className}`.trim()}>
      <aside className={`left-nav-content-layout__nav ${navClassName}`.trim()} aria-label={navAriaLabel}>
        {navHeader}
        <nav className="left-nav-content-layout__nav-list" aria-label={navAriaLabel}>
          {items.map((item) => {
            const isActive = item.key === activeKey;
            const selectItem = () => onSelect(item.key);

            if (renderItem) {
              return <div key={item.key}>{renderItem(item, isActive, selectItem)}</div>;
            }

            return (
              <button
                key={item.key}
                type="button"
                className={`left-nav-content-layout__item ${isActive ? "is-active" : ""}`}
                onClick={selectItem}
                title={item.label}
                aria-label={item.label}
              >
                <span className="left-nav-content-layout__item-icon" aria-hidden="true">
                  {item.icon ?? item.label.charAt(0).toUpperCase()}
                </span>
                <strong>{item.label}</strong>
                {item.description ? <small>{item.description}</small> : null}
              </button>
            );
          })}
        </nav>
        {navFooter}
      </aside>

      {wrapContent ? (
        <section className={`left-nav-content-layout__content ${contentClassName}`.trim()}>
          {renderContent(activeKey)}
        </section>
      ) : (
        renderContent(activeKey)
      )}
    </div>
  );
}
