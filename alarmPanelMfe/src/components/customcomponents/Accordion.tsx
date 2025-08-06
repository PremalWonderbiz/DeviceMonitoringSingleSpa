import { ReactNode, useEffect, useState } from 'react';
import * as styles from "@/styles/scss/Accordion.module.scss";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAccordionState } from '@/components/customcomponents/AccordionVisibilityContext';

type AccordionProps = {
  title: any;
  children: ReactNode;
  defaultOpen?: boolean;
  bgColor?: string;
  isTabList?:boolean;
  keyPath? : any;
};

export default function Accordion({
  title,
  children,
  defaultOpen = true,
  isTabList = false,
  bgColor = "#fff",
  keyPath,
}: AccordionProps) {
  const context = useAccordionState();

  const [localOpen, setLocalOpen] = useState(defaultOpen);

  const isContextControlled = !!keyPath;
  const isOpen = isContextControlled
    ? context?.getState(keyPath) ?? defaultOpen
    : localOpen;

  const toggleOpen = () => {
    if (isContextControlled) {
      context?.toggle(keyPath!, !isOpen);
    } else {
      setLocalOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isContextControlled) {
      context?.register(keyPath!, defaultOpen);
    }
  }, [keyPath]);

  return (
    <div className={styles.accordion} style={{ backgroundColor: bgColor }}>
      <div
        className={`${styles.header} ${isTabList ? styles.tabListHeader : ""}`}
        onClick={toggleOpen}
      >
        <div>{title}</div>
        <span>{isOpen ? <ChevronUp /> : <ChevronDown />}</span>
      </div>
      <div className={`${styles.content} ${isOpen ? styles.open : ""}`}>
        {children}
      </div>
    </div>
  );
}

