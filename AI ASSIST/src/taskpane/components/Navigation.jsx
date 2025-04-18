import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { 
  Tab, 
  TabList,
  SelectTabEvent,
  SelectTabData 
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    width: '100%',
    marginBottom: '10px',
  },
  tabList: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '4px',
  },
  customTab: {
    minWidth: '0',
    textAlign: 'center',
    padding: '6px 8px',
    border: '1px solid #d1d1d1',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    '&:hover': {
      backgroundColor: '#e5e5e5',
      borderTopColor: '#b3b3b3',
      borderRightColor: '#b3b3b3',
      borderBottomColor: '#b3b3b3',
      borderLeftColor: '#b3b3b3',
    },
    '&[data-selected=true]': {
      backgroundColor: '#e0f0ff',
      borderTopColor: '#0078d4',
      borderRightColor: '#0078d4',
      borderBottomColor: '#0078d4',
      borderLeftColor: '#0078d4',
      color: '#0078d4',
      fontWeight: '600',
    }
  }
});

export const NavigationTab = {
  StyleTone: "styletone",
  Rewrite: "rewrite",
  Autocomplete: "autocomplete",
  Summarize: "summarize",
  GenerateDoc: "generatedoc"
};

const Navigation = (props) => {
  const { selectedTab, onTabSelect } = props;
  const styles = useStyles();

  const handleTabSelect = (event, data) => {
    onTabSelect(data.value);
  };

  return (
    <div className={styles.container}>
      <TabList 
        selectedValue={selectedTab}
        onTabSelect={handleTabSelect}
        className={styles.tabList}
        size="small"
        appearance="subtle"
      >
        <Tab value={NavigationTab.StyleTone} className={styles.customTab}>
          Style
        </Tab>
        <Tab value={NavigationTab.Rewrite} className={styles.customTab}>
          Rewrite
        </Tab>
        <Tab value={NavigationTab.Autocomplete} className={styles.customTab}>
          Complete
        </Tab>
        <Tab value={NavigationTab.Summarize} className={styles.customTab}>
          Sum
        </Tab>
        <Tab value={NavigationTab.GenerateDoc} className={styles.customTab}>
          Generate
        </Tab>
      </TabList>
    </div>
  );
};

export default Navigation; 