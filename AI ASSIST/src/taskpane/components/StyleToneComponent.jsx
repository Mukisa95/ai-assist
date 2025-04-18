import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { 
  Button, 
  Field, 
  Dropdown, 
  Option, 
  Spinner, 
  Text,
  makeStyles 
} from "@fluentui/react-components";
import { replaceSelectedText, insertComment } from "../../utils/wordUtils";
import { analyzeTone } from "../../services/geminiService";
import { TONES, AUDIENCES } from "../../config";
import { useSelection } from "../contexts/SelectionContext";
import { useScrollToResponse } from "../../utils/uiUtils";
import ExpandingTextarea from "./common/ExpandingTextarea";
import ExpandingResponseBox from "./common/ExpandingResponseBox";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "5px",
    gap: "8px",
  },
  buttonRow: {
    display: "flex",
    gap: "6px",
    marginTop: "8px",
    minHeight: "24px",
    alignItems: "center",
  },
  optionsRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    width: "100%",
    flexWrap: "wrap",
  },
  optionField: {
    flex: "1 1 120px",
    maxWidth: "calc(50% - 6px)",
    minWidth: "0",
  },
  aiResponseTextContent: {
    whiteSpace: 'pre-wrap', 
    wordWrap: 'break-word', 
    lineHeight: '1.4',
    padding: '5px',
    fontSize: '12px',
  }
});

const StyleToneComponent = () => {
  const { selectedText: contextSelectedText, refreshSelection } = useSelection();
  
  const [selectedText, setSelectedText] = useState("");
  const [selectedTone, setSelectedTone] = useState("formal");
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const styles = useStyles();
  const responseAreaRef = useRef(null);

  useEffect(() => {
    if (contextSelectedText) {
      setSelectedText(contextSelectedText);
    }
  }, [contextSelectedText]);

  useScrollToResponse(responseAreaRef, isLoading);

  const handleAnalyze = async () => {
    if (!selectedText) {
      setError("Please select text in the document first.");
      return;
    }
    setIsLoading(true);
    setError("");
    setResult("");
    try {
      const suggestions = await analyzeTone(selectedText, selectedTone, selectedAudience);
      setResult(suggestions);
    } catch (error) {
      setError("An error occurred: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setError("");
    const text = await refreshSelection();
    if (!text) {
      setError("No text selected. Please select text in the document.");
    }
  };

  const handleApply = async () => {
    if (!result) return;
    setIsLoading(true);
    try {
      await replaceSelectedText(result);
      setResult("");
    } catch (error) {
      setError("Failed to apply changes: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDiscard = () => {
      setResult("");
      setError("");
  };

  const handleAddComment = async () => {
    if (!result) return;
    setIsLoading(true);
    try {
      await insertComment(result);
      setResult("");
    } catch (error) {
      setError("Failed to add comment: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneChange = (e, data) => {
    setSelectedTone(data.optionValue);
  };

  const handleAudienceChange = (e, data) => {
    setSelectedAudience(data.optionValue);
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Writing Style and Tone Suggestions</Text>
      
      <Field label="Selected Text">
        <ExpandingTextarea 
          value={selectedText} 
          onChange={e => setSelectedText(e.target.value)}
          placeholder="Select text in the document or type here..."
          disabled={isLoading || !!result}
        />
      </Field>
      
      <div className={styles.optionsRow}>
        <div className={styles.optionField}>
          <Field label="Target Tone">
            <Dropdown 
              value={selectedTone} 
              onOptionSelect={handleToneChange}
              disabled={isLoading || !!result}
            >
              {TONES.map((tone) => (
                <Option key={tone.key} value={tone.key}>
                  {tone.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
        
        <div className={styles.optionField}>
          <Field label="Target Audience">
            <Dropdown 
              value={selectedAudience} 
              onOptionSelect={handleAudienceChange}
              disabled={isLoading || !!result}
            >
              {AUDIENCES.map((audience) => (
                <Option key={audience.key} value={audience.key}>
                  {audience.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
      </div>
      
      {error && <div className="ai-error">{error}</div>}
      
      <div className={styles.buttonRow}>
         {isLoading ? (
          <Spinner size="tiny" />
        ) : result ? (
          <>
            <Button onClick={handleDiscard} size="small" disabled={isLoading}>Discard</Button>
            <Button onClick={handleAddComment} size="small" disabled={isLoading}>Add Comment</Button>
            <Button onClick={handleAnalyze} size="small" disabled={isLoading}>Regenerate</Button>
            <Button appearance="primary" onClick={handleApply} size="small" disabled={isLoading}>Apply Changes</Button>
          </>
        ) : (
          <>
            <Button appearance="primary" onClick={handleAnalyze} size="small" disabled={isLoading || !selectedText}>Analyze</Button>
            <Button onClick={handleRefresh} size="small" disabled={isLoading}>Refresh Selection</Button>
          </>
        )}
      </div>
      
      <div ref={responseAreaRef}>
        {!isLoading && result && (
          <ExpandingResponseBox
            title="Style & Tone Suggestions"
            content={result}
          />
        )}
      </div>
    </div>
  );
};

export default StyleToneComponent; 