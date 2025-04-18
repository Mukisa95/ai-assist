import { GoogleGenerativeAI } from '@google/generative-ai';
// Removed import { GEMINI_API_KEY } from '../config';

// Initialize the Gemini API variables - they will be set by initializeGeminiService
let genAI = null;
let model = null;
let isInitialized = false;
let currentModelName = 'gemini-1.5-flash-latest'; // Default model

/**
 * Initializes the Gemini service with the provided API key and model name.
 * @param {string} apiKey The Gemini API key.
 * @param {string} modelName The name of the model to use (e.g., 'gemini-1.5-flash-latest', 'gemini-pro'). Defaults to 'gemini-1.5-flash-latest'.
 * @returns {boolean} True if initialization was successful, false otherwise.
 */
export function initializeGeminiService(apiKey, modelName = 'gemini-1.5-flash-latest') {
  if (!apiKey) {
    console.error('Gemini API Key is missing.');
    isInitialized = false;
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // Store the provided model name
    currentModelName = modelName || 'gemini-1.5-flash-latest'; // Ensure a default
    model = genAI.getGenerativeModel({ model: currentModelName });
    isInitialized = true;
    console.log(`Gemini service initialized successfully with model: ${currentModelName}.`);
    return true;
  } catch (error) {
    console.error('Error initializing Gemini service:', error);
    genAI = null;
    model = null;
    isInitialized = false;
    return false;
  }
}

/**
 * Checks if the Gemini service has been initialized.
 * @returns {boolean} True if initialized, false otherwise.
 */
export function isGeminiInitialized() {
    return isInitialized;
}

// Function to get the currently configured model name
export function getCurrentModelName() {
    return currentModelName;
}

// Helper function to check initialization before API calls
function ensureInitialized() {
  if (!isInitialized) {
    throw new Error('Gemini service not initialized. Please set the API key in settings.');
  }
}

// Function to analyze writing style and provide tone suggestions
export async function analyzeTone(content, targetTone, audience = 'general') {
  ensureInitialized(); // Check if initialized
  try {
    const prompt = `Analyze the following text and suggest improvements to make it more ${targetTone} in tone and appropriate for a ${audience} audience:
    
    Text: ${content}
    
    Provide specific suggestions for improving the tone while maintaining the original meaning, taking into account that this is for a ${audience} audience. 
    
    **IMPORTANT FORMATTING REQUIREMENTS:**
    1. Format your response using standard Markdown.
    2. For ALL lists, ALWAYS use proper bullet point format with "* " or "- " at the beginning of each line.
    3. Use bold with **text** and italics with *text* where appropriate.
    4. If suggesting a list of changes or points, format as a proper Markdown list.
    
    Only return the suggested text with proper formatting as specified above. Do not include any introductory phrases or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error analyzing tone:', error);
    // Check if the error is due to API key issue (specific error codes might vary)
    if (error.message.includes('API key not valid')) {
        isInitialized = false; // Mark as uninitialized if key is bad
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while analyzing the text.';
  }
}

// Function to adapt content for different audiences
export async function adaptForAudience(content, audience) {
  ensureInitialized(); // Check if initialized
  try {
    const prompt = `Adapt the following text to be more appropriate for a ${audience} audience:
    
    Text: ${content}
    
    Rewrite the text to better suit this audience while maintaining the core message.
    
    **IMPORTANT FORMATTING REQUIREMENTS:**
    1. Format your response using standard Markdown.
    2. For ALL lists, ALWAYS use proper bullet point format with "* " or "- " at the beginning of each line.
    3. Use bold with **text** and italics with *text* where appropriate.
    4. If content contains multiple related points, format as a proper Markdown list.
    
    Only return the rewritten text with proper formatting as specified above. Do not include any introductory phrases or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error adapting content:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while adapting the text.';
  }
}

// Function to rewrite/paraphrase text
export async function rewriteText(content, style, audience = 'general') {
  ensureInitialized(); // Check if initialized
  try {
    const prompt = `Rewrite the following text in a ${style} style for a ${audience} audience:
    
    Text: ${content}
    
    Provide a rewritten version that maintains the meaning but changes the wording and structure, tailored for a ${audience} audience.
    
    **IMPORTANT FORMATTING REQUIREMENTS:**
    1. Format your response using standard Markdown.
    2. For ALL lists, ALWAYS use proper bullet point format with "* " or "- " at the beginning of each line.
    3. Use bold with **text** and italics with *text* where appropriate.
    4. If content contains multiple related points after a colon, format as a proper Markdown list.
    
    Only return the rewritten text with proper formatting as specified above. Do not include any introductory phrases or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error rewriting text:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while rewriting the text.';
  }
}

// Function to provide text completion suggestions
export async function predictNextText(content) {
  ensureInitialized(); // Check if initialized
  try {
    const prompt = `Based on the following text, predict what might come next:
    
    Text: ${content}
    
    Provide a natural continuation of this text (about 30-50 words). Only return the predicted text, without any introductory phrases or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error predicting text:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while generating predictions.';
  }
}

