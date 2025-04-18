import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Button, 
  Field, 
  Textarea, 
  Spinner, 
  Text,
  makeStyles 
} from "@fluentui/react-components";
import { getSelectedText, insertTextAtSelection, getCurrentParagraph } from "../../utils/wordUtils";
import { predictNextText } from "../../services/geminiService";

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
});

const AutocompleteComponent = () => {
  const [currentText, setCurrentText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyles();

  useEffect(() => {
    async function loadCurrentText() {
      // Try to get the current paragraph or selection
      const selection = await getSelectedText();
      if (selection) {
        setCurrentText(selection);
      } else {
        const paragraph = await getCurrentParagraph();
        if (paragraph) {
          setCurrentText(paragraph);
        }
      }
    }
    
    loadCurrentText();
  }, []);

  const handlePredict = async () => {
    if (!currentText) {
      setSuggestion("Please enter some text or select text in the document first.");
      return;
    }

    setIsLoading(true);
    try {
      const predictedText = await predictNextText(currentText);
      setSuggestion(predictedText);
    } catch (error) {
      setSuggestion("An error occurred: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    // Try to get the current paragraph or selection
    const selection = await getSelectedText();
    if (selection) {
      setCurrentText(selection);
    } else {
      const paragraph = await getCurrentParagraph();
      if (paragraph) {
        setCurrentText(paragraph);
      } else {
        setSuggestion("No text selected. Please select text in the document.");
      }
    }
  };

  const handleApply = async () => {
    if (suggestion) {
      await insertTextAtSelection(suggestion);
      setSuggestion("");
    }
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Smart Autocomplete & Predictive Text</Text>
      
      <Field label="Current Text">
        <Textarea 
          value={currentText} 
          onChange={e => setCurrentText(e.target.value)}
          placeholder="Select text in the document or type here..."
          size="medium"
        />
      </Field>
      
      <div className={styles.buttonContainer}>
        <Button appearance="primary" onClick={handlePredict} disabled={isLoading}>
          Predict Next Text
        </Button>
        <Button onClick={handleRefresh}>
          Refresh Selection
        </Button>
      </div>
      
      {isLoading && <Spinner size="small" label="Generating suggestions..." />}
      
      {suggestion && (
        <div className={styles.resultContainer}>
          <Text weight="semibold">Suggested continuation:</Text>
          <Text>{suggestion}</Text>
          <div className={styles.buttonContainer}>
            <Button appearance="primary" onClick={handleApply}>
              Insert Suggestion
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteComponent; 