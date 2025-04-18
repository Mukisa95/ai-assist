import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Button, 
  Field, 
  Dropdown,
  Option,
  Spinner, 
  Text,
  makeStyles 
} from "@fluentui/react-components";
import { getSelectedText, insertTextAtEnd, getDocumentText } from "../../utils/wordUtils";
import { summarizeText } from "../../services/geminiService";
import { AUDIENCES } from "../../config";
import { useSelection } from "../contexts/SelectionContext";
import ExpandingTextarea from "./common/ExpandingTextarea";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    gap: "10px",
  },
  resultContainer: {
    marginTop: "10px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
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
});

const summaryStyles = [
  { key: 'concise', text: 'Concise' },
  { key: 'bullet_points', text: 'Bullet Points' },
  { key: 'detailed', text: 'Detailed' },
  { key: 'executive', text: 'Executive Summary' },
];

const SummarizeComponent = () => {
  const { selectedText: contextSelectedText, refreshSelection } = useSelection();
  const [contentToSummarize, setContentToSummarize] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("concise");
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useEntireDocument, setUseEntireDocument] = useState(false);
  const styles = useStyles();

  // Update from selection context
  useEffect(() => {
    if (contextSelectedText) {
      setContentToSummarize(contextSelectedText);
    }
  }, [contextSelectedText]);

  const handleSummarize = async () => {
    let textToSummarize = contentToSummarize;
    
    if (useEntireDocument) {
      textToSummarize = await getDocumentText();
      setContentToSummarize(textToSummarize);
    }
    
    if (!textToSummarize) {
      setSummary("Please enter or select text to summarize first.");
      return;
    }

    setIsLoading(true);
    try {
      const summaryText = await summarizeText(textToSummarize, selectedStyle, selectedAudience);
      setSummary(summaryText);
    } catch (error) {
      setSummary("An error occurred: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    const text = await refreshSelection();
    if (text) {
      setContentToSummarize(text);
      setUseEntireDocument(false);
    } else {
      setSummary("No text selected. Use 'Get Entire Document' or select text in the document.");
    }
  };

  const handleGetEntireDocument = async () => {
    try {
      const docText = await getDocumentText();
      setContentToSummarize(docText);
      setUseEntireDocument(true);
    } catch (error) {
      setSummary("Error getting document text: " + error.message);
    }
  };

  const handleInsert = async () => {
    if (summary) {
      await insertTextAtEnd("\n\n--- SUMMARY ---\n" + summary);
      setSummary("");
    }
  };

  const handleStyleChange = (e, data) => {
    setSelectedStyle(data.value);
  };

  const handleAudienceChange = (e, data) => {
    setSelectedAudience(data.value);
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Summarization</Text>
      
      <Field label="Text to Summarize">
        <ExpandingTextarea 
          value={contentToSummarize} 
          onChange={e => setContentToSummarize(e.target.value)}
          placeholder="Select text in the document or type here..."
        />
      </Field>
      
      <div className={styles.optionsRow}>
        <div className={styles.optionField}>
          <Field label="Summary Style">
            <Dropdown value={selectedStyle} onOptionSelect={handleStyleChange}>
              {summaryStyles.map((style) => (
                <Option key={style.key} value={style.key}>
                  {style.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
        
        <div className={styles.optionField}>
          <Field label="Target Audience">
            <Dropdown value={selectedAudience} onOptionSelect={handleAudienceChange}>
              {AUDIENCES.map((audience) => (
                <Option key={audience.key} value={audience.key}>
                  {audience.text}
                </Option>
              ))}
            </Dropdown>
          </Field>
        </div>
      </div>
      
      <div className={styles.buttonContainer}>
        <Button appearance="primary" onClick={handleSummarize} disabled={isLoading}>
          Summarize
        </Button>
        <Button onClick={handleRefresh}>
          Refresh Selection
        </Button>
        <Button onClick={handleGetEntireDocument}>
          Get Entire Document
        </Button>
      </div>
      
      {isLoading && <Spinner size="small" label="Generating summary..." />}
      
      {summary && (
        <div className={styles.resultContainer}>
          <Text weight="semibold">Summary:</Text>
          <Text>{summary}</Text>
          <div className={styles.buttonContainer}>
            <Button appearance="primary" onClick={handleInsert}>
              Insert at End of Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarizeComponent; 