import React, { useRef, useEffect } from 'react';
import { Text, makeStyles } from '@fluentui/react-components';

const useStyles = makeStyles({
  responseWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: '10px', // Add some space below the box
  },
  responseBox: {
    background: 'linear-gradient(145deg, #ffffff, #f6f6fd)',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 120, 212, 0.1)',
    padding: '10px 10px 5px 10px', // Reduced bottom padding
    position: 'relative',
    transition: 'all 0.2s ease',
    minHeight: '30px', // Slightly smaller min height
    maxHeight: '40vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: 'linear-gradient(180deg, #0078d4, #2b88d8)',
      borderRadius: '3px 0 0 3px',
    },
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    }
  },
  responseContent: {
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    lineHeight: 1.4,
    fontSize: '12px',
    padding: '5px',
    marginBottom: '0px', // Removed margin-bottom as actions are gone
    width: '100%',
    flexGrow: 1, // Allow content to take up space
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '5px', // Reduced margin
    gap: '5px',
    '&:before': {
      content: '"✨"',
      fontSize: '14px',
    }
  }
  // Removed responseActions style
});

/**
 * A component for displaying AI-generated responses that expands based on content.
 * Action buttons are now expected to be rendered by the parent component.
 */
const ExpandingResponseBox = ({ 
  title, 
  content 
}) => {
  const styles = useStyles();
  const contentRef = useRef(null);
  const boxRef = useRef(null);

  // Auto-adjust height based on content
  useEffect(() => {
    if (boxRef.current && contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const headerHeight = boxRef.current.querySelector('.' + styles.responseHeader.split(' ')[0])?.offsetHeight || 20;
      const padding = 15; // Top/bottom padding estimate
      const minHeight = 30; 
      const maxHeight = window.innerHeight * 0.4; 
      
      boxRef.current.style.height = 'auto'; // Reset height first
      const requiredHeight = contentHeight + headerHeight + padding;
      const calculatedHeight = Math.min(Math.max(requiredHeight, minHeight), maxHeight);

      boxRef.current.style.height = `${calculatedHeight}px`;
      
      // Determine if scrolling is needed
      if (requiredHeight > maxHeight) {
        boxRef.current.style.overflowY = 'auto';
      } else {
        boxRef.current.style.overflowY = 'hidden';
      }
    }
  }, [content, styles.responseHeader]);

  return (
    <div className={styles.responseWrapper}>
      <div ref={boxRef} className={styles.responseBox}>
        <div className={styles.responseHeader}>
          <Text weight="semibold">{title}</Text>
        </div>
        <div ref={contentRef} className={styles.responseContent}>
          {content}
        </div>
        {/* Action buttons removed - to be rendered by parent */}
      </div>
    </div>
  );
};

export default ExpandingResponseBox; 