// Function to summarize text
export async function summarizeText(content, style = 'concise', audience = 'general') {
  ensureInitialized(); // Check if initialized
  try {
    const prompt = `Summarize the following text in a ${style} style for a ${audience} audience:
    
    Text: ${content}
    
    Provide a summary that captures the key points and main message, tailored for a ${audience} audience.
    
    **IMPORTANT FORMATTING REQUIREMENTS:**
    1. Format your response using standard Markdown.
    2. For ALL lists, ALWAYS use proper bullet point format with "* " or "- " at the beginning of each line.
    3. Use bold with **text** and italics with *text* where appropriate.
    4. If summarizing multiple points, format as a proper Markdown list.
    
    Only return the summary text with proper formatting as specified above. Do not include any introductory phrases or explanations.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error summarizing text:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while summarizing the text.';
  }
}

// Function to generate document from template, user prompt, style, and length, potentially with context
export async function generateDocument(template, userPrompt, style, length, audience = 'general') {
  ensureInitialized(); 
  try {
    // Construct the prompt, adding context if the user prompt indicates it
    let fullPrompt = `Generate a ${template} document based on the following, written in a ${style} style for a ${audience} audience. `; 
    
    // Add specific instructions based on length
    switch(length) {
        case 'one_sentence':
            fullPrompt += "Generate exactly one concise sentence. ";
            break;
        case 'short':
            fullPrompt += "Generate 1-2 short paragraphs. ";
            break;
        case 'medium':
            fullPrompt += "Generate 3-5 medium-length paragraphs. ";
            break;
        case 'long':
             fullPrompt += "Generate multiple paragraphs covering the topic adequately. ";
            break;
        case 'essay':
            fullPrompt += "Generate a detailed essay with clear explanations and structure. ";
            break;
        case 'research_paper':
            fullPrompt += "Generate an in-depth, well-structured research paper style response with detailed information and examples. ";
            break;
        default:
            fullPrompt += `The desired length is ${length}. `;
    }

    fullPrompt += `Here are the specific instructions/prompt:\n\n${userPrompt}\n\n`;
    fullPrompt += `Create a complete document based on these instructions, style, and desired length, keeping in mind that this is for a ${audience} audience. Only return the generated document content, without any introductory phrases or explanations.`;

    console.log("Sending prompt to Gemini:", fullPrompt); // Log the final prompt for debugging

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating document:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while generating the document.';
  }
}

// Function to answer multiple questions within a text block
export async function answerMultipleQuestions(selectedQuestionsText) {
  ensureInitialized();
  try {
    // ---> Final Prompt Revision: Extreme focus on sequence and formatting preservation <--- 
    const prompt = `Process the following input text which contains one or more questions.

    **Primary Goal:** For each question found, provide a concise answer immediately after it, preserving only the essential question text.

    **REQUIRED Output Structure (Strict):**
    For every question identified:
    1.  Output the **original question text**, BUT **OMIT** any trailing placeholder characters like underscores (___), periods (.....), dashes (---), or similar sequences intended for answers.
    2.  Preserve any original leading numbering or bullets (e.g., "1.", "-") on the question line.
    3.  Follow the question with a **newline character** (\n).
    4.  On the next line(s), output the **concise answer**, **INDENTING EACH LINE OF THE ANSWER** (e.g., with 4 spaces).
    5.  Follow the answer with **two newline characters** (\n\n).

    **Example:**
    Input Text:
    1. What is the capital of France? ..........
    - How many planets? _____
    
    REQUIRED Output:
    1. What is the capital of France?
        The capital of France is Paris.
    
    - How many planets?
        There are eight planets.
    

    **Formatting Instructions:**
    *   Preserve original leading numbering/bullets on question lines.
    *   **INDENT ALL LINES OF EACH ANSWER.** Use 4 spaces for indentation.
    *   Use standard Markdown within answers if needed (applied *after* indentation).
    *   Optionally make the preserved question line bold (**Question?**).

    **Crucial Constraints:**
    *   DO NOT output answers before questions.
    *   DO NOT include placeholder lines/sequences (____, ....., ----) in the output.
    *   DO NOT group items.
    *   DO NOT add conversational filler.

    --- Input Text to Process ---
    ${selectedQuestionsText}
    --- End Input Text --- 
    
    Produce ONLY the interleaved questions (without placeholders) and answers in the strict format specified above.`;

    console.log("Sending FINAL REVISION multi-question prompt to Gemini...");
    const result = await model.generateContent(prompt);
    console.log("Gemini response for multi-question:", result.response.text()); // Log the raw response
    return result.response.text();
  } catch (error) {
    console.error('Error answering multiple questions:', error);
    if (error.message.includes('API key not valid')) {
        isInitialized = false;
        return 'Error: Invalid API Key. Please check your settings.';
    }
    return 'An error occurred while answering the questions.';
  }
}

// --- Add functions for the new use cases below --- 