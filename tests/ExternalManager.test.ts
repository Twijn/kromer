import {KromerApi} from "../src";
import {Wallet, WalletCreateResponse} from "../src/types/external";

const api = new KromerApi({
    syncNode: "https://kromer.sad.ovh/api/krist/",
    // internalSyncNode: "https://kromer.reconnected.cc/api/v1/",
});

const PRIVATE_KEY = "anndemeulemeester";

const walletExample: Wallet = {
    id: expect.any(Number),
    address: expect.any(String),
    balance: expect.any(Number),
    created_at: expect.any(Date),
    total_in: expect.any(Number),
    total_out: expect.any(Number),
    locked: expect.any(Boolean),
}

describe("ExternalManager", () => {

    describe("getWalletByName", () => {
        it("should get Twijn's wallet by name", async () => {
            const wallets = await api.external.getWalletByName("Twijn");
            expect(wallets.data.length).toBeGreaterThan(0);
            for (const wallet of wallets.data) {
                expect(wallet).toMatchObject<Wallet>(walletExample);
            }
        });

        it("should fail to get 'notawallet' by name", async () => {
            await expect(api.external.getWalletByName("notawallet"))
                .rejects
                .toMatchObject({
                    code: 404
                });
        })
    });

    describe("getWalletByUUID", () => {
        it("should get Twijn's wallet by UUID", async () => {
            const wallets = await api.external.getWalletByUUID("d98440d6-5117-4ac8-bd50-70b086101e3e");
            expect(wallets.data.length).toBeGreaterThan(0);
            for (const wallet of wallets.data) {
                expect(wallet).toMatchObject<Wallet>(walletExample);
            }
        });

        it("should fail with 'internal_server_error' to get 'notawallet' by UUID", async () => {
            await expect(api.external.getWalletByUUID("notawallet"))
                .rejects
                .toMatchObject({
                    error: "internal_server_error",
                });
        });

        const ZEROS = "00000000-0000-0000-0000-000000000000";
        it(`should fail with code 404 to get '${ZEROS}' by UUID`, async () => {
            await expect(api.external.getWalletByUUID(ZEROS))
                .rejects
                .toMatchObject({
                    code: 404
                });
        });
    });
    
    describe("createWallet", () => {
        const uuid = crypto.randomUUID();
        const name = crypto.randomUUID().substring(0, 8);

        it("should create a new wallet", async () => {
            const wallet = await api.external.createWallet(PRIVATE_KEY, uuid, name);
            console.log(`Created wallet - UUID: ${uuid}, Name: ${name}, Address: ${wallet.address}`);
            expect(wallet).toMatchObject<WalletCreateResponse>({
                privatekey: expect.any(String),
                address: expect.any(String)
            });
        });

        it("should fail to create duplicate wallet", async () => {
            await expect(api.external.createWallet(PRIVATE_KEY, uuid, name))
                .rejects
                .toMatchObject({
                    code: 500
                });
        });
    });

    describe("giveMoney", () => {
        const AMOUNT = 6.9;
        it("should give money to a wallet", async () => {
            const wallet = await api.external.giveMoney(PRIVATE_KEY, "k4wq6w8umr", AMOUNT);
            console.log(`Sent ${AMOUNT} to ${wallet.address}. New balance: ${wallet.balance}`);
            expect(wallet).toMatchObject<Wallet>(walletExample);
        })
    });

});
