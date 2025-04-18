/* global Word console */

export async function insertText(text) {
  // Write text to the document.
  try {
    await Word.run(async (context) => {
      let body = context.document.body;
      body.insertParagraph(text, Word.InsertLocation.end);
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}

// These functions are moved to wordUtils.js, but kept here for backward compatibility
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

export async function replaceSelectedText(newText) {
  return Word.run(async (context) => {
    const range = context.document.getSelection();
    range.insertText(newText, Word.InsertLocation.replace);
    await context.sync();
  }).catch(error => {
    console.error('Error replacing text:', error);
  });
}
