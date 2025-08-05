import {Address, APIError, KromerApi} from "../src";

const api = new KromerApi({
    syncNode: "https://kromer.sad.ovh/api/krist/",
})

const addressExample: Address = {
    address: expect.any(String),
    balance: expect.any(Number),
    totalin: expect.any(Number),
    totalout: expect.any(Number),
    firstseen: expect.any(Date),
}

describe("AddressManager", () => {

    describe("get", () => {
        it("should get single 'serverwelf' address", async () => {
            const address = await api.addresses.get("serverwelf");

            expect(address).toBeDefined()
            expect(address).toMatchObject<Address>(addressExample);
        });

        it("should reject invalid address", async () => {
            await expect(
                api.addresses.get("invalid")
            ).rejects.toMatchObject<APIError>({
                ok: false,
                error: "address_not_found",
                message: "Address invalid not found",
            });
        });
    });

    describe("resolve", () => {
        it("should resolve kromer address", async () => {
            const address = await api.addresses.resolve("serverwelf");

            expect(address).toBeDefined()
            expect(address).toMatchObject<Address>(addressExample);
        });

        it("should reject invalid input", async () => {
            await expect(
                api.addresses.resolve("invalid")
            ).rejects.toMatchObject<APIError>({
                ok: false,
                error: 'invalid_format',
                message: 'Must be either an address (ks0d5iqb6p) or a name (reconnected.kro)'
            });
        });
    });

    describe("getAll", () => {
        it("should get a paginated list of addresses", async () => {
            const result = await api.addresses.getAll({ limit: 8 });
            expect(result.addresses).toHaveLength(8);
            expect(result.count).toBeGreaterThan(0);
        })
    });

    describe("getRich", () => {
        it("should get addresses sorted by balance", async () => {
            const result = await api.addresses.getRich({ limit: 5 });
            expect(result.addresses).toHaveLength(5);
            // Verify sorting
            const balances = result.addresses.map(a => a.balance);
            expect(balances).toEqual([...balances].sort((a, b) => b - a));
        });
    });

    describe("getNames", () => {
        it("should get names owned by address", async () => {
            const result = await api.addresses.getNames("serverwelf");
            expect(result.names).toBeDefined();
            expect(Array.isArray(result.names)).toBe(true);
        });
    });

    describe("getTransactions", () => {
        it("should get transactions for address", async () => {
            const result = await api.addresses.getTransactions("serverwelf");
            expect(result.transactions).toBeDefined();
            expect(Array.isArray(result.transactions)).toBe(true);
        });
    })
});