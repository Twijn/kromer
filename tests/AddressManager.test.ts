import {Address, APIError, KromerApi} from "../src";

const api = new KromerApi({
    syncNode: "https://kromer.herrkatze.com/api/krist/",
})

const addressExample: Address = {
    address: expect.any(String),
    balance: expect.any(Number),
    totalin: expect.any(Number),
    totalout: expect.any(Number),
    firstseen: expect.any(Date),
}

type Pair = {
    privateKey: string;
    address: string;
}

const knownPairs: Pair[] = [
    {
        privateKey: "testing123",
        address: "kyi3yx2nmi",
    },
    {
        privateKey: "aea19064f1b383915510087358bfe1793365383f86da97fa233bb16c258551be",
        address: "ksgkfvyu21",
    },
    {
        privateKey: "76318a442d0fc09e7e8278741cc52fcaff642243cb251f6d3903efe851f905a3",
        address: "kvdat7uygv",
    },
    {
        privateKey: "d2ade874f471fc318f86db112b3c88ce06e569d5667272654e1995d9d9117142",
        address: "kawbe84mje",
    },
    {
        privateKey: "20b6bb317e3945f4470c1c69a612ea00245230f57f7666d666f4aa725d4deabf",
        address: "k7wm83yr0p",
    },
];

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

    describe("getMultiple", () => {
        it("should get multiple addresses", async () => {
            const result = await api.addresses.getMultiple(["serverwelf"]);
            expect(result).toBeDefined();
            expect(result).toHaveProperty("serverwelf");
            expect(result["serverwelf"]).toMatchObject<Address>(addressExample);
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
    });

    describe("decodeAddressFromPrivateKey", () => {
        it("decodes a valid v2 address", () => {
            const address = api.addresses.decodeAddressFromPrivateKey("my-private");
            expect(address).toMatch(/^k[a-z0-9]{9}$/);
        });

        it("is deterministic for the same key", () => {
            const address1 = api.addresses.decodeAddressFromPrivateKey("my-private");
            const address2 = api.addresses.decodeAddressFromPrivateKey("my-private");
            expect(address1).toBe(address2);
        });

        it("different keys produce different address", () => {
            const  address1 = api.addresses.decodeAddressFromPrivateKey("my-private");
            const address2 = api.addresses.decodeAddressFromPrivateKey("my-other-private");
            expect(address1).not.toBe(address2);
        });

        knownPairs.forEach(({privateKey, address}) => {
            it(`should return '${address}' from '${privateKey}`, () => {
                const result = api.addresses.decodeAddressFromPrivateKey(privateKey);
                expect(result).toBe(address);
            });
        });

        it("should throw on empty strings", () => {
            expect(
                () => api.addresses.decodeAddressFromPrivateKey("")
            ).toThrow()
        });
    });
});