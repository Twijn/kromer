import {APIError, KromerApi, Name} from "../src";

const api = new KromerApi({
    syncNode: "https://kromer.herrkatze.com/api/krist/",
})

const nameExample: Name = {
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
                message: "Name invalid not found",
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
        it("should return the cost of a name (500 kro)", async () => {
            const cost = await api.names.getCost();
            expect(cost).toBe(500);
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
