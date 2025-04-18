import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Text,
  Dropdown,
  Option,
  Field,
  Spinner,
  makeStyles,
  tokens,
  RadioGroup, // For selecting action
  Radio
} from '@fluentui/react-components';
import { TONES, REWRITING_STYLES } from '../../config';
import { rewriteText, analyzeTone } from '../../services/geminiService';
import { replaceSelectedText } from '../../utils/wordUtils';
import { useScrollToResponse } from '../../utils/uiUtils';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '5px',
    gap: '8px',
  },
  selectionPreview: {
    padding: '5px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    fontSize: '12px',
    maxHeight: '80px',
    overflow: 'auto',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  buttonRow: {
    display: "flex",
    gap: "6px", 
    marginTop: "8px",
    minHeight: "24px",
    alignItems: "center",
    justifyContent: 'flex-end', // Align buttons to the right
  },
  aiResponseTextContent: { // Style for the new text container
    whiteSpace: 'pre-wrap', 
    wordWrap: 'break-word', 
    lineHeight: '1.4',
    padding: '5px',
    fontSize: '12px',
  },
  responseBox: { // Styles copied from compact-styles.css / HelpMeWriteUI
    background: 'linear-gradient(145deg, #ffffff, #f6f6fd)',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 120, 212, 0.1)',
    padding: '8px 10px',
    marginTop: '5px',
    maxHeight: '40vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px',
    gap: '5px',
  },
});

const EditSelectionUI = ({ assistContext }) => {
  const styles = useStyles();
  const selectedText = assistContext?.selectedText || "No text selected";
  const [editAction, setEditAction] = useState('rewrite'); // 'rewrite', 'tone'
  const [selectedTone, setSelectedTone] = useState(TONES[0].key);
  const [selectedStyle, setSelectedStyle] = useState(REWRITING_STYLES[0].key);
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const responseAreaRef = useRef(null); // Ref for the response area

  useScrollToResponse(responseAreaRef, isLoading);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    setResultText('');
    console.log(`Performing ${editAction} on: ${selectedText.substring(0,50)}...`);
    try {
      let generatedResult = '';
      switch (editAction) {
        case 'rewrite':
          generatedResult = await rewriteText(selectedText, selectedStyle);
          break;
        case 'tone':
          generatedResult = await analyzeTone(selectedText, selectedTone);
          break;
      }
      setResultText(generatedResult);
    } catch (err) {
        console.error(`Error during ${editAction}:`, err);
        setError(`An error occurred during ${editAction}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!resultText) return;
    setIsLoading(true);
    setError('');
    try {
        await replaceSelectedText(resultText);
        setResultText('');
    } catch (err) {
        console.error("Error replacing text:", err);
        setError("Failed to replace text in document.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setResultText('');
    setError('');
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Edit Selection</Text>
      <Text size={100}>Selected Text:</Text>
      <div className={styles.selectionPreview}>{selectedText}</div>

      <div className={styles.optionsRow}>
        <RadioGroup 
          value={editAction} 
          onChange={(e, data) => setEditAction(data.value)} 
          layout="horizontal"
          disabled={isLoading || !!resultText} // Disable
        >
          <Radio value="rewrite" label="Rewrite" size="small"/>
          <Radio value="tone" label="Style & Tone" size="small"/>
        </RadioGroup>

        {editAction === 'rewrite' && (
          <Field label="Style">
            <Dropdown 
              value={selectedStyle} 
              onOptionSelect={(e, data) => setSelectedStyle(data.optionValue)} 
              disabled={isLoading || !!resultText} // Disable
              size="small"
            >
              {REWRITING_STYLES.map((s) => <Option key={s.key} value={s.key}>{s.text}</Option>)}
            </Dropdown>
          </Field>
        )}
        {editAction === 'tone' && (
          <Field label="Tone">
            <Dropdown 
              value={selectedTone} 
              onOptionSelect={(e, data) => setSelectedTone(data.optionValue)} 
              disabled={isLoading || !!resultText} // Disable
              size="small"
            >
              {TONES.map((t) => <Option key={t.key} value={t.key}>{t.text}</Option>)}
            </Dropdown>
          </Field>
        )}
      </div>

      {error && <div className="ai-error">{error}</div>}
      
      {/* --- Combined Button Row --- */}
      <div className={styles.buttonRow}>
        {isLoading ? (
          <Spinner size="tiny" />
        ) : resultText ? (
          <>
            <Button onClick={handleDiscard} size="small" disabled={isLoading}>Discard</Button>
            <Button onClick={handleGenerate} size="small" disabled={isLoading}>Regenerate</Button>
            <Button appearance="primary" onClick={handleReplace} size="small" disabled={isLoading}>Replace</Button>
          </>
        ) : (
          <Button 
            appearance="primary" 
            onClick={handleGenerate} 
            disabled={isLoading || !selectedText || selectedText === "No text selected"}
            size="small"
          >
            Generate Suggestion
          </Button>
        )}
      </div>

      <div ref={responseAreaRef}>
        {/* Only show response box if not loading and text exists */}
        {!isLoading && resultText && (
          <div className={styles.responseBox}>
            <div className={styles.responseHeader}>
              <Text weight="semibold">AI Suggestion</Text>
            </div>
            <div className={styles.aiResponseTextContent}>
              {resultText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSelectionUI; 