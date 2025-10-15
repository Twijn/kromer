import type {
	MotdResponse,
	LoginResponse,
	APIResponse,
	APIError, SubscriptionLevel
} from './types';
import AddressManager from './managers/AddressManager';
import TransactionManager from './managers/TransactionManager';
import NameManager from './managers/NameManager';
import {WebSocketManager} from "./managers/WebSocketManager";
import ExternalManager from "./managers/ExternalManager";

export interface KromerApiOptions {
	syncNode: string;
    internalSyncNode?: string;
    requestTimeout: number;
}

export class KromerApi {
	public readonly options: KromerApiOptions = {
		syncNode: 'https://kromer.reconnected.cc/api/krist/',
        requestTimeout: 10_000
	};

	private readonly addressManager: AddressManager;
    private readonly externalManager: ExternalManager;
	private readonly transactionManager: TransactionManager;
	private readonly nameManager: NameManager;

	constructor(options: Partial<KromerApiOptions> = {}) {
		this.options = {
			...this.options,
			...options
		};

        if (!this.options.internalSyncNode) {
            const url = new URL(this.options.syncNode);
            url.pathname = "";
            this.options.internalSyncNode = url.toString();
        }

		if (!this.options.syncNode.endsWith('/')) {
			this.options.syncNode += '/';
		}

		this.addressManager = new AddressManager(this);
        this.externalManager = new ExternalManager(this);
		this.transactionManager = new TransactionManager(this);
		this.nameManager = new NameManager(this);
	}

    /**
     * Everything related to Kromer Addresses
     */
    public get addresses() {
        return this.addressManager;
    }

    /**
     * Everything related to external endpoints
     */
    public get external() {
        return this.externalManager;
    }

	/**
	 * Everything related to Kromer Transactions
	 */
	public get transactions() {
		return this.transactionManager;
	}

	/**
	 * Everything related to Kromer Names
	 */
	public get names() {
		return this.nameManager;
	}

    private async fetchRaw<T extends object>(method: 'POST' | 'GET', uri: string, body: unknown = null, syncNode?: string, headers?: Record<string, string>): Promise<T | APIError> {
        let response: Response;
        try {
            const fetchOptions: RequestInit = {
                signal: AbortSignal.timeout(this.options.requestTimeout)
            };

            const targetNode = syncNode ?? this.options.syncNode;
            if (method === 'POST') {
                response = await fetch(targetNode + uri, {
                    ...fetchOptions,
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    }
                });
            } else {
                response = await fetch(targetNode + uri, {
                    ...fetchOptions,
                    headers
                });
            }
        } catch (error) {
            // Handle timeout errors
            if (error instanceof Error && error.name === 'AbortError') {
                throw {
                    ok: false,
                    error: 'request_timeout',
                    message: 'Request timed out'
                } as APIError;
            }

            // Re-throw other network errors as API errors
            throw {
                ok: false,
                error: 'network_error',
                message: error instanceof Error ? error.message : 'Network request failed'
            } as APIError;
        }

        const data = await response.json() as T|APIError;

        if (!response.ok || !data) {
            if ('error' in data && 'message' in data) {
                return data as APIError;
            }
            throw {
                ok: false,
                code: response.status,
                error: 'api_error',
                message: 'Unknown API error: ' + response.status
            } as APIError;
        }

        return data;
    }

	/**
     * Fetches from the Kromer API.
     * This differs from fetchRaw in that it will throw errors that don't have a truthy "ok" attribute.
     * @param method The method to use
     * @param uri The URI, without a beginning slash (/)
     * @param body POST body
     * @param syncNode The node to use for the request. If not provided, the default node will be used.
     * @param headers Headers to send with the request
     * @private
     * @returns The response
     * @throws {APIError}
     */
    private async fetch<T extends APIResponse>(method: 'POST' | 'GET', uri: string, body: unknown = null, syncNode?: string, headers?: Record<string, string>): Promise<T> {
        const data: T | APIError = await this.fetchRaw(method, uri, body, syncNode, headers);

        if (!data.ok) {
            throw data as APIError;
        }

		return data as T;
	}

	/**
     * Sends a raw GET to Kromer. This should usually not be used outside this package!
     * @param uri The URI, without a beginning slash (/)
     * @param query Query parameters as an object
     * @param syncNode The node to use for the request. If not provided, the default node will be used.
     * @param useRaw Whether to use the raw fetch function. This should only be used if you know what you're doing.
     * @param headers Headers to send with the request
     * @returns The resulting response
     * @throws {APIError}
     */
    public async get<T extends object, R = T extends APIResponse ? T : T | APIError>(uri: string, query: unknown = null, syncNode?: string, useRaw: boolean = false, headers?: Record<string, string>): Promise<typeof useRaw extends true ? T : R> {
        if (query) {
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(query)) {
                if (value !== null && value !== undefined) {
                    params.append(key, String(value));
                }
            }
            uri += '?' + params.toString();
        }

        if (useRaw) {
            return await this.fetchRaw<T>('GET', uri, null, syncNode, headers) as any;
        } else {
            return await this.fetch<T & APIResponse>('GET', uri, null, syncNode, headers) as any;
        }
    }

	/**
     * Sends a raw POST to Kromer. This should usually not be used outside this package!
     * @param uri The URI, without a beginning slash (/)
     * @param body The POST body
     * @param syncNode The node to use for the request. If not provided, the default node will be used.
     * @param useRaw Whether to use the raw fetch function. This should only be used if you know what you're doing.
     * @param headers Headers to send with the request
     * @returns The resulting response
     * @throws {APIError}
     */
    public async post<T extends object, R = T extends APIResponse ? T : T | APIError>(uri: string, body: unknown, syncNode?: string, useRaw: boolean = false, headers?: Record<string, string>): Promise<typeof useRaw extends true ? T : R> {
        if (useRaw) {
            return await this.fetchRaw<T>('POST', uri, body, syncNode, headers) as any;
        } else {
            return await this.fetch<T & APIResponse>('POST', uri, body, syncNode, headers) as any;
        }
    }

	/**
	 * Authenticates a private key with Kromer
	 * Useful for retrieving the address of a private key
	 * @param privatekey
	 * @returns The login response
	 * @throws {APIError}
	 */
	public async login(privatekey: string): Promise<LoginResponse> {
		return (await this.post('login', { privatekey })) as LoginResponse;
	}

	/**
	 * Retrieves the current Kromer MOTD
	 * @returns The MOTD object
	 * @throws {APIError}
	 */
	public async getMOTD(): Promise<MotdResponse> {
		const motd: MotdResponse = (await this.get('motd')) as MotdResponse;
		motd.motd_set = new Date(motd.motd_set);
		return motd;
	}

	public createWsClient(privatekey?: string, initialSubscriptions: SubscriptionLevel[] = []) {
		return new WebSocketManager(
			this,
			privatekey,
			initialSubscriptions
		);
	}
}
