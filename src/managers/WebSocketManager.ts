import {KromerApi} from "../KromerApi";
import {
    Address,
    APIError,
    APIResponse,
    SubscriptionLevel, TransactionWithMeta,
    WebSocketRequest, WebSocketResponse,
    WSAddressRequest,
    WSAddressResponse,
    WSCurrentSubscriptionLevelResponse,
    WSHelloResponse, WSKeepAliveResponse, WSLoginRequest,
    WSMeResponse,
    WSSubscribeUnsubscribeRequest,
    WSValidSubscriptionLevelResponse
} from "../types";
import {WSEventEmitterManager} from "./WSEventEmitterManager";

export class WebSocketManager extends WSEventEmitterManager {
    private nextId = 1;
    private socket: WebSocket|null = null;

    private hello: WSHelloResponse|null = null;

    private requests = new Map<number, (data: APIResponse) => void>();

    constructor(api: KromerApi,
                private privatekey: string|null = null,
                private initialSubscriptions: SubscriptionLevel[] = []) {
        super(api);
    }

    public get status() {
        return this.hello;
    }

    private get<D extends WebSocketRequest, T>(data: D): Promise<T> {
        return new Promise((resolve, reject) => {
            const id = this.nextId++;

            const timeoutTimeout = setTimeout(() => {
                reject({
                    ok: false,
                    error: "request_timed_out",
                    message: "Request timed out",
                } as APIError);
            }, 3_000);

            this.requests.set(id, result => {
                clearTimeout(timeoutTimeout);
                if (result.ok) {
                    resolve(result as T);
                } else {
                    reject(result);
                }
            });

            const payload: D & WebSocketRequest = {
                ...data,
                id,
            }
            this.socket?.send(JSON.stringify(payload));
        });
    }

    private initializeSocket() {
        if (!this.socket) {
            throw {
                ok: false,
                error: "socket_not_initialized",
                message: "Socket not initialized",
            } as APIError;
        }

        this.socket.onclose = event => {
            this.fire("close", event);
            this.reconnect();
        }

        this.socket.onerror = event => {
            this.fire("error", event);
            this.reconnect();
        }

        this.socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);

                if (data.id) {
                    const request = this.requests.get(data.id);
                    if (request) {
                        request(data);
                        this.requests.delete(data.id);
                    }
                } else {
                    if (data.type === "hello") {
                        this.handleHello(data as WSHelloResponse).catch(console.error);
                    } else if (data.type === "keepalive") {
                        const {server_time} = data as WSKeepAliveResponse;
                        this.fire("keepalive", new Date(server_time));
                    } else if (data.type === "event") {
                        if (data.event === "transaction") {
                            let transaction = data.transaction as TransactionWithMeta;
                            transaction.meta = this.api.transactions.parseMetadata(transaction);
                            this.fire("transaction", transaction);
                        } else {
                            console.log(data);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    private async handleHello(data: WSHelloResponse) {
        this.hello = data;

        const { subscription_level } = await this.getSubscriptions();

        const addSubs = this.initialSubscriptions.filter(x => !subscription_level.includes(x));
        const removeSubs = subscription_level.filter(x => !this.initialSubscriptions.includes(x));

        await Promise.all([
            ...addSubs.map(x => this.subscribe(x)),
            ...removeSubs.map(x => this.unsubscribe(x)),
        ]);

        this.fire("ready", data as WSHelloResponse);
    }

    private reconnect() {
        if (this.socket) {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.close();
            }
            this.socket = null;
            setTimeout(this.connect, 3000);
        }
    }

    public async connect() {
        this.socket = await this.wsStart(this.privatekey ?? undefined);
        this.initializeSocket();
    }

    public async subscribe(event: SubscriptionLevel) {
        return await this.get<WSSubscribeUnsubscribeRequest, WSCurrentSubscriptionLevelResponse>({
            type: "subscribe",
            event,
        });
    }

    public async unsubscribe(event: SubscriptionLevel) {
        return await this.get<WSSubscribeUnsubscribeRequest, WSCurrentSubscriptionLevelResponse>({
            type: "unsubscribe",
            event,
        });
    }

    public async getValidSubscriptionLevels(): Promise<WSValidSubscriptionLevelResponse> {
        return await this.get<WebSocketRequest, WSValidSubscriptionLevelResponse>({
            type: "get_valid_subscription_levels",
        });
    }

    public async getSubscriptions(): Promise<WSCurrentSubscriptionLevelResponse> {
        return await this.get<WebSocketRequest, WSCurrentSubscriptionLevelResponse>({
            type: "get_subscription_level",
        });
    }

    public async getMe(): Promise<WSMeResponse> {
        return await this.get<WebSocketRequest, WSMeResponse>({
            type: "me",
        })
    }

    public async login(privatekey: string): Promise<WSMeResponse> {
        return await this.get<WSLoginRequest, WSMeResponse>({
            type: "login",
            privatekey,
        })
    }

    public async logout(): Promise<void> {
        await this.get<WebSocketRequest, WebSocketResponse>({
            type: "logout",
        });
    }

    public async getAddress(address: string): Promise<Address> {
        const response = await this.get<WSAddressRequest, WSAddressResponse>({
            type: "address",
            address,
        });
        return this.wrapAddress(response.address);
    }

}
