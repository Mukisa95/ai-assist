import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSelectedText } from '../../utils/wordUtils';
import { useOfficeContext } from '../../context/OfficeContext'; // Corrected import path

// Create context
const SelectionContext = createContext({
  selectedText: '',
  isSelectionEmpty: true,
  refreshSelection: () => {},
});

export const useSelection = () => useContext(SelectionContext);

export const SelectionProvider = ({ children }) => {
  const [selectedText, setSelectedText] = useState('');
  const [isSelectionEmpty, setIsSelectionEmpty] = useState(true);
  const { isOfficeReady } = useOfficeContext(); // Get the Office ready state

  const refreshSelection = async () => {
    try {
      console.log("SelectionContext: Refreshing selection...");
      const text = await getSelectedText();
      setSelectedText(text || '');
      setIsSelectionEmpty(!text);
      return text;
    } catch (error) {
      console.error("Error refreshing selection:", error);
      setSelectedText('');
      setIsSelectionEmpty(true);
      return '';
    }
  };

  // Initial load of selection - only run when Office is ready
  useEffect(() => {
    if (isOfficeReady) {
      console.log("SelectionContext: Office is ready, performing initial selection refresh.");
      refreshSelection();
    } else {
      console.log("SelectionContext: Office not ready yet for initial selection refresh.");
    }
  }, [isOfficeReady]); // Depend on isOfficeReady

  // Set up Office event listener for selection changes - only run when Office is ready
  useEffect(() => {
    // Only run setup if Office is ready
    if (!isOfficeReady) {
      console.log("SelectionContext: Office not ready, skipping event handler setup.");
      return;
    }

    console.log("SelectionContext: Setting up selection change handler");
    
    try {
      Office.context.document.addHandlerAsync(
        Office.EventType.DocumentSelectionChanged,
        () => {
          console.log("SelectionContext: Selection changed event triggered");
          refreshSelection();
        },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            console.error("SelectionContext: Failed to register selection change handler:", result.error.message);
          } else {
            console.log("SelectionContext: Selection change handler registered successfully");
          }
        }
      );
    } catch (error) {
      console.error("SelectionContext: Error registering selection change handler:", error);
    }

    // Cleanup function to remove the handler
    return () => {
      if (window.Office && window.Office.context && window.Office.context.document) {
        try {
          Office.context.document.removeHandlerAsync(
            Office.EventType.DocumentSelectionChanged,
            { handler: refreshSelection },
            (result) => {
              if (result.status === Office.AsyncResultStatus.Failed) {
                console.warn("SelectionContext: Failed to remove selection change handler:", result.error.message);
              } else {
                console.log("SelectionContext: Selection change handler removed successfully");
              }
            }
          );
        } catch (error) {
          console.error("SelectionContext: Error removing selection change handler:", error);
        }
      }
    };
  }, [isOfficeReady]); // Depend on isOfficeReady

  const value = {
    selectedText,
    isSelectionEmpty,
    refreshSelection,
  };

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
};

export default SelectionContext; 