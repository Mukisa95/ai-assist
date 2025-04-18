import * as React from "react";
import { useState, useEffect, useRef } from "react";
import {
  FluentProvider,
  webLightTheme,
  Button,
  Textarea,
  makeStyles,
  shorthands,
  tokens,
  MessageBar, 
  MessageBarTitle, 
  MessageBarBody, 
  Link,
  Switch,
  Text
} from "@fluentui/react-components";
import PropTypes from "prop-types";
import Header from "./Header";
import Navigation, { NavigationTab } from "./Navigation";
import StyleToneComponent from "./StyleToneComponent";
import RewriteComponent from "./RewriteComponent";
import AutocompleteComponent from "./AutocompleteComponent";
import SummarizeComponent from "./SummarizeComponent";
import GenerateDocumentComponent from "./GenerateDocumentComponent";
import SettingsDialog from "./SettingsDialog";
import { Settings24Regular } from "@fluentui/react-icons";
import * as geminiService from "../../services/geminiService";
import { loadApiKey, loadModelName } from "../../utils/ApiKeyManager";
import { useOfficeContext } from "../../context/OfficeContext";
import { useSelection } from "../contexts/SelectionContext";
import HelpMeWriteUI from "./HelpMeWriteUI";
import AnswerQuestionUI from "./AnswerQuestionUI";
import EditSelectionUI from "./EditSelectionUI";
import { GEMINI_MODELS } from "../../config";

/* global Office, Word, OfficeExtension */

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    ...shorthands.padding("5px"),
    boxSizing: "border-box",
  },
  content: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    ...shorthands.overflow("auto"),
    marginTop: '5px',
  },
  footer: {
    marginTop: "auto",
    paddingTop: tokens.spacingVerticalXS,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  apiKeyMessage: {
      marginBottom: tokens.spacingVerticalXS,
  }
});

