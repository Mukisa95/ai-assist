/* global Word console */

// --- Helper Functions --- 

/**
 * Applies bold formatting to specified text within a range.
 * @param {Word.Range} range The range to apply formatting within.
 * @param {string[]} textsToBold Array of strings to find and make bold.
 * @param {Word.RequestContext} context The Word request context.
 */
async function applyBoldFormatting(range, textsToBold, context) {
  if (!range || !textsToBold || textsToBold.length === 0) return;
  console.log("Applying bold formatting to:", textsToBold);
  try {
    for (const textToBold of textsToBold) {
      const searchResults = range.search(textToBold, { matchCase: true });
      searchResults.load('items');
      await context.sync();

      if (searchResults.items.length > 0) {
        console.log(`Found ${searchResults.items.length} instances of "${textToBold}" to bold.`);
        searchResults.items.forEach(foundRange => {
          foundRange.font.bold = true;
        });
        await context.sync();
      } else {
        console.warn(`Could not find "${textToBold}" in the range to apply bold.`);
      }
    }
  } catch (error) {
    console.error('Error applying bold formatting:', error);
    // Continue regardless of bold formatting errors
  }
}

// Get the selected text from the Word document
export async function getSelectedText() {
  return Word.run(async (context) => {
    const range = context.document.getSelection();
    range.load('text');
    await context.sync();
    return range.text;
  }).catch(error => {
    console.error('Error getting selected text:', error);
    return '';
  });
}

// Insert text at the current selection point
export async function insertTextAtSelection(text) {
  return Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertText(text, Word.InsertLocation.replace);
    await context.sync();
  }).catch(error => {
    console.error('Error inserting text:', error);
  });
}

