import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Field,
  Dropdown,
  Option,
  Spinner,
  Text,
  Switch,
  RadioGroup,
  Radio,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { REWRITING_STYLES, LENGTH_OPTIONS, AUDIENCES } from '../../config';
import { generateDocument, answerMultipleQuestions } from '../../services/geminiService';
import { insertFormattedTextAtSelection } from '../../utils/wordUtils';
import { useScrollToResponse } from '../../utils/uiUtils';
import ExpandingTextarea from './common/ExpandingTextarea';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '5px',
    gap: '6px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  optionsRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    marginTop: '2px',
    width: '100%',
    flexWrap: 'wrap',
  },
  optionField: {
    flex: '1 1 120px',
    maxWidth: 'calc(33% - 8px)', // Adjusted for 3 columns
    minWidth: '0',
  },
  optionLabel: {
    fontSize: '11px',
    marginBottom: '2px',
    display: 'block',
    whiteSpace: 'nowrap',
  },
  optionDropdown: {
    width: '100%',
    minWidth: '0',
  },
  attachmentContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '2px',
    height: '20px',
  },
  attachmentText: {
    fontStyle: 'italic',
    color: tokens.colorNeutralForeground2,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
    fontSize: '11px',
  },
  resultContainer: {
    marginTop: '5px',
  },
  mainActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '8px', // Increased margin
    minHeight: '24px', // Ensure row has height
    alignItems: 'center',
    gap: '6px', // Added gap
  },
  contextOptions: {
    marginTop: '2px',
    marginBottom: '2px',
    display: 'flex',
    width: '100%',
  },
  radioOptionContainer: {
    display: 'flex',
    gap: '12px',
    padding: '6px 8px',
    background: '#f9f9fc',
    borderRadius: '6px',
    border: '1px solid #e8e8f7',
    width: '100%',
  },
  compactSwitch: {
    transform: 'scale(0.85)',
    transformOrigin: 'left center',
    marginRight: '2px',
    '& span': {
      fontSize: '11px !important',
    },
  },
  fieldGroup: {
    marginBottom: '3px',
  },
  aiResponseTextContent: {
    whiteSpace: 'pre-wrap', 
    wordWrap: 'break-word', 
    lineHeight: '1.4',
    padding: '5px',
    fontSize: '12px',
  },
  responseBox: { // Adding basic response box styles here since ExpandingResponseBox is not used
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

const HelpMeWriteUI = ({ assistContext, allowContextSelection, onAllowContextSelectionChange }) => {
  const styles = useStyles();
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(REWRITING_STYLES[0].key);
  const [selectedLength, setSelectedLength] = useState(LENGTH_OPTIONS[2].key);
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contextUsage, setContextUsage] = useState('general');
  
  const responseAreaRef = useRef(null);

  const contextText = assistContext?.selectedText;

  useEffect(() => {
    if (!allowContextSelection || !contextText) {
      setContextUsage('general');
    }
  }, [allowContextSelection, contextText]);

  useScrollToResponse(responseAreaRef, isLoading);

  const handleGenerate = async () => {
    setError('');
    if (!prompt && !(allowContextSelection && contextText)) {
        setError('Please enter a prompt or select context to use.');
        return;
    }
    if (!contextText && contextUsage === 'answerQuestions') {
      setError('Context text (containing questions) is required for this option.');
      return;
    }
    setIsLoading(true);
    setGeneratedText('');
    try {
      let result = '';
      if (allowContextSelection && contextText && contextUsage === 'answerQuestions') {
        console.log("Calling answerMultipleQuestions service...");
        result = await answerMultipleQuestions(contextText, prompt); // Pass prompt as instructions
      } else {
        console.log("Calling generateDocument service...");
        let finalPrompt = prompt;
        if (allowContextSelection && contextText) {
          finalPrompt = `Use the following text as context:\n"${contextText}"\n\nNow, follow these instructions:\n${prompt || '(No specific prompt provided, generate based on context)'}`;
        }
        result = await generateDocument('text', finalPrompt, selectedStyle, selectedLength, selectedAudience);
      }
      setGeneratedText(result);
    } catch (err) {
      console.error("Error during HelpMeWrite generation:", err);
      setError(`An error occurred during ${contextUsage === 'answerQuestions' ? 'answering questions' : 'generation'}.`);
      setGeneratedText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeep = async () => {
    if (!generatedText) return;
    setIsLoading(true);
    setError('');
    try {
      await insertFormattedTextAtSelection(generatedText);
      setGeneratedText('');
      setPrompt('');
      onAllowContextSelectionChange(false); // Reset context usage on keep
    } catch (err) {
      console.error("Error inserting generated text:", err);
      setError('Failed to insert text into document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setGeneratedText('');
    setError('');
    // Keep prompt and context settings as user might want to regenerate
  };

  const handleContextToggle = (ev, data) => {
    onAllowContextSelectionChange(data.checked);
    if (!data.checked) {
      console.log("Context selection disabled.");
      setContextUsage('general'); // Reset usage type if context is disabled
    }
  };

  console.log("Rendering HelpMeWriteUI:");
  console.log("  allowContextSelection:", allowContextSelection);
  console.log("  contextText (snippet):", contextText?.substring(0, 30));
  console.log("  Condition Met (allowContextSelection && contextText):", !!(allowContextSelection && contextText));

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={300}>Help Me Write</Text>
      <Field 
        label={contextUsage === 'answerQuestions' ? "Optional: Add instructions for answering" : "What do you want to write?"}
        className="field-group"
      >
        <ExpandingTextarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={contextUsage === 'answerQuestions' ? "e.g., Answer concisely, provide sources..." : "e.g., Write a paragraph about..."}
          disabled={isLoading || !!generatedText} // Disable when loading or showing result
        />
      </Field>

      <div className={styles.attachmentContainer}>
        <Switch 
          className={styles.compactSwitch}
          label="Use Context?" 
          checked={allowContextSelection} 
          onChange={handleContextToggle} 
          disabled={isLoading || !!generatedText} // Disable when loading or showing result
          size="small"
        />
        {allowContextSelection && contextText && (
          <Text className={styles.attachmentText} title={contextText}>
            Context: "{contextText.substring(0, 30)}..."
          </Text>
        )}
        {allowContextSelection && !contextText && (
          <Text className={styles.attachmentText}>
            (Select text in document)
          </Text>
        )}
      </div>

      {allowContextSelection && contextText && (
        <div className={styles.contextOptions}>
          <div className={styles.radioOptionContainer}>
            <RadioGroup 
              value={contextUsage}
              onChange={(e, data) => setContextUsage(data.value)}
              layout="horizontal"
              className="compact-radio-group"
              disabled={isLoading || !!generatedText} // Disable when loading or showing result
            >
              <Radio 
                className="radio-option" 
                value="general" 
                label="Use as General Context"
                size="small" 
              />
              <Radio 
                className="radio-option" 
                value="answerQuestions" 
                label="Answer Questions in Context"
                size="small" 
              />
            </RadioGroup>
          </div>
        </div>
      )}

      {contextUsage !== 'answerQuestions' && (
        <div className={`${styles.optionsRow} options-row`}>
          <div className={styles.optionField}>
            <Text className={styles.optionLabel}>Style</Text>
            <Dropdown 
              value={selectedStyle} 
              onOptionSelect={(e, data) => setSelectedStyle(data.optionValue)}
              disabled={isLoading || !!generatedText}
              size="small"
              appearance="outline"
              className={styles.optionDropdown}
            >
              {REWRITING_STYLES.map((style) => (
                <Option key={style.key} value={style.key}>
                  {style.text}
                </Option>
              ))}
            </Dropdown>
          </div>
          <div className={styles.optionField}>
            <Text className={styles.optionLabel}>Length</Text>
            <Dropdown 
              value={selectedLength} 
              onOptionSelect={(e, data) => setSelectedLength(data.optionValue)}
              disabled={isLoading || !!generatedText}
              size="small"
              appearance="outline"
              className={styles.optionDropdown}
            >
              {LENGTH_OPTIONS.map((length) => (
                <Option key={length.key} value={length.key}>
                  {length.text}
                </Option>
              ))}
            </Dropdown>
          </div>
          <div className={styles.optionField}>
            <Text className={styles.optionLabel}>Audience</Text>
            <Dropdown 
              value={selectedAudience} 
              onOptionSelect={(e, data) => setSelectedAudience(data.optionValue)}
              disabled={isLoading || !!generatedText}
              size="small"
              appearance="outline"
              className={styles.optionDropdown}
            >
              {AUDIENCES.map((audience) => (
                <Option key={audience.key} value={audience.key}>
                  {audience.text}
                </Option>
              ))}
            </Dropdown>
          </div>
        </div>
      )}

      {error && <div className="ai-error">{error}</div>}

      {/* --- Combined Button Row --- */}
      <div className={styles.mainActions}>
        {isLoading ? (
          <Spinner size="tiny" />
        ) : generatedText ? (
          <>
            <Button onClick={handleDiscard} size="small" disabled={isLoading}>Discard</Button>
            <Button onClick={handleGenerate} size="small" disabled={isLoading}>Regenerate</Button>
            <Button appearance="primary" onClick={handleKeep} size="small" disabled={isLoading}>Keep</Button>
          </>
        ) : (
          <Button 
            appearance="primary" 
            onClick={handleGenerate} 
            disabled={isLoading || (contextUsage === 'answerQuestions' && !contextText) || (!prompt && !(allowContextSelection && contextText))}
            size="small"
          >
            Generate
          </Button>
        )}
      </div>

      <div ref={responseAreaRef}> 
        {/* Only show response box if not loading and text exists */}
        {!isLoading && generatedText && (
          <div className={styles.responseBox}>
            <div className={styles.responseHeader}>
              <Text weight="semibold">Suggestion</Text>
            </div>
            <div className={styles.aiResponseTextContent}>
              {generatedText}
            </div>
            {/* Action buttons moved to mainActions row */}
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpMeWriteUI; 