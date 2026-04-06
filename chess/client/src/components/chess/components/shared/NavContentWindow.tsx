import type { ReactNode } from "react";
import MainContentWindow from "./MainContentWindow";
import LeftNavContentLayout, { type LeftNavItem } from "./LeftNavContentLayout";

export type { LeftNavItem };

type NavContentWindowProps = {
  items: LeftNavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  renderContent: (activeKey: string) => ReactNode;
  ariaLabel?: string;
  embedded?: boolean;
  windowClassName?: string;
  layoutClassName?: string;
  navClassName?: string;
  contentClassName?: string;
  wrapContent?: boolean;
  navHeader?: ReactNode;
  navFooter?: ReactNode;
  renderItem?: (item: LeftNavItem, isActive: boolean, onSelect: () => void) => ReactNode;
};

export default function NavContentWindow({
  items,
  activeKey,
  onSelect,
  renderContent,
  ariaLabel = "Navigation",
  embedded = false,
  windowClassName = "",
  layoutClassName = "",
  navClassName = "",
  contentClassName = "",
  wrapContent = true,
  navHeader,
  navFooter,
  renderItem,
}: NavContentWindowProps) {
  const layout = (
    <LeftNavContentLayout
      items={items}
      activeKey={activeKey}
      onSelect={onSelect}
      renderContent={renderContent}
      navAriaLabel={ariaLabel}
      className={layoutClassName}
      navClassName={navClassName}
      contentClassName={contentClassName}
      wrapContent={wrapContent}
      navHeader={navHeader}
      navFooter={navFooter}
      renderItem={renderItem}
    />
  );

  if (embedded) {
    return layout;
  }

  return (
    <MainContentWindow className={windowClassName} ariaLabel={ariaLabel}>
      {layout}
    </MainContentWindow>
  );
}