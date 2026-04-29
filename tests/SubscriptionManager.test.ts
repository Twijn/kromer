import { APIError, KromerApi, Subscription } from "../src";

const api = new KromerApi({
	syncNode: "https://kromer.herrkatze.com/api/krist/",
});

const knownAddress = "kyi3yx2nmi";

const subscriptionExample: Partial<Subscription> = {
	id: expect.any(Number),
	name: expect.any(String),
	status: expect.stringMatching(/active|closed|cancelled/),
	description: expect.any(String),
	price: expect.any(Number),
	period: expect.any(Number),
	maxSubscribers: expect.any(Number),
	subscribers: expect.any(Number),
	subscribed: expect.any(Boolean),
	owns: expect.any(Boolean),
	unsubscribable: expect.any(Boolean),
	created: expect.any(Date),
};

describe("SubscriptionManager", () => {
	describe("listSubscriptions", () => {
		it("should list subscriptions for a valid name filter", async () => {
			const result = await api.subscriptions.listSubscriptions({ name: "anyname" });

			expect(Array.isArray(result.subscriptions)).toBe(true);
			expect(result.total).toBeGreaterThanOrEqual(result.count);
			expect(result.subscriptions.length).toBe(result.count);

			result.subscriptions.forEach((subscription) => {
				expect(subscription).toMatchObject(subscriptionExample);
				expect(subscription.created).toBeInstanceOf(Date);
				if (subscription.nextPayment !== null) {
					expect(subscription.nextPayment).toBeInstanceOf(Date);
				}
			});
		});

		it("should accept a valid address filter", async () => {
			const result = await api.subscriptions.listSubscriptions({ address: knownAddress });

			expect(Array.isArray(result.subscriptions)).toBe(true);
			expect(result.total).toBeGreaterThanOrEqual(result.count);
			expect(result.subscriptions.length).toBe(result.count);
		});
	});

	describe("getSubscription", () => {
		it("should reject an invalid subscription id", async () => {
			await expect(
				api.subscriptions.getSubscription(-1)
			).rejects.toMatchObject<Partial<APIError>>({
				ok: false,
			});
		});
	});
});
