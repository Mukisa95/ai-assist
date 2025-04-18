import React, { useEffect } from 'react';

/**
 * UI utility functions for the Word add-in
 */

/**
 * Scrolls an element into view with smooth behavior
 * @param {React.RefObject} ref - React ref object pointing to the element to scroll to
 * @param {Object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior ('auto' or 'smooth')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end', or 'nearest')
 */
export const scrollElementIntoView = (ref, options = {}) => {
  const defaultOptions = { 
    behavior: 'smooth', 
    block: 'nearest' 
  };
  
  const scrollOptions = { ...defaultOptions, ...options };
  
  if (ref && ref.current) {
    // Add a small delay to ensure the scroll happens after any UI updates
    setTimeout(() => {
      ref.current.scrollIntoView(scrollOptions);
    }, 100);
  }
};

/**
 * Hook to automatically scroll to a response area when loading state changes
 * @param {React.RefObject} responseAreaRef - Reference to the response area element
 * @param {boolean} isLoading - Loading state that triggers scrolling when true
 */
export const useScrollToResponse = (responseAreaRef, isLoading) => {
  useEffect(() => {
    if (isLoading && responseAreaRef.current) {
      scrollElementIntoView(responseAreaRef);
    }
  }, [isLoading, responseAreaRef]);
}; 