// Insert text at the current selection point, applying common Markdown formatting
export async function insertFormattedTextAtSelection(text) {
  return Word.run(async (context) => {
    try {
      console.log("Starting insertFormattedTextAtSelection: " + text.length + " characters");
      const initialRange = context.document.getSelection();
      initialRange.clear();
      await context.sync();
      
      let currentInsertionPoint = initialRange.getRange(Word.RangeLocation.start); // Get start of cleared range

      // Normalize line breaks
      let normalizedText = text.replace(/\r?\n/g, "\n"); // Normalize line breaks
      normalizedText = normalizedText.replace(/\n\s*\n/g, "\n"); // Collapse multiple blank lines
      const paragraphs = normalizedText.split('\n');
      console.log("Split into " + paragraphs.length + " paragraphs for insertion");

      for (let i = 0; i < paragraphs.length; i++) {
        const paraText = paragraphs[i];
        const trimmedPara = paraText.trim();
        let insertedRange = null;
        let formatApplied = false;

        if (!trimmedPara && i < paragraphs.length - 1) {
          // Insert an empty paragraph if it's not the very last line
          insertedRange = currentInsertionPoint.insertParagraph("", Word.InsertLocation.after);
          formatApplied = true; // Mark as handled
        } else if (trimmedPara) {
          let textToInsert = trimmedPara;
          let headingLevel = 0;
          let applyListFormat = null;
          let boldRangesInfo = [];

          // 1. Check for Headings (e.g., ## Heading 2)
          const headingMatch = trimmedPara.match(/^(#{1,6})\s+(.*)/);
          if (headingMatch) {
            headingLevel = headingMatch[1].length; // Number of # determines level
            textToInsert = headingMatch[2].trim(); // Text after the hashes
            console.log(`Detected Heading ${headingLevel}:`, textToInsert.substring(0, 50));
            insertedRange = currentInsertionPoint.insertParagraph(textToInsert, Word.InsertLocation.after);
            await context.sync();
            try {
              insertedRange.load('style');
              await context.sync();
              insertedRange.style = `Heading ${headingLevel}`;
              await context.sync();
              formatApplied = true;
            } catch (styleError) {
              console.error(`Error applying Heading ${headingLevel} style:`, styleError);
            }
          }

          // 2. Check for Lists (if not a heading)
          if (!formatApplied) {
            if (/^\d+\.\s/.test(trimmedPara)) {
              applyListFormat = 'number';
              textToInsert = trimmedPara.replace(/^\d+\.\s*/, '');
            } else if (/^(\*|-)\s/.test(trimmedPara)) {
              applyListFormat = 'bullet';
              textToInsert = trimmedPara.replace(/^(\*|-)\s*/, '');
            }
          }

          // 3. Check for Bold (if not a heading)
          if (!formatApplied) {
            const boldRegex = /\*\*(.*?)\*\*/g;
            let match;
            let currentPlainText = textToInsert; // Use text potentially modified by list parsing
            while ((match = boldRegex.exec(currentPlainText)) !== null) {
              boldRangesInfo.push(match[1]); // Store the text inside **
            }
            // If bold text was found, update textToInsert to the plain version
            if (boldRangesInfo.length > 0) {
               textToInsert = currentPlainText.replace(boldRegex, '$1'); // Remove ** markers
               console.log("Detected bold text, plain text:", textToInsert.substring(0,50));
            }
          }

          // 4. Insert Paragraph (if not already inserted as heading)
          if (!formatApplied) {
            insertedRange = currentInsertionPoint.insertParagraph(textToInsert, Word.InsertLocation.after);
            await context.sync(); // Sync after inserting paragraph text
          }

          // 5. Apply List Formatting (if applicable and not a heading)
          if (applyListFormat && insertedRange) {
             console.log(`Applying ${applyListFormat} format to:`, textToInsert.substring(0, 30));
             try {
                insertedRange.load('listFormat');
                await context.sync();
                if (insertedRange.listFormat) {
                  if (applyListFormat === 'number') insertedRange.listFormat.applyNumberDefault();
                  else if (applyListFormat === 'bullet') insertedRange.listFormat.applyBulletDefault();
                  await context.sync();
                } else { console.warn("listFormat not available"); }
             } catch (formatError) { console.error("Error applying list format:", formatError); }
          }

          // 6. Apply Bold Formatting (if applicable and paragraph was inserted)
          if (boldRangesInfo.length > 0 && insertedRange) {
            await applyBoldFormatting(insertedRange, boldRangesInfo, context);
          }
        }

        // --- Update Insertion Point --- 
        if (insertedRange) {
          currentInsertionPoint = insertedRange.getRange(Word.RangeLocation.after);
        } else if (i === 0 && !trimmedPara && paragraphs.length > 1) {
           // If the first paragraph was empty, try to get the range after the initial clear
           currentInsertionPoint = initialRange.getRange(Word.RangeLocation.after);
        } else if (i === 0 && trimmedPara) {
           // Fallback if first paragraph processing failed somehow
           currentInsertionPoint = initialRange.getRange(Word.RangeLocation.after);
        }
        // If trimmedPara was empty and it was the last line, we don't insert and don't update insertion point
      }

      console.log("Completed formatted text insertion at selection.");

    } catch (error) {
      console.error('Error in insertFormattedTextAtSelection:', error);
      if (error instanceof OfficeExtension.Error) { console.error("Debug info:", error.debugInfo); }
      throw error; // Re-throw the error
    }
  });
}

// Replace selected text - delegates to insertFormattedTextAtSelection
export async function replaceSelectedText(newText) {
    console.log("replaceSelectedText called, delegating to insertFormattedTextAtSelection");
    return insertFormattedTextAtSelection(newText); 
}

// Insert text at the end of the document, preserving paragraphs and converting Markdown formatting
export async function insertTextAtEnd(text) {
  return Word.run(async (context) => {
    try {
      console.log("Starting insertTextAtEnd: " + text.length + " characters");
      const body = context.document.body;
      
      let normalizedText = text.replace(/\r?\n/g, "\n"); // Normalize line breaks
      normalizedText = normalizedText.replace(/\n\s*\n/g, "\n"); // Collapse multiple blank lines
      const paragraphs = normalizedText.split('\n');
      console.log("Split into " + paragraphs.length + " paragraphs for insertion at end");

      for (let i = 0; i < paragraphs.length; i++) {
        const paraText = paragraphs[i];
        const trimmedPara = paraText.trim();
        let insertedParagraph = null;
        let formatApplied = false;

        if (!trimmedPara && i < paragraphs.length - 1) {
          body.insertParagraph("", Word.InsertLocation.end);
          formatApplied = true;
        } else if (trimmedPara) {
          let textToInsert = trimmedPara;
          let headingLevel = 0;
          let applyListFormat = null;
          let boldRangesInfo = [];

          // 1. Check for Headings
          const headingMatch = trimmedPara.match(/^(#{1,6})\s+(.*)/);
          if (headingMatch) {
            headingLevel = headingMatch[1].length;
            textToInsert = headingMatch[2].trim();
            console.log(`Detected Heading ${headingLevel}:`, textToInsert.substring(0, 50));
            insertedParagraph = body.insertParagraph(textToInsert, Word.InsertLocation.end);
            await context.sync();
            try {
              insertedParagraph.load('style');
              await context.sync();
              insertedParagraph.style = `Heading ${headingLevel}`;
              await context.sync();
              formatApplied = true;
            } catch (styleError) {
              console.error(`Error applying Heading ${headingLevel} style:`, styleError);
            }
          }

          // 2. Check for Lists (if not a heading)
          if (!formatApplied) {
            if (/^\d+\.\s/.test(trimmedPara)) {
              applyListFormat = 'number';
              textToInsert = trimmedPara.replace(/^\d+\.\s*/, '');
            } else if (/^(\*|-)\s/.test(trimmedPara)) {
              applyListFormat = 'bullet';
              textToInsert = trimmedPara.replace(/^(\*|-)\s*/, '');
            }
          }

          // 3. Check for Bold (if not a heading)
          if (!formatApplied) {
            const boldRegex = /\*\*(.*?)\*\*/g;
            let match;
            let currentPlainText = textToInsert;
            while ((match = boldRegex.exec(currentPlainText)) !== null) {
              boldRangesInfo.push(match[1]);
            }
            if (boldRangesInfo.length > 0) {
               textToInsert = currentPlainText.replace(boldRegex, '$1');
               console.log("Detected bold text, plain text:", textToInsert.substring(0,50));
            }
          }

          // 4. Insert Paragraph (if not already inserted as heading)
          if (!formatApplied) {
            insertedParagraph = body.insertParagraph(textToInsert, Word.InsertLocation.end);
            await context.sync();
          }

          // 5. Apply List Formatting
          if (applyListFormat && insertedParagraph) {
             console.log(`Applying ${applyListFormat} format to:`, textToInsert.substring(0, 30));
             try {
                insertedParagraph.load('listFormat');
                await context.sync();
                if (insertedParagraph.listFormat) {
                  if (applyListFormat === 'number') insertedParagraph.listFormat.applyNumberDefault();
                  else if (applyListFormat === 'bullet') insertedParagraph.listFormat.applyBulletDefault();
                  await context.sync();
                } else { console.warn("listFormat not available"); }
             } catch (formatError) { console.error("Error applying list format:", formatError); }
          }

          // 6. Apply Bold Formatting
          if (boldRangesInfo.length > 0 && insertedParagraph) {
            await applyBoldFormatting(insertedParagraph, boldRangesInfo, context);
          }
        }
        // Small delay between paragraphs to prevent potential sync issues
        if (i < paragraphs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 20)); // 20ms delay
        }
      }
      
      console.log("Completed formatted text insertion at end.");
    } catch (error) {
      console.error('Error in insertTextAtEnd:', error);
      if (error instanceof OfficeExtension.Error) { console.error("Debug info:", error.debugInfo); }
      // Fallback for insertTextAtEnd (optional)
      try {
        console.warn("Attempting simple fallback insertion for insertTextAtEnd");
        context.document.body.insertText(text + '\n', Word.InsertLocation.end);
        await context.sync();
      } catch (fallbackError) {
        console.error("Fallback insertion failed:", fallbackError);
      }
    }
  });
}

// Insert text as a comment on the selected text
export async function insertComment(text) {
  return Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertComment(text);
    await context.sync();
  }).catch(error => {
    console.error('Error inserting comment:', error);
  });
}

// Add AI-generated response as a comment to the selected text
export async function addCommentToSelection(text) {
  return Word.run(async (context) => {
    try {
      const range = context.document.getSelection();
      range.load('text');
      await context.sync();
      
      if (!range.text.trim()) {
        throw new Error("No text is selected. Please select text to add a comment.");
      }
      
      range.insertComment(text);
      await context.sync();
    } catch (error) {
      console.error('Error adding comment to selection:', error);
      throw error;
    }
  });
}

// Get the entire document text
export async function getDocumentText() {
  return Word.run(async (context) => {
    const body = context.document.body;
    body.load('text');
    await context.sync();
    return body.text;
  }).catch(error => {
    console.error('Error getting document text:', error);
    return '';
  });
}

// Get the paragraph containing the current selection
export async function getCurrentParagraph() {
  return Word.run(async (context) => {
    const selection = context.document.getSelection();
    const paragraphs = selection.paragraphs;
    paragraphs.load('text');
    await context.sync();
    
    if (paragraphs.items.length > 0) {
      return paragraphs.items[0].text;
    }
    return '';
  }).catch(error => {
    console.error('Error getting current paragraph:', error);
    return '';
  });
} 