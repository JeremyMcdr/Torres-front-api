import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. Create the Context
const FocusChartContext = createContext(null);

// 2. Create the Provider Component
export const FocusChartProvider = ({ children }) => {
  // Store chart element, title, and optional filter controls JSX
  const [focusedChartInfo, setFocusedChartInfo] = useState(null);
  const isOpen = Boolean(focusedChartInfo); // Derive open state

  const openFocusDialog = useCallback((chartInfo) => {
    // Revised expected structure:
    // {
    //   id: string,           // Unique identifier for the chart
    //   type: string,
    //   title: string,
    //   chartProps: object, // Base props without data
    //   chartData: any[],     // Reference to the LIVE data array from page state
    //   filterDefinition: {
    //     config: Array<{id: string, label: string, options: any[], value: any}>,
    //     onChange: function
    //   } | null
    // }
    console.log("Opening focus dialog with info:", chartInfo);
    setFocusedChartInfo(chartInfo);
  }, []);

  const closeFocusDialog = useCallback(() => {
    console.log("Closing focus dialog");
    setFocusedChartInfo(null);
  }, []);

  // Function to update the data for the currently focused chart
  const updateFocusedChartData = useCallback((chartId, newData) => {
    setFocusedChartInfo(prevInfo => {
      // Only update if the dialog is open and the ID matches
      if (prevInfo && prevInfo.id === chartId) {
        console.log(`Updating data for focused chart ${chartId}`, newData);
        return { ...prevInfo, chartData: newData };
      }
      return prevInfo; // Otherwise, return the previous state unchanged
    });
  }, []);

  const value = {
    focusedChartInfo,
    isOpen, // Expose isOpen state
    openFocusDialog,
    closeFocusDialog,
    updateFocusedChartData, // Expose the new function
  };

  return (
    <FocusChartContext.Provider value={value}>
      {children}
    </FocusChartContext.Provider>
  );
};

// 3. Create a Custom Hook for easy consumption
export const useFocusChart = () => {
  const context = useContext(FocusChartContext);
  if (!context) {
    throw new Error('useFocusChart must be used within a FocusChartProvider');
  }
  return context;
}; 