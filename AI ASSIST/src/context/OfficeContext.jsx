import React, { createContext, useState, useContext, useEffect } from 'react';

/* global Office */

const OfficeContext = createContext({
  isOfficeReady: false,
  // We could potentially pass down Office.context here too if needed elsewhere
});

export const useOfficeContext = () => useContext(OfficeContext);

export const OfficeProvider = ({ children }) => {
  const [isOfficeReady, setIsOfficeReady] = useState(false);

  useEffect(() => {
    console.log("OfficeProvider: Attempting Office.onReady setup...");
    // Ensure Office.onReady is called only once
    Office.onReady((info) => {
      console.log("OfficeProvider: Office.onReady callback executed.");
      setIsOfficeReady(true);
    }).catch(error => {
        console.error("OfficeProvider: Office.onReady error:", error);
        // Handle error appropriately, maybe set an error state
    });

    // Optional: Check if Office is already ready synchronously (might happen in some scenarios)
    // if (Office && Office.context) {
    //    console.log("OfficeProvider: Office was already ready synchronously.");
    //    setIsOfficeReady(true);
    // }

  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <OfficeContext.Provider value={{ isOfficeReady }}>
      {children}
    </OfficeContext.Provider>
  );
}; 