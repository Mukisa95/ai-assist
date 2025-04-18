import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogSurface, 
  DialogTitle, 
  DialogBody, 
  DialogActions, 
  DialogContent, 
  Button,
  Input,
  Label,
  makeStyles,
  useId,
  Field,
  tokens,
  Dropdown,
  Option
} from '@fluentui/react-components';
import { saveApiKey, loadApiKey, saveModelName, loadModelName } from '../../utils/ApiKeyManager';
import * as geminiService from '../../services/geminiService';
import { useOfficeContext } from '../../context/OfficeContext';
import { GEMINI_MODELS } from '../../config';

/* global Office */

const useStyles = makeStyles({
  dialog: {
    width: '300px',  // Reduced width
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
  },
  apiKeyField: {
    marginBottom: '5px',
  },
  instructions: {
    fontSize: '12px',
    marginBottom: '5px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '5px',
    padding: '5px 10px 10px 10px',
  },
  saveButton: {
    minWidth: '60px',
  },
});

const SettingsDialog = ({ isOpen, onClose, onSettingsSaved }) => {
  const styles = useStyles();
  const { isOfficeReady } = useOfficeContext();
  const inputId = useId('api-key-input');
  const modelSelectId = useId('model-select-input');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(GEMINI_MODELS[0].key); // Default to the first model
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && isOfficeReady) {
      console.log("SettingsDialog: Office ready, loading settings...");
      const existingKey = loadApiKey();
      setApiKeyInput(existingKey || '');
      const existingModel = loadModelName();
      setSelectedModel(existingModel || GEMINI_MODELS[0].key);
      setIsSaveDisabled(true);
      const timer = setTimeout(() => setIsSaveDisabled(false), 500);
      return () => clearTimeout(timer);
    } else if (isOpen && !isOfficeReady) {
       console.log("SettingsDialog: Opened, but Office not ready yet.");
       setError("Office connection not ready. Please wait and try again.");
       setIsSaveDisabled(true);
    }
  }, [isOpen, isOfficeReady]);

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    setIsSaveDisabled(true);
    console.log("Attempting to save settings (API Key & Model)...");

    if (!isOfficeReady || !Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
        console.error("Cannot save: Office context or document settings not available.");
        console.log(`Debug: isOfficeReady=${isOfficeReady}, Office=${!!Office}, Office.context=${!!Office?.context}, O.c.document=${!!Office?.context?.document}, O.c.d.settings=${!!Office?.context?.document?.settings}`);
        setError('Failed to connect to Office document settings. Please ensure the add-in is properly loaded.');
        setIsSaving(false);
        setIsSaveDisabled(true);
        return;
    }

    try {
      const isValid = geminiService.initializeGeminiService(apiKeyInput, selectedModel);
      if (isValid) {
          await saveApiKey(apiKeyInput);
          await saveModelName(selectedModel);
          onSettingsSaved(true, apiKeyInput, selectedModel);
          onClose();
      } else {
          setError('Invalid API Key or Model initialization failed. Please check the key and try again.');
          onSettingsSaved(false);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError('An unexpected error occurred while saving settings.');
      onSettingsSaved(false);
    } finally {
      setIsSaving(false);
      setIsSaveDisabled(!isOfficeReady);
    }
  };
  
  const handleClose = () => {
    setError('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogSurface aria-describedby={undefined}>
        <DialogBody className={styles.body}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent className={styles.content}>
            <Field 
                label="Gemini API Key" 
                validationMessage={error || undefined}
                validationState={error ? 'error' : 'none'}
            >
              <Input
                id={inputId}
                type="password"
                placeholder="Enter your Gemini API Key"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                disabled={isSaving}
              />
            </Field>

            <Field label="Select AI Model">
              <Dropdown
                id={modelSelectId}
                value={selectedModel}
                onOptionSelect={(e, data) => setSelectedModel(data.optionValue)}
                disabled={isSaving}
              >
                {GEMINI_MODELS.map((model) => (
                  <Option key={model.key} value={model.key}>
                    {model.text}
                  </Option>
                ))}
              </Dropdown>
            </Field>

            <Label htmlFor={inputId} size="small">
              Your API key is stored locally using Office settings and is required to use the AI features.
            </Label>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={handleClose} disabled={isSaving || isSaveDisabled}>Cancel</Button>
            <Button 
                appearance="primary" 
                onClick={handleSave} 
                disabled={isSaving || !apiKeyInput || isSaveDisabled}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default SettingsDialog; 