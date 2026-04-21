import { describe, expect, it, vi } from "vitest";
import { GramClient } from "./core/gram-client";
import type { ApiClient } from "./core/api-client";
import type { SuccessfulPayment } from "./types/telegram";

describe("roadmap #14", () => {
  it("maps Stars balance and transactions helpers to api client", async () => {
    const getMyStarBalance = vi.fn().mockResolvedValue({ amount: 42, nanostar_amount: 500000000 });
    const getStarTransactions = vi.fn().mockResolvedValue({
      transactions: [{ id: "tx1", amount: 10, date: 1_700_000_200 }],
    });
    const api = {
      getMyStarBalance,
      getStarTransactions,
    } as unknown as ApiClient;

    const gram = new GramClient(api);
    const balance = await gram.getMyStarBalance();
    const history = await gram.getStarTransactions({ offset: 2, limit: 5 });

    expect(balance.amount).toBe(42);
    expect(history.transactions).toHaveLength(1);
    expect(getMyStarBalance).toHaveBeenCalledTimes(1);
    expect(getStarTransactions).toHaveBeenCalledWith({ offset: 2, limit: 5 });
  });

  it("maps edit user star subscription helper to api client", async () => {
    const editUserStarSubscription = vi.fn().mockResolvedValue(true);
    const api = {
      editUserStarSubscription,
    } as unknown as ApiClient;

    const gram = new GramClient(api);
    await gram.editUserStarSubscription({
      userId: 99,
      telegramPaymentChargeId: "charge_abc",
      isCanceled: true,
    });

    expect(editUserStarSubscription).toHaveBeenCalledWith({
      user_id: 99,
      telegram_payment_charge_id: "charge_abc",
      is_canceled: true,
    });
  });

  it("supports recurring Stars fields on successful payment type", () => {
    const payment: SuccessfulPayment = {
      currency: "XTR",
      total_amount: 100,
      invoice_payload: "sub-monthly",
      telegram_payment_charge_id: "tg_charge_1",
      provider_payment_charge_id: "provider_charge_1",
      subscription_expiration_date: 1_800_000_000,
      is_recurring: true,
      is_first_recurring: true,
    };

    expect(payment.currency).toBe("XTR");
    expect(payment.is_recurring).toBe(true);
    expect(payment.subscription_expiration_date).toBeGreaterThan(0);
  });
});
