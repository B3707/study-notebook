"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { vly } from "../lib/vly-integrations";

export const generateQuestions = action({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.runQuery(api.notes.getNote, { id: args.noteId });

    const prompt =
      "You are a helpful study assistant. Based on the following study notes, generate 5 thoughtful practice questions that test understanding of the key concepts. Return only the questions as a JSON array of strings, nothing else.\n\n" +
      "Notes Title: " + note.title + "\n" +
      "Notes Content:\n" + note.content;

    const result = await vly.ai.completion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a study assistant that generates practice questions. Always respond with valid JSON arrays only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!result.success || !result.data) {
      throw new Error("Failed to generate questions: " + (result.error || "Unknown error"));
    }

    const content = result.data.choices[0].message.content;
    let questions: string[];
    try {
      questions = JSON.parse(content);
      if (!Array.isArray(questions)) throw new Error("Not an array");
    } catch {
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try { questions = JSON.parse(match[0]); } catch { questions = [content]; }
      } else {
        questions = [content];
      }
    }

    await ctx.runMutation(api.notes.saveAIResult, {
      id: args.noteId,
      questions: questions,
    });

    return questions;
  },
});

export const generateMindMap = action({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.runQuery(api.notes.getNote, { id: args.noteId });

    const prompt =
      "You are a study assistant that creates mind maps. Based on the following study notes, create a mind map that organizes the key concepts hierarchically.\n\n" +
      "Return ONLY a valid JSON object with this structure:\n" +
      '{\n  "title": "Central Topic",\n  "children": [\n    {\n      "title": "Subtopic 1",\n      "children": [\n        { "title": "Detail 1.1", "children": [] },\n        { "title": "Detail 1.2", "children": [] }\n      ]\n    },\n    {\n      "title": "Subtopic 2",\n      "children": []\n    }\n  ]\n}\n\n' +
      "Keep it clean - no more than 3 levels deep. Return ONLY the JSON, no other text.\n\n" +
      "Notes Title: " + note.title + "\n" +
      "Notes Content:\n" + note.content;

    const result = await vly.ai.completion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a mind map generator. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 1500,
    });

    if (!result.success || !result.data) {
      throw new Error("Failed to generate mind map: " + (result.error || "Unknown error"));
    }

    const content = result.data.choices[0].message.content;
    let mindMap: any;
    try {
      mindMap = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { mindMap = JSON.parse(match[0]); } catch { throw new Error("Failed to parse mind map JSON"); }
      } else {
        throw new Error("Failed to parse mind map JSON");
      }
    }

    await ctx.runMutation(api.notes.saveAIResult, {
      id: args.noteId,
      mindMap: JSON.stringify(mindMap),
    });

    return mindMap;
  },
});
