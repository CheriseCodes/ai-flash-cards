import { describe, it, test } from "node:test";
import assert from "node:assert";
import {
  validateLang,
  validateLangLevel,
  validateWord,
} from "../server-helpers.js";

describe("validateWord input validation", () => {
  it("invalid French word should return false", () => {
    const word = "hello";
    const langMode = "French";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, false);
  });
  it("valid French word should return true", () => {
    const word = "être";
    const langMode = "French";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, true);
  });
  it("invalid Spanish word should return false", () => {
    const word = "hello";
    const langMode = "Spanish";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, false);
  });
  it("valid Spanish word should return true", () => {
    const word = "año";
    const langMode = "Spanish";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, true);
  });
  it("invalid Korean word should return false", () => {
    const word = "hello";
    const langMode = "Korean";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, false);
  });
  it("valid Korean word should return true", () => {
    const word = "하다";
    const langMode = "Korean";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, true);
  });
  it("unsupported language should return false", () => {
    const word = "viikko";
    const langMode = "Finnish";
    const res = validateWord(word, langMode);
    assert.strictEqual(res, false);
  });
});

describe("validateLang input validation", () => {
  it("unsupported language should return false", () => {
    const langMode = "Finnish";
    const res = validateLang(langMode);
    assert.strictEqual(res, false);
  });
  it("supported language should return true", () => {
    const langMode = "French";
    const res = validateLang(langMode);
    assert.strictEqual(res, true);
  });
});

describe("validateLangLevel input validation", () => {
  it("unsupported language should return false", () => {
    const langMode = "Finnish";
    const langLevel = "YKI1";
    const res = validateLang(langMode, langLevel);
    assert.strictEqual(res, false);
  });
  it("valid French language level should return true", () => {
    const langMode = "French";
    const langLevel = "A2";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, true);
  });
  it("invalid French language level should return false", () => {
    const langMode = "French";
    const langLevel = "G6";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, false);
  });
  it("valid Spanish language level should return true", () => {
    const langMode = "Spanish";
    const langLevel = "C1";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, true);
  });
  it("invalid Spanish language level should return false", () => {
    const langMode = "Spanish";
    const langLevel = "L2";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, false);
  });
  it("invalid Korean language level should return false", () => {
    const langMode = "Korean";
    const langLevel = "TOPIKS7";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, false);
  });
  it("valid Korean language level should return true", () => {
    const langMode = "Korean";
    const langLevel = "TOPIK4";
    const res = validateLangLevel(langMode, langLevel);
    assert.strictEqual(res, true);
  });
});
