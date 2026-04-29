import { APIResponse } from "./APIResponse";
import { Paginated, PaginatedQuery } from "./pagination";

export type SubscriptionBaseResponse<T> = APIResponse & {
    data: T;
}

export type SubscriptionStatus = "active" | "closed" | "cancelled";

export type Subscription = {
    id: number;
    name: string;
    status: SubscriptionStatus;
    description: string;
    price: number;
    period: number;
    maxSubscribers: number;
    subscribers: number;
    allowedSubscribers?: string[];

    subscribed: boolean;
    owns: boolean;
    unsubscribable: boolean;

    created: Date;
    nextPayment: Date | null;
}

export type CreateSubscriptionBody = {
    privatekey: string;
    /** Name or metaname for the subscription (foo, foo.kro, shop@foo.kro) */
    name: string;
    description: string;
    price: number;
    /** Subscription period in minutes */
    period: number;
    maxSubscribers?: number;
    allowedSubscribers?: string[];
}

export type ListSubscriptionRequest = PaginatedQuery & {
    address?: string;
    name?: string;
    excludeOwned?: boolean;
    onlyOwned?: boolean;
    onlyUnsubscribable?: boolean;
}

export type CreateSubscriptionResponse = { id: number };
export type SubscribeResponse = { nextPayment: Date };
export type ListSubscriptionsResponse = Paginated & { subscriptions: Subscription[] };
