import * as React from "react";
import PropTypes from "prop-types";
import { Settings24Regular } from "@fluentui/react-icons";
import { Button, Text, Switch, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "5px",
    borderBottom: "1px solid #ccc",
  },
  title: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  assistSwitch: {
    transform: 'scale(0.85)',
    transformOrigin: 'center center',
    '& span': {
      fontSize: '11px !important',
    }
  }
});

const Header = ({ title, onSettingsClick, isAssistModeActive, onAssistModeChange }) => {
  const styles = useStyles();

  return (
    <header className={styles.header}>
      <Text className={styles.title}>{title}</Text>
      <div className={styles.controls}>
        <Switch
          className={styles.assistSwitch}
          label="AI Assist"
          checked={isAssistModeActive}
          onChange={onAssistModeChange}
          size="small"
        />
        <Button 
          icon={<Settings24Regular fontSize={16} />} 
          appearance="transparent" 
          size="small" 
          onClick={onSettingsClick} 
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string,
  onSettingsClick: PropTypes.func.isRequired,
  isAssistModeActive: PropTypes.bool.isRequired,
  onAssistModeChange: PropTypes.func.isRequired,
};

export default Header;
