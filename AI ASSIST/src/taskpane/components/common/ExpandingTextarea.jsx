import React, { useRef, useEffect } from 'react';
import { Textarea, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  textareaWrapper: {
    position: 'relative',
    width: '100%',
  },
  expandingTextarea: {
    minHeight: '24px',
    maxHeight: '300px',
    resize: 'vertical',
    transition: 'height 0.1s ease',
    lineHeight: '1.5',
    overflowY: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  }
});

/**
 * A textarea component that automatically expands based on content.
 * 
 * @param {Object} props - Component props including all standard Textarea props
 * @param {string} props.value - The text value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.className - Additional CSS class
 */
const ExpandingTextarea = (props) => {
  const { value, onChange, placeholder, className, ...restProps } = props;
  const styles = useStyles();
  const textareaRef = useRef(null);

  // Auto-resize effect
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate the scrollHeight and set the height
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(Math.max(scrollHeight, 24), 300)}px`;
    }
  }, [value]);

  return (
    <div className={styles.textareaWrapper}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.expandingTextarea} ${className || ''}`}
        {...restProps}
      />
    </div>
  );
};

export default ExpandingTextarea; 