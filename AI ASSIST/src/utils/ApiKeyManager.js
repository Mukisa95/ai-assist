// AI ASSIST/src/utils/ApiKeyManager.js

const API_KEY_SETTING_NAME = 'geminiApiKey_doc';
const MODEL_NAME_SETTING_NAME = 'geminiModelName_doc';

/**
 * Saves the Gemini API key to Office Document Settings.
 * @param {string} apiKey The API key to save.
 * @returns {Promise<void>} A promise that resolves when the setting is saved.
 */
export const saveApiKey = (apiKey) => {
  return new Promise((resolve, reject) => {
    // Use document.settings
    if (!Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
        console.error('Office context or document settings not available for saving.');
        reject(new Error('Office context/document settings not ready'));
        return;
    }
    Office.context.document.settings.set(API_KEY_SETTING_NAME, apiKey);
    // Save the setting
    Office.context.document.settings.saveAsync((asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        console.log('API Key saved successfully to document settings.');
        resolve();
      } else {
        console.error('Failed to save API Key to document settings: ' + asyncResult.error.message);
        reject(asyncResult.error);
      }
    });
  });
};

/**
 * Loads the Gemini API key from Office Document Settings.
 * @returns {string | null} The saved API key, or null if not found or context not ready.
 */
export const loadApiKey = () => {
  // Use document.settings
  if (!Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
    console.error('Office context or document settings not available for loading.');
    return null; 
  }
  try {
    return Office.context.document.settings.get(API_KEY_SETTING_NAME);
  } catch (error) {
      console.error('Error accessing document settings:', error);
      return null;
  }
};

/**
 * Removes the Gemini API key from Office Document Settings.
 * @returns {Promise<void>} A promise that resolves when the setting is removed.
 */
export const removeApiKey = () => {
    return new Promise((resolve, reject) => {
      // Use document.settings
      if (!Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
        console.error('Office context or document settings not available for removing.');
        reject(new Error('Office context/document settings not ready'));
        return;
      }
      Office.context.document.settings.remove(API_KEY_SETTING_NAME);
      // Save the removal
      Office.context.document.settings.saveAsync((asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
          console.log('API Key removed successfully from document settings.');
          resolve();
        } else {
          console.error('Failed to remove API Key from document settings: ' + asyncResult.error.message);
          reject(asyncResult.error);
        }
      });
    });
  };

// --- Add Model Name Management ---

/**
 * Saves the selected Gemini Model Name to Office Document Settings.
 * @param {string} modelName The model name to save (e.g., 'gemini-1.5-flash-latest').
 * @returns {Promise<void>} A promise that resolves when the setting is saved.
 */
export const saveModelName = (modelName) => {
  return new Promise((resolve, reject) => {
    if (!Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
        console.error('Office context or document settings not available for saving model name.');
        reject(new Error('Office context/document settings not ready'));
        return;
    }
    Office.context.document.settings.set(MODEL_NAME_SETTING_NAME, modelName);
    Office.context.document.settings.saveAsync((asyncResult) => {
      if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
        console.log('Model Name saved successfully to document settings.');
        resolve();
      } else {
        console.error('Failed to save Model Name to document settings: ' + asyncResult.error.message);
        reject(asyncResult.error);
      }
    });
  });
};

/**
 * Loads the selected Gemini Model Name from Office Document Settings.
 * @returns {string | null} The saved model name, or null if not found or context not ready.
 */
export const loadModelName = () => {
  if (!Office || !Office.context || !Office.context.document || !Office.context.document.settings) {
    console.error('Office context or document settings not available for loading model name.');
    return null;
  }
  try {
    return Office.context.document.settings.get(MODEL_NAME_SETTING_NAME);
  } catch (error) {
      console.error('Error accessing document settings for model name:', error);
      return null;
  }
}; 