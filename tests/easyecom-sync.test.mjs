import test from "node:test";
import assert from "node:assert/strict";
import { isAllowedSku, parseEasyEcomResponse, postOrder, reconciliationUpdate, shouldCreateOrder } from "../scripts/easyecom-sync.mjs";

const successBody = {
  code: 200,
  data: {
    Status: 200,
    Message: "Success SuborderID:993723684 OrderID:659843492 InvoiceID:788118090",
    OrderID: "659843492",
    InvoiceID: "788118090",
    SuborderID: "993723684",
  },
  message: "order_TIYz0sxoCG534S created successfully",
};

test("parses the EasyEcom success response from the parsed body", () => {
  assert.deepEqual(parseEasyEcomResponse(successBody, 200), {
    ok: true,
    orderId: "659843492",
    suborderId: "993723684",
    invoiceId: "788118090",
    apiSuccess: true,
  });
});

test("rejects HTTP 200 with an API-level failure", () => {
  assert.equal(parseEasyEcomResponse({ code: 400, data: { Status: 400, Message: "Failure" } }, 200).ok, false);
});

test("rejects a success-shaped response without OrderID", () => {
  const body = structuredClone(successBody);
  delete body.data.OrderID;
  assert.equal(parseEasyEcomResponse(body, 200).ok, false);
});

test("rejects malformed and empty responses", () => {
  assert.equal(parseEasyEcomResponse(null, 200).ok, false);
  assert.equal(parseEasyEcomResponse("not-json", 200).ok, false);
});

test("does not retry a request whose outcome is ambiguous", async () => {
  let calls = 0;
  const result = await postOrder({ endpoint: "https://example.test", apiKey: "x", jwt: "y" }, {}, {
    fetchImpl: async () => {
      calls += 1;
      throw new Error("network timeout");
    },
    timeoutMs: 100,
  });
  assert.equal(calls, 1);
  assert.match(result.ambiguousError, /automatic retry is disabled/);
});

test("uses the mocked HTTP response body and makes only one creation request", async () => {
  let calls = 0;
  const result = await postOrder({ endpoint: "https://example.test", apiKey: "x", jwt: "y" }, { orderNumber: "order-test" }, {
    fetchImpl: async () => {
      calls += 1;
      return { status: 200, ok: true, text: async () => JSON.stringify(successBody) };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.malformed, false);
  assert.equal(parseEasyEcomResponse(result.body, result.response.status).orderId, "659843492");
});

test("does not retry a definitive HTTP rate-limit response", async () => {
  let calls = 0;
  const result = await postOrder({ endpoint: "https://example.test", apiKey: "x", jwt: "y" }, {}, {
    fetchImpl: async () => {
      calls += 1;
      return { status: 429, ok: false, text: async () => '{"code":429,"message":"rate limited"}' };
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.response.status, 429);
});

test("dry-run never permits order creation", () => {
  assert.equal(shouldCreateOrder({ dryRun: true }), false);
  assert.equal(shouldCreateOrder({ dryRun: false }), true);
});

test("reconciliation requires the expected successful payload and preserves it", () => {
  const row = { status: "failed", response_payload: successBody };
  assert.deepEqual(reconciliationUpdate(row, "659843492", "2026-10-28T00:00:00.000Z"), {
    status: "success",
    easyecom_order_id: "659843492",
    error_message: null,
    processed_at: "2026-10-28T00:00:00.000Z",
  });
  assert.equal(reconciliationUpdate(row, "659843496"), null);
  assert.equal(reconciliationUpdate({ ...row, status: "success" }, "659843492"), null);
});

test("already-successful rows remain untouched when their payload confirms the ID", () => {
  const row = { status: "success", response_payload: successBody, easyecom_order_id: "659843492" };
  const parsed = parseEasyEcomResponse(row.response_payload, 200);
  assert.equal(parsed.ok && parsed.orderId === row.easyecom_order_id, true);
  assert.equal(reconciliationUpdate(row, "659843492"), null);
});

test("inventory eligibility remains limited to the three confirmed SKUs", () => {
  assert.equal(isAllowedSku("VHSMO Vol. 1_Baby Pink"), true);
  assert.equal(isAllowedSku("VHSMO Vol. 1_Cherry Red"), true);
  assert.equal(isAllowedSku("VHSMO Vol. 1_Cosmic Black"), true);
  assert.equal(isAllowedSku("VHSMO Vol. 1_Unknown"), false);
});

