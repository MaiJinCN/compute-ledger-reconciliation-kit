import { randomBytes } from "node:crypto";

const DEFAULT_RANDOM_LENGTH = 6;

export function formatUtcTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("") + "-" + [
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds())
  ].join("");
}

export function randomSuffix(length = DEFAULT_RANDOM_LENGTH) {
  const byteLength = Math.ceil(length / 2);
  return randomBytes(byteLength).toString("hex").slice(0, length).toUpperCase();
}

export function normalizeIdPrefix(prefix) {
  const value = String(prefix || "").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9]{1,7}$/.test(value)) {
    throw new Error("ID prefix must be 2-8 uppercase letters or numbers and start with a letter.");
  }
  return value;
}

export function createProjectId(date = new Date()) {
  return `PRJ-${formatUtcTimestamp(date)}-${randomSuffix()}`;
}

export function createTaskId(taskPrefix, date = new Date()) {
  return `${normalizeIdPrefix(taskPrefix)}-${formatUtcTimestamp(date)}-${randomSuffix()}`;
}

export function createClientRequestId(date = new Date()) {
  return `REQ-${formatUtcTimestamp(date)}-${randomSuffix(10)}`;
}

export function createLedgerEntryId(date = new Date()) {
  return `LED-${formatUtcTimestamp(date)}-${randomSuffix()}`;
}
