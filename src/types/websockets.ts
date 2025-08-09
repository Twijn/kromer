import {APIResponse} from "./APIResponse";
import {MakeTransactionBody} from "./maketransaction";
import {Address} from "./address";

export type SubscriptionLevel =
    "transactions"|"ownTransactions"|
    "names"|"ownNames"|
    "motd";

export type WebSocketRequest = {
    id?: number;
    type: string;
}

export type WebSocketResponse = {
    id?: number;
    type: string;
}

export type WSSubscribeUnsubscribeRequest = WebSocketRequest & {
    event: SubscriptionLevel;
}

export type WSMakeTransactionRequest =
    WebSocketRequest &
    MakeTransactionBody & {
    type: "make_transaction";
}

export type WSWebsocketInitResponse = APIResponse & {
    url: string;
    expires: number;
}

export type WSValidSubscriptionLevelResponse = WebSocketResponse & {
    valid_subscription_levels: SubscriptionLevel[];
}

export type WSCurrentSubscriptionLevelResponse = WebSocketResponse & {
    subscription_level: SubscriptionLevel[];
}

export type WSMeResponse = WebSocketResponse & {
    isGuest: boolean;
    address?: Address;
}

export type WSLoginRequest = WebSocketRequest & {
    privatekey: string;
};

export type WSAddressRequest = WebSocketRequest & {
    address: string;
}

export type WSAddressResponse = WebSocketResponse & {
    address: Address;
}

export type WSHelloPackage = {
    name: string;
    version: string;
    author: string;
    license: string;
    repository: string;
    git_hash: string|null;
}

export type WSHelloConstants = {
    wallet_version: number;
    nonce_max_size: number;
    name_cost: number;
    min_work: number;
    max_work: number;
    work_factor: number;
    seconds_per_block: number;
}

export type WSHelloCurrency = {
    address_prefix: string;
    name_suffix: string;
    currency_name: string;
    currency_symbol: string;
}

export type WSHelloResponse = WebSocketResponse & {
    type: "hello",
    server_time: string;
    motd: string;
    set: string|null;
    motd_set: string|null;
    public_url: string;
    public_ws_url: string;
    mining_enabled: boolean;
    transactions_enabled: boolean;
    debug_mode: boolean;
    package: WSHelloPackage;
    constants: WSHelloConstants;
    currency: WSHelloCurrency;
    notice: string;
}

export type WSKeepAliveResponse = WebSocketResponse & {
    type: "keep_alive";
    server_time: string;
}
