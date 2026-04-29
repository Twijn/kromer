import { CreateSubscriptionBody, CreateSubscriptionResponse, ListSubscriptionRequest, ListSubscriptionsResponse, SubscribeResponse, Subscription, SubscriptionBaseResponse } from "../types";
import { BaseManager } from "./BaseManager";

export default class SubscriptionManager extends BaseManager {
    private readonly internalSyncNode: string;
    
    public constructor(api: any) {
        super(api);
        this.internalSyncNode = api.options.internalSyncNode;
    }

    private async get<T extends object>(uri: string, query?: unknown): Promise<SubscriptionBaseResponse<T>> {
        return await this.api.get<SubscriptionBaseResponse<T>>(uri, query, this.internalSyncNode, true);
    }

    private async post<T extends object>(uri: string, body: unknown): Promise<SubscriptionBaseResponse<T>> {
        return await this.api.post<SubscriptionBaseResponse<T>>(uri, body, this.internalSyncNode, true);
    }

    private async delete(uri: string, body: unknown): Promise<SubscriptionBaseResponse<void>> {
        return await this.api.delete<SubscriptionBaseResponse<void>>(uri, body, this.internalSyncNode, true);
    }

    public async createSubscription(body: CreateSubscriptionBody): Promise<CreateSubscriptionResponse> {
        const response = await this.post<CreateSubscriptionResponse>("api/v1/subscriptions", body);
        return response.data;
    }

    public async listSubscriptions(options: ListSubscriptionRequest): Promise<ListSubscriptionsResponse> {
        const response = await this.get<ListSubscriptionsResponse>("api/v1/subscriptions", {
            address: options.address,
            name: options.name,
            exclude_owned: options.excludeOwned,
            only_owned: options.onlyOwned,
            only_unsubscribable: options.onlyUnsubscribable,
            limit: options.limit,
            offset: options.offset,
        });
        response.data.subscriptions = response.data.subscriptions.map((s) => this.wrapSubscription(s));
        return response.data;
    }
    
    public async getSubscription(id: number): Promise<Subscription> {
        const response = await this.get<Subscription>(`api/v1/subscriptions/${id}`);
        return this.wrapSubscription(response.data);
    }

    public async cancelSubscription(id: number, privatekey: string): Promise<void> {
        await this.delete(`api/v1/subscriptions/${id}`, { privatekey });
    }

    public async closeSubscription(id: number, privatekey: string): Promise<void> {
        await this.post(`api/v1/subscriptions/${id}/close`, { privatekey });
    }

    public async subscribe(id: number, privatekey: string): Promise<SubscribeResponse> {
        const response = await this.post<SubscribeResponse>(`api/v1/subscriptions/${id}/subscribe`, { privatekey });
        return {
            ...response.data,
            nextPayment: new Date(response.data.nextPayment),
        };
    }

    public async unsubscribe(id: number, privatekey: string): Promise<void> {
        await this.post(`api/v1/subscriptions/${id}/unsubscribe`, { privatekey });
    }
}