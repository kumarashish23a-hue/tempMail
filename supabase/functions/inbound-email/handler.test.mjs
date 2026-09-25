// Unit tests for the inbound-email Edge Function core logic.
// Run: node --test supabase/functions/inbound-email/handler.test.mjs
// (from the repo root). Uses Node type-stripping to import the .ts sources.
import { test } from "node:test";
import assert from "node:assert/strict";

const { extractOtp, validatePayload, normalizeRecipient } = await import("./lib.ts");
const { handleInboundEmail, DuplicateEmailError } = await import("./handler.ts");

const SECRET = "test-secret";
const AUTH = `Bearer ${SECRET}`;

function makeDb({ mailbox = null, onInsert = null } = {}) {
  const calls = { inserts: [] };
  return {
    calls,
    async findMailboxByAddress(address) {
      assert.equal(address, address.trim().toLowerCase(), "mailbox lookup must use normalized address");
      return mailbox;
    },
    async insertEmail(row) {
      calls.inserts.push(row);
      if (onInsert === "duplicate") throw new DuplicateEmailError("dup");
      return "email-uuid-1";
    },
  };
}

const payload = (over = {}) => ({
  provider: "cloudflare",
  providerMessageId: "msg-1@example.com",
  recipient: "ABC123@MyDomain.com",
  sender: "no-reply@example.com",
  subject: "Your verification code",
  text: "Your verification code is 483921.",
  receivedAt: new Date().toISOString(),
  ...over,
});

const activeMailbox = {
  id: "addr-uuid-1",
  address: "abc123@mydomain.com",
  expires_at: new Date(Date.now() + 3600_000).toISOString(),
};
const expiredMailbox = { ...activeMailbox, expires_at: new Date(Date.now() - 1000).toISOString() };

// --- lib: OTP extraction ---
test("extractOtp finds code near keyword", () => {
  assert.equal(extractOtp("Your verification code is 483921."), "483921");
  assert.equal(extractOtp("OTP: 123456"), "123456");
  assert.equal(extractOtp("Subject\nUse 987654 to login"), "987654");
});
test("extractOtp returns undefined when no code", () => {
  assert.equal(extractOtp("Hello, welcome!"), undefined);
  assert.equal(extractOtp("code 12"), undefined); // too short
});

// --- handler ---
test("wrong secret -> 401, no DB touch", async () => {
  const db = makeDb({ mailbox: activeMailbox });
  const r = await handleInboundEmail(payload(), "Bearer wrong", SECRET, db);
  assert.equal(r.status, 401);
  assert.equal(db.calls.inserts.length, 0);
});

test("invalid payload -> 400", async () => {
  const db = makeDb({ mailbox: activeMailbox });
  const r = await handleInboundEmail(payload({ recipient: "not-an-email" }), AUTH, SECRET, db);
  assert.equal(r.status, 400);
  assert.equal(db.calls.inserts.length, 0);
});

test("unknown mailbox -> 200 mailbox_not_found, no insert", async () => {
  const db = makeDb({ mailbox: null });
  const r = await handleInboundEmail(payload(), AUTH, SECRET, db);
  assert.equal(r.status, 200);
  assert.equal(r.body.reason, "mailbox_not_found");
  assert.equal(db.calls.inserts.length, 0);
});

test("expired mailbox -> 200 mailbox_expired, no insert", async () => {
  const db = makeDb({ mailbox: expiredMailbox });
  const r = await handleInboundEmail(payload(), AUTH, SECRET, db);
  assert.equal(r.status, 200);
  assert.equal(r.body.reason, "mailbox_expired");
  assert.equal(db.calls.inserts.length, 0);
});

test("happy path -> 200 success, OTP stored", async () => {
  const db = makeDb({ mailbox: activeMailbox });
  const r = await handleInboundEmail(payload(), AUTH, SECRET, db);
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.equal(r.body.messageId, "email-uuid-1");
  const row = db.calls.inserts[0];
  assert.equal(row.address_id, "addr-uuid-1");
  assert.equal(row.sender_email, "no-reply@example.com");
  assert.equal(row.otp, "483921");
  assert.equal(row.provider_message_id, "msg-1@example.com");
});

test("duplicate providerMessageId -> 200 duplicate", async () => {
  const db = makeDb({ mailbox: activeMailbox, onInsert: "duplicate" });
  const r = await handleInboundEmail(payload(), AUTH, SECRET, db);
  assert.equal(r.status, 200);
  assert.equal(r.body.reason, "duplicate");
});

test("DB failure -> throws (caller maps to 500, Worker retries)", async () => {
  const db = makeDb({ mailbox: activeMailbox });
  db.insertEmail = async () => { throw new Error("db down"); };
  await assert.rejects(() => handleInboundEmail(payload(), AUTH, SECRET, db));
});

test("normalizeRecipient lowercases + trims", () => {
  assert.equal(normalizeRecipient("  AbC@X.com "), "abc@x.com");
  const v = validatePayload(payload({ recipient: "  ABC123@MyDomain.com " }));
  assert.equal(v.ok && v.value.recipient, "abc123@mydomain.com");
});
