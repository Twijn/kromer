import {APIError, KromerApi, Name, Transaction} from "../src";

const api = new KromerApi({
    syncNode: "https://kromer.herrkatze.com/api/krist/",
})

const transactionExample: Partial<Transaction> = {
    type: expect.any(String),
    id: expect.any(Number),
    from: expect.any(String),
    to: expect.any(String),
    value: expect.any(Number),
    time: expect.any(Date),
}

describe("TransactionManager", () => {

    describe("get", () => {
        it("should get a single transaction (id=1)", async () => {
            const transaction = await api.transactions.get(1);

            expect(transaction).toBeDefined()
            expect(transaction).toMatchObject<Partial<Transaction>>(transactionExample);
        });

        it("should reject invalid transaction ID", async () => {
            await expect(
                api.transactions.get(-1)
            ).rejects.toMatchObject<APIError>({
                ok: false,
                error: "transaction_not_found",
                message: "Transaction not found",
            });
        });
    });

    describe("getAll", () => {
        it("should get a paginated list of transactions", async () => {
            const result = await api.transactions.getAll({ limit: 10 });
            expect(result.transactions).toHaveLength(10);
            expect(result.count).toBeGreaterThan(0);
        })
    });

    describe("getLatest", () => {
        it("should get transactions sorted by transaction time", async () => {
            const result = await api.transactions.getLatest({ limit: 4 });
            expect(result.transactions).toHaveLength(4);
            expect(result.count).toBeGreaterThan(0);
        });
    });

});