const App = ({ title, initialApiKey }) => {
  const styles = useStyles();
  const { isOfficeReady } = useOfficeContext();
  const { selectedText } = useSelection(); // Use the selection context
  const [selectedTab, setSelectedTab] = useState(NavigationTab.StyleTone);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isAssistModeActive, setIsAssistModeActive] = useState(false);
  const [assistModeType, setAssistModeType] = useState('none');
  const [assistContext, setAssistContext] = useState(null);
  const [allowHMWContextSelection, setAllowHMWContextSelection] = useState(false);
  
  const debounceTimeoutRef = useRef(null);
  // ---> Refs to hold latest state values <--- 
  const assistModeTypeRef = useRef(assistModeType);
  const allowHMWContextSelectionRef = useRef(allowHMWContextSelection);

  // ---> Keep refs synced with state <--- 
  useEffect(() => {
    assistModeTypeRef.current = assistModeType;
  }, [assistModeType]);

  useEffect(() => {
    allowHMWContextSelectionRef.current = allowHMWContextSelection;
  }, [allowHMWContextSelection]);

  // React to selection changes from SelectionContext
  useEffect(() => {
    console.log(`App: SelectionContext changed - isAssistModeActive: ${isAssistModeActive}, selectedText: '${selectedText}', current assistModeType: ${assistModeTypeRef.current}`);
    if (isAssistModeActive) {
      if (selectedText) {
        console.log("App: Selection detected with content.");
        // Check if we are already in HelpMeWrite mode AND context is allowed
        if (assistModeTypeRef.current === 'helpMeWrite' && allowHMWContextSelectionRef.current) {
          console.log("App: Updating HelpMeWrite context only.");
          setAssistContext({ selectedText });
        } else {
          console.log("App: Switching to EditSelection mode.");
          setAssistModeType('editSelection');
          setAssistContext({ selectedText });
          // Explicitly disable HMW context selection when switching to Edit
          setAllowHMWContextSelection(false);
        }
      } else {
        console.log("App: Selection is empty. Determining context...");
        // When selection becomes empty, we need to determine the appropriate context
        // We might want to revert to 'helpMeWrite' or 'none' depending on cursor position
        // However, the processContextChange function was designed for this but removed.
        // For now, let's tentatively switch to 'helpMeWrite' if selection is empty, 
        // assuming a click implies wanting to write.
        // This might need refinement based on processContextChange logic if re-enabled.
        if (assistModeTypeRef.current !== 'helpMeWrite') {
          console.log("App: Selection empty, switching to HelpMeWrite mode.");
          setAssistModeType('helpMeWrite');
          setAssistContext({}); // Reset context for HMW
        } else {
          console.log("App: Selection empty, already in HelpMeWrite mode.");
        }
      }
    } else {
      console.log("App: Selection changed but AI Assist is not active.");
    }
  }, [selectedText, isAssistModeActive, allowHMWContextSelection]); // Dependency array updated

  // Effect to initialize Gemini service on startup
  useEffect(() => {
    if (isOfficeReady) {
      console.log("App.jsx: Office is ready, attempting to load settings and initialize Gemini...");
      const savedApiKey = loadApiKey(); // Use the loader function
      const savedModelName = loadModelName();
      const modelToUse = savedModelName || GEMINI_MODELS[0].key; // Use saved or default

      if (savedApiKey) {
        console.log(`App.jsx: Found API Key. Initializing with model: ${modelToUse}`);
        const initialized = geminiService.initializeGeminiService(savedApiKey, modelToUse);
        setIsApiKeySet(initialized);
        if (!initialized) {
          console.error("App.jsx: Initializing Gemini failed with saved API key.");
          // Optionally show an error message to the user
        }
      } else {
        setIsApiKeySet(false);
        console.log("App.jsx: No API key found in settings.");
      }
    } else {
      console.log("App.jsx: Office not ready yet for settings load.");
    }
  }, [isOfficeReady]); // Removed initialApiKey dependency, using loadApiKey now

  // Note: We're no longer setting up our own selection handler since we're using SelectionContext
  // The selection context is already handling the document selection changed events

  // Callback for when settings are saved in the dialog
  const handleSettingsSaved = (success, apiKey, modelName) => {
    console.log(`App.jsx: SettingsDialog saved. Success: ${success}, Key: ${apiKey ? '***' : 'N/A'}, Model: ${modelName}`);
    setIsApiKeySet(success); 
    setShowSettingsDialog(false); // Close dialog on save attempt
  };

  const handleAssistModeChange = (ev, data) => {
    const isActive = data.checked;
    setIsAssistModeActive(isActive);
    console.log(`App: AI Assist Mode Toggled: ${isActive}`);
    if (isActive) {
      // When activating, check current selection to set initial mode
      console.log(`App: AI Assist activated. Current selection: '${selectedText}'`);
      if (selectedText) {
        console.log("App: Activating AI Assist with selection, setting mode to EditSelection.");
        setAssistModeType('editSelection');
        setAssistContext({ selectedText });
      } else {
        console.log("App: Activating AI Assist without selection, setting mode to HelpMeWrite.");
        setAssistModeType('helpMeWrite');
        setAssistContext({});
      }
    } else {
      // When deactivating
      console.log("App: Deactivating AI Assist.");
      setAssistModeType('none');
      setAssistContext(null);
      setAllowHMWContextSelection(false); // Reset context allowance
    }
  };

  // Determine what content to show
  let mainContent;
  if (isAssistModeActive) {
    console.log(`App: Rendering Assist Mode UI. Current Mode: ${assistModeType}`);
    // --- AI Assist Mode Active --- 
    switch (assistModeType) {
      case 'editSelection':
        mainContent = <EditSelectionUI assistContext={assistContext} />;
        break;
      case 'answerQuestion': // This case might not be reachable without processContextChange
        console.warn("App: Rendering AnswerQuestionUI, but context detection logic might be missing.");
        mainContent = <AnswerQuestionUI assistContext={assistContext} />;
        break;
      case 'helpMeWrite':
        mainContent = (
             <HelpMeWriteUI 
                assistContext={assistContext} 
                allowContextSelection={allowHMWContextSelection}
                onAllowContextSelectionChange={setAllowHMWContextSelection}
             />
        );
        break;
      default: // 'none' or unexpected
        mainContent = (
            <div>
                <Text><i>AI Assist Active: Select text or click in document to get started...</i></Text>
            </div>
        );
    }
  } else {
    // --- Standard Tab Mode --- 
    switch (selectedTab) {
      case NavigationTab.StyleTone:
        mainContent = <StyleToneComponent />;
        break;
      case NavigationTab.Rewrite:
        mainContent = <RewriteComponent />;
        break;
      case NavigationTab.Autocomplete:
        mainContent = <AutocompleteComponent />;
        break;
      case NavigationTab.Summarize:
        mainContent = <SummarizeComponent />;
        break;
      case NavigationTab.GenerateDoc:
        mainContent = <GenerateDocumentComponent />;
        break;
      default:
        mainContent = <div>Select a feature</div>;
    }
  }

  if (!isOfficeReady) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div>Initializing Office connection...</div>
      </FluentProvider>
    );
  }

  return (
    <FluentProvider theme={webLightTheme} style={{ fontSizeIncrement: -1 }}>
      <div className={styles.root}>
        <Header 
          title={title}
          onSettingsClick={() => setShowSettingsDialog(true)}
          isAssistModeActive={isAssistModeActive}
          onAssistModeChange={handleAssistModeChange}
        />
        
        {!isApiKeySet ? (
          <MessageBar className={styles.apiKeyMessage}>
            <MessageBarTitle>API Key Required</MessageBarTitle>
            <MessageBarBody>
              Please configure your API key in <Link onClick={() => setShowSettingsDialog(true)}>Settings</Link>.
            </MessageBarBody>
          </MessageBar>
        ) : (
          <div className={styles.content}>
            {/* Only show navigation + component UI when NOT in AI Assist mode */}
            {!isAssistModeActive && (
              <>
                <Navigation 
                  selectedTab={selectedTab} 
                  onTabSelect={setSelectedTab} 
                />
                {mainContent}
              </>
            )}
            
            {/* Show the appropriate UI based on assist mode type when in AI Assist mode */}
            {isAssistModeActive && mainContent}
          </div>
        )}
        
        <div className={styles.footer}>
          <Text size={100}>
            {assistModeType !== 'none' ? `Mode: ${assistModeType}` : ''}
          </Text>
        </div>
        
        {showSettingsDialog && (
          <SettingsDialog
            isOpen={showSettingsDialog}
            onClose={() => setShowSettingsDialog(false)}
            onSettingsSaved={handleSettingsSaved} 
          />
        )}
      </div>
    </FluentProvider>
  );
};

App.propTypes = {
  title: PropTypes.string,
  initialApiKey: PropTypes.string,
};

export default App;
