import * as React from "react";
import { useState } from "react";
import { 
  Button, 
  Field, 
  Dropdown,
  Option,
  Spinner, 
  Text,
  Input,
  makeStyles 
} from "@fluentui/react-components";
import { insertTextAtEnd } from "../../utils/wordUtils";
import { generateDocument } from "../../services/geminiService";
import { DOCUMENT_TEMPLATES, REWRITING_STYLES, LENGTH_OPTIONS, AUDIENCES } from "../../config";
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
  keywordsInput: {
    marginBottom: "10px",
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
  }
});

const GenerateDocumentComponent = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("business_letter");
  const [selectedStyle, setSelectedStyle] = useState(REWRITING_STYLES[0].key);
  const [selectedLength, setSelectedLength] = useState(LENGTH_OPTIONS[1].key);
  const [selectedAudience, setSelectedAudience] = useState("general");
  const [userPrompt, setUserPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const styles = useStyles();

  const handleGenerate = async () => {
    if (!userPrompt) {
      setGeneratedContent("Please enter your prompt/instructions for the document.");
      return;
    }

    setIsLoading(true);
    try {
      const generatedDocContent = await generateDocument(
        selectedTemplate, 
        userPrompt, 
        selectedStyle, 
        selectedLength,
        selectedAudience
      );
      setGeneratedContent(generatedDocContent);
    } catch (error) {
      setGeneratedContent("An error occurred: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async () => {
    if (generatedContent) {
      await insertTextAtEnd("\n\n" + generatedContent);
      setGeneratedContent("");
    }
  };

  const handleTemplateChange = (e, data) => {
    setSelectedTemplate(data.value);
  };

  const handleStyleChange = (e, data) => {
    setSelectedStyle(data.value);
  };

  const handleLengthChange = (e, data) => {
    setSelectedLength(data.value);
  };

  const handleAudienceChange = (e, data) => {
    setSelectedAudience(data.value);
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Auto-Generation of Documents</Text>
      
      <Field label="Document Template">
        <Dropdown value={selectedTemplate} onOptionSelect={handleTemplateChange}>
          {DOCUMENT_TEMPLATES.map((template) => (
            <Option key={template.key} value={template.key}>
              {template.text}
            </Option>
          ))}
        </Dropdown>
      </Field>
      
      <div className={styles.optionsRow}>
        <div className={styles.optionField}>
          <Field label="Desired Style">
            <Dropdown value={selectedStyle} onOptionSelect={handleStyleChange}>
              {REWRITING_STYLES.map((style) => (
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
      
      <Field label="Desired Length">
        <Dropdown value={selectedLength} onOptionSelect={handleLengthChange}>
          {LENGTH_OPTIONS.map((length) => (
            <Option key={length.key} value={length.key}>
              {length.text}
            </Option>
          ))}
        </Dropdown>
      </Field>
      
      <Field label="Your Prompt / Instructions" className={styles.keywordsInput}>
        <ExpandingTextarea 
          value={userPrompt} 
          onChange={e => setUserPrompt(e.target.value)}
          placeholder="Enter your detailed instructions here, e.g., 'Write a formal business letter requesting information about...' or 'Draft a short blog post about the benefits of remote work.'"
        />
      </Field>
      
      <div className={styles.buttonContainer}>
        <Button appearance="primary" onClick={handleGenerate} disabled={isLoading}>
          Generate Document
        </Button>
      </div>
      
      {isLoading && <Spinner size="small" label="Generating document..." />}
      
      {generatedContent && (
        <div className={styles.resultContainer}>
          <Text weight="semibold">Generated Content:</Text>
          <ExpandingTextarea 
            value={generatedContent}
            readOnly
          />
          <div className={styles.buttonContainer}>
            <Button appearance="primary" onClick={handleInsert}>
              Insert into Document
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateDocumentComponent; 