import { parseCSV } from "../src/basic-parser";
import * as path from "path";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  
  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

//new tests
import { writeFileSync, unlinkSync } from "fs";
const TEMP_CSV_PATH = path.join(__dirname, "../data/temp.csv");

afterEach(() => {
  try { unlinkSync(TEMP_CSV_PATH); } catch {}
});
//test failed
test("quoted field with commas", async () => {
  writeFileSync(TEMP_CSV_PATH, 'Caesar,Julius,"veni, vidi, vici"');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Caesar", "Julius", "veni, vidi, vici"]);
});
//test failed
test("quoted field with dble quotes", async () => {
  writeFileSync(TEMP_CSV_PATH, '"He said ""Hello""",42');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["He said \"Hello\"", "42"]);
});

test("empty column", async () => {
  writeFileSync(TEMP_CSV_PATH, 'Alice,,23');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Alice", "", "23"]);
});

test("trail comma", async () => {
  writeFileSync(TEMP_CSV_PATH, 'Alice,23,');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Alice", "23", ""]);
});

test("leading/trailing whitespace outside quotes", async () => {
  writeFileSync(TEMP_CSV_PATH, '  Alice  , 23 ');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Alice", "23"]);
});

test("single row, one column", async () => {
  writeFileSync(TEMP_CSV_PATH, 'Alice');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Alice"]);
});

test("completely empty line", async () => {
  writeFileSync(TEMP_CSV_PATH, 'Alice,23\n\nBob,30');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[1]).toEqual([""]);
  expect(results[2]).toEqual(["Bob", "30"]);
});
//test failed
test("quoted fields with newlines", async () => {
  writeFileSync(TEMP_CSV_PATH, '"Hello\nWorld",42');
  const results = await parseCSV(TEMP_CSV_PATH);
  expect(results[0]).toEqual(["Hello\nWorld", "42"]);
});
