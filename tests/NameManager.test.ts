import {APIError, KromerApi, Name, Transaction} from "../src";
import { transactionExample } from "./TransactionManager.test";

const api = new KromerApi({
    syncNode: "https://kromer.herrkatze.com/api/krist/",
})

export const nameExample: Name = {
    name: expect.any(String),
    owner: expect.any(String),
    original_owner: expect.any(String),
    registered: expect.any(Date),
    updated: expect.any(Date),
    unpaid: expect.any(Number),
}

describe("NameManager", () => {

    describe("get", () => {
        it("should get a single 'kromerjs' name", async () => {
            const name = await api.names.get("kromerjs");

            expect(name).toBeDefined()
            expect(name).toMatchObject<Name>(nameExample);
        });

        it("should reject invalid name", async () => {
            await expect(
                api.names.get("invalid")
            ).rejects.toMatchObject<APIError>({
                ok: false,
                error: "name_not_found",
                message: "The name could not be found",
            });
        });
    });
    
    describe("lookupNames", () => {
        it("should lookup names for multiple addresses", async () => {
            const result = await api.names.lookupNames([
                "serverwelf",
                "k4wq6w8umr",
            ]);
            expect(result?.names).toBeDefined();
            expect(Array.isArray(result.names)).toBe(true);
            // check count vs lengths
            expect(result.total).toBeGreaterThanOrEqual(result.count);
            expect(result.names.length).toBe(result.count);
            // check names
            result.names.forEach((name) => {
                expect(name).toMatchObject<Name>(nameExample);
            });
        });
    });

    describe("lookupNameHistory", () => {
        it("should lookup name history for a name", async () => {
            const result = await api.names.lookupNameHistory("balls");
            expect(result?.transactions).toBeDefined();
            expect(Array.isArray(result.transactions)).toBe(true);
            // check count vs lengths
            expect(result.total).toBeGreaterThanOrEqual(result.count);
            expect(result.transactions.length).toBe(result.count);
            // check transactions
            result.transactions.forEach((transaction) => {
                expect(transaction).toMatchObject<Partial<Transaction>>(transactionExample);
            });
        });
    });

    describe("lookupNameTransactions", () => {
        it("should lookup name transactions for a name", async () => {
            const result = await api.names.lookupNameTransactions("balls");
            expect(result?.transactions).toBeDefined();
            expect(Array.isArray(result.transactions)).toBe(true);
            // check count vs lengths
            expect(result.total).toBeGreaterThanOrEqual(result.count);
            expect(result.transactions.length).toBe(result.count);
            // check transactions
            result.transactions.forEach((transaction) => {
                expect(transaction).toMatchObject<Partial<Transaction>>(transactionExample);
            });
        });
    });

    describe("getAll", () => {
        it("should get a paginated list of names", async () => {
            const result = await api.names.getAll({ limit: 3 });
            expect(result.names).toHaveLength(3);
            expect(result.count).toBeGreaterThan(0);
        })
    });

    describe("getCost", () => {
        it("should return the cost of a name (100 kro)", async () => {
            const cost = await api.names.getCost();
            expect(cost).toBe(100);
        });
    });

    describe("check", () => {
        it("should find that kromerjs is taken", async () => {
            const available = await api.names.check("kromerjs");
            expect(available).toBe(false);
        });

        it("should find that asdfasdf123 is available", async () => {
            const available = await api.names.check("asdfasdf123");
            expect(available).toBe(true);
        });
    });

    const name = crypto.randomUUID().substring(0, 8);
    const privatekey = "rNWMZws4SjFkcOInSuSbQBCc6IvE5sDA";
    describe("register", () =>  {

        it(`should register a new name, ${name}`, async () => {
            await expect(api.names.register(name, {
                privatekey,
            })).resolves.toBeUndefined();
        });

    });

    describe("update", () => {

        it("should update the name data", async () => {
            await expect(api.names.update(name, {
                privatekey,
                a: "test",
            })).resolves.toMatchObject<Name>(nameExample)
        })

    });

    describe("transfer", () => {

        it(`should transfer the registered name, ${name}`, async () => {
            await expect(api.names.transfer(name, {
                privatekey,
                address: 'serverwelf',
            })).resolves.toMatchObject<Name>(nameExample)
        })

    });

});
