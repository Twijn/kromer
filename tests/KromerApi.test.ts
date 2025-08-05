import {KromerApi} from "../src";

const api = new KromerApi({
    syncNode: "https://kromer.sad.ovh/api/krist/",
});

describe("KromerApi", () => {

    describe("login", () => {

        it("should login with a private key", async () => {
            const result = await api.login("kromerjs")
            expect(result).toBeDefined();
            expect(result.authed).toBe(true);
            expect(result.address).toBe("kdgt6t37k4");
        });

    });

    describe("motd", () => {

        it("should get the motd", async () => {
            const result = await api.getMOTD();
            expect(result).toBeDefined();
        });

    })

});