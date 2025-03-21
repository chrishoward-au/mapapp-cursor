import { ReactNode, useState } from 'react';
import styles from './TabPanel.module.css';

interface TabPanelProps {
  tabs: {
    id: string;
    label: string;
    content: ReactNode;
  }[];
}

export const TabPanel = ({ tabs }: TabPanelProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={styles.tabPanel}>
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}; 