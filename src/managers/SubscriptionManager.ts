import { APIError, CreateSubscriptionBody, CreateSubscriptionResponse, ListSubscriptionRequest, ListSubscriptionsResponse, SubscribeResponse, Subscription, SubscriptionBaseResponse } from "../types";
import { BaseManager } from "./BaseManager";

export default class SubscriptionManager extends BaseManager {
    private readonly internalSyncNode: string;
    
    public constructor(api: any) {
        super(api);
        this.internalSyncNode = api.options.internalSyncNode;
    }

    private normalizeResponse<T>(response: unknown): SubscriptionBaseResponse<T> {
        if (typeof response === "object" && response !== null) {
            if (
                "ok" in response
                && (response as { ok?: boolean }).ok === false
                && "error" in response
                && typeof (response as { error?: unknown }).error === "string"
            ) {
                throw response as APIError;
            }

            if (
                "error" in response
                && typeof (response as { error?: unknown }).error === "object"
                && (response as { error?: unknown }).error !== null
                && "code" in ((response as { error: { code?: unknown } }).error)
                && typeof ((response as { error: { code?: unknown } }).error).code === "string"
            ) {
                const nestedError = (response as {
                    error: { code: string; message?: unknown }
                }).error;

                throw {
                    ok: false,
                    error: nestedError.code,
                    message: typeof nestedError.message === "string" ? nestedError.message : undefined,
                } as APIError;
            }

            if ("data" in response && (response as { data?: unknown }).data !== null) {
                return response as SubscriptionBaseResponse<T>;
            }
        }

        throw {
            ok: false,
            error: "api_error",
            message: "Invalid subscriptions API response",
        } as APIError;
    }

    private async get<T extends object>(uri: string, query?: unknown): Promise<SubscriptionBaseResponse<T>> {
        return this.normalizeResponse<T>(await this.api.get<SubscriptionBaseResponse<T>>(uri, query, this.internalSyncNode, true));
    }

    private async post<T extends object>(uri: string, body: unknown): Promise<SubscriptionBaseResponse<T>> {
        return this.normalizeResponse<T>(await this.api.post<SubscriptionBaseResponse<T>>(uri, body, this.internalSyncNode, true));
    }

    private async delete(uri: string, body: unknown): Promise<SubscriptionBaseResponse<void>> {
        return this.normalizeResponse<void>(await this.api.delete<SubscriptionBaseResponse<void>>(uri, body, this.internalSyncNode, true));
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