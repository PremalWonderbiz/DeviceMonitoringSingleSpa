import * as styles from "@/styles/scss/PropertyPanel.module.scss";
import { useAccordionState } from "./AccordionVisibilityContext";

const TabList = ({ highlightedPaths, activeTab, setActiveTab }: any) => {
    const tabs = ["Static", "Health"];
    const accordionContext = useAccordionState();
    
    const changeActiveTab = (tab: string) => {
        setActiveTab(tab);
        if (accordionContext?.state) {
            accordionContext?.toggle(tab!,true);
        }
    };    

    const shouldHighlightTitle = (activeTab=="Health" && highlightedPaths.length > 0) && accordionContext?.getState(activeTab) === false;

    return (
        <ul className={styles.tabListUL}>
            {tabs.map((tab) => (
                <li key={tab}
                    onClick={(event: any) => {
                        event.stopPropagation();
                        changeActiveTab(tab);
                    }}
                    className={`${styles.tabListLi} ${activeTab === tab ? styles.tabListLiActive : null} ${shouldHighlightTitle && tab == "Health" ? styles.highlightedTitle : ""}`}
                >
                    {tab}
                </li>
            ))}
        </ul>
    );
}

export default TabList;