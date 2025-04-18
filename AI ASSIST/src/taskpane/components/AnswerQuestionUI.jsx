import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dropdown,
  Option,
  Field,
  Spinner,
  Text,
  Textarea,
  makeStyles,
  tokens
} from '@fluentui/react-components';
import { generateDocument } from '../../services/geminiService';
import { insertFormattedTextAtSelection } from '../../utils/wordUtils';
import { useScrollToResponse } from '../../utils/uiUtils';
import ExpandingTextarea from './common/ExpandingTextarea';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    gap: '10px',
  },
  questionText: {
    padding: '5px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    fontStyle: 'italic',
    margin: '2px 0',
  },
  buttonRow: {
    display: "flex",
    gap: "6px", 
    marginTop: "8px",
    minHeight: "24px",
    alignItems: "center",
    justifyContent: 'flex-end',
  },
  aiResponseTextContent: {
    whiteSpace: 'pre-wrap', 
    wordWrap: 'break-word', 
    lineHeight: '1.4',
    padding: '5px',
    fontSize: '12px',
  },
  responseBox: {
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
  // Add other styles as needed
});

// TODO: Define answer length options (e.g., in config.js)
const ANSWER_LENGTHS = [
    { key: 'short', text: 'Short Answer' },
    { key: 'paragraph', text: 'Paragraph' },
    { key: 'essay', text: 'Essay' },
];

const AnswerQuestionUI = ({ assistContext }) => {
  const styles = useStyles();
  const [question, setQuestion] = useState('');
  const [selectedLength, setSelectedLength] = useState(ANSWER_LENGTHS[0].key);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const responseAreaRef = useRef(null);
  
  // Update question when selection changes
  useEffect(() => {
    if (assistContext?.selectedText) {
      setQuestion(assistContext.selectedText);
    } else {
        setQuestion(''); // Clear question if context is lost
    }
  }, [assistContext]);
  
  useScrollToResponse(responseAreaRef, isLoading);

  const handleGenerateAnswer = async () => {
    if (!question) {
        setError("Please enter or select a question.");
        return;
    }
    setIsLoading(true);
    setError('');
    setAnswer('');
    console.log(`Generating answer for: ${question}, Length: ${selectedLength}`);
    try {
      // Construct a prompt for generateDocument to answer the question
      const prompt = `Answer the following question: ${question}`;
      // Use generateDocument, passing the question as the prompt
      // We can map selectedLength to the length options if needed, or use a default
      const result = await generateDocument('answer', prompt, 'default', selectedLength, 'default');
      setAnswer(result);
    } catch (err) {
        console.error("Error generating answer:", err);
        setError("Failed to generate answer. " + err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeep = async () => {
    if (!answer) return;
    setIsLoading(true);
    setError('');
    try {
      // Insert the answer *after* the question paragraph (if possible)
      // For simplicity, we'll insert at the current selection for now
      // TODO: Enhance wordUtils to insert after a specific paragraph/range if needed
      await insertFormattedTextAtSelection("\n" + answer); 
      setAnswer('');
      setQuestion(''); // Clear question after keeping
    } catch (err) {
      console.error("Error inserting answer:", err);
      setError("Failed to insert answer into document.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    setAnswer('');
    setError('');
  };

  return (
    <div className={styles.container}>
      <Text weight="semibold" size={400}>Answer Question</Text>
      <Text>Detected Question (from paragraph):</Text>
      <Text italic block style={{ color: tokens.colorNeutralForeground2 }}>{question}</Text>
      
      <Field label="Question">
        <ExpandingTextarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question here or select text in the document..."
          disabled={isLoading || !!answer}
          rows={2}
        />
      </Field>
      
      <Field label="Desired Answer Length">
        <Dropdown 
          value={selectedLength} 
          onOptionSelect={(e, data) => setSelectedLength(data.optionValue)}
          disabled={isLoading || !!answer}
          size="small"
        >
          {ANSWER_LENGTHS.map((len) => (
            <Option key={len.key} value={len.key}>
              {len.text}
            </Option>
          ))}
        </Dropdown>
      </Field>

      {error && <div className="ai-error">{error}</div>}

      <div className={styles.buttonRow}>
         {isLoading ? (
          <Spinner size="tiny" />
        ) : answer ? (
          <>
            <Button onClick={handleDiscard} size="small" disabled={isLoading}>Discard</Button>
            <Button onClick={handleGenerateAnswer} size="small" disabled={isLoading}>Regenerate</Button>
            <Button appearance="primary" onClick={handleKeep} size="small" disabled={isLoading}>Keep</Button>
          </>
        ) : (
          <Button 
            appearance="primary" 
            onClick={handleGenerateAnswer} 
            disabled={isLoading || !question}
            size="small"
          >
            Generate Answer
          </Button>
        )}
      </div>

      <div ref={responseAreaRef}>
         {!isLoading && answer && (
          <div className={styles.responseBox}>
            <div className={styles.responseHeader}>
              <Text weight="semibold">AI Answer</Text>
            </div>
            <div className={styles.aiResponseTextContent}>
              {answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerQuestionUI; 