import * as fs from "fs";
import * as readline from "readline";
import { z, ZodType } from "zod";

/**
 * This is a JSDoc comment. Similar to JavaDoc, it documents a public-facing
 * function for others to use. Most modern editors will show the comment when 
 * mousing over this function name. Try it in run-parser.ts!
 * 
 * File I/O in TypeScript is "asynchronous", meaning that we can't just
 * read the file and return its contents. You'll learn more about this 
 * in class. For now, just leave the "async" and "await" where they are. 
 * You shouldn't need to alter them.
 * 
 * @param path The path to the file being loaded.
 * @param schema optional Zod schem to validate each row
 * @returns a "promise" to produce a 2-d array of cell values
 */
export async function parseCSV(path: string): Promise<string[][]>;
export async function parseCSV<T>(
  path: string,
  schema: ZodType<T>
): Promise<{
  success: boolean;
  data: T[];
  errors: { rowIndex: number; error: z.ZodError<unknown> }[];
}>;
export async function parseCSV<T>(path: string, schema?: ZodType<T>) {
  // This initial block of code reads from a file in Node.js. The "rl"
  // value can be iterated over in a "for" loop. 
  const fileStream = fs.createReadStream(path);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity, // handle different line endings
  });
  
  // Create an empty array to hold the results
  let result = []
  
  // We add the "await" here because file I/O is asynchronous. 
  // We need to force TypeScript to _wait_ for a row before moving on. 
  // More on this in class soon!
 for await (const line of rl) {
    // Handle empty lines as [""] (like your tests expect)
    if (line.trim() === "") {
      result.push([""]);
      continue;
    }
    // CSV splitting logic (simple, not RFC-compliant)
    const values = splitCSVLine(line);
    result.push(values);
  }

  // If no schema, return string[][]
  if (!schema) return result;

  // Validate and transform each row
  const data: T[] = [];
  const errors: { rowIndex: number; error: z.ZodError<unknown> }[] = [];
  result.forEach((row, i) => {
    const parsed = schema.safeParse(row);
    if (parsed.success) {
      data.push(parsed.data);
    } else {
      errors.push({ rowIndex: i, error: parsed.error });
    }
  });

  return {
    success: errors.length === 0,
    data,
    errors,
  };
}

// Helper: splits a CSV line, handling quotes and commas
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}