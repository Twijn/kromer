import {BaseManager} from "./BaseManager";
import {GiveMoneyResponse, Wallet, WalletCreateResponse, WalletsResponse} from "../types/external";
import {APIError} from "../types";

export default class ExternalManager extends BaseManager {
    private readonly internalSyncNode: string;

    public constructor(api: any) {
        super(api);
        this.internalSyncNode = api.options.internalSyncNode;
    }

    private wrapWallet(wallet: Wallet): Wallet {
        return {
            ...wallet,
            created_at: new Date(wallet.created_at),
        }
    }

    /**
     * Wraps the response of a wallet request
     * @param response The response to wrap
     * @returns The wrapped response
     * @throws {APIError}
     * @private
     */
    private wrapWalletsResponse(response: WalletsResponse|APIError): WalletsResponse {
        if ('data' in response) {
            response.data = response.data.map((x) => this.wrapWallet(x));
            return response;
        } else {
            throw response as APIError;
        }
    }

    private async get<T extends object>(uri: string): Promise<T | APIError> {
        return await this.api.get<T>(uri, undefined, this.internalSyncNode, true);
    }

    private async post<T extends object>(uri: string, body: unknown, kromerKey: string): Promise<T | APIError> {
        return await this.api.post<T>(uri, body, this.internalSyncNode, true, {
            ["Kromer-Key"]: kromerKey,
        });
    }

    /**
     * Retrieves a wallet by its name
     * @returns The found wallet
     * @throws {APIError}
     * @param name The name of the wallet to retrieve
     */
    public async getWalletByName(name: string): Promise<WalletsResponse> {
        const response = await this.get<WalletsResponse>('api/v1/wallet/by-name/' + encodeURIComponent(name));
        return this.wrapWalletsResponse(response);
    }

    /**
     * Retrieves a wallet by its UUID
     * @returns The found wallet
     * @throws {APIError}
     * @param uuid The UUID of the wallet to retrieve
     */
    public async getWalletByUUID(uuid: string): Promise<WalletsResponse> {
        const response = await this.get<WalletsResponse>('api/v1/wallet/by-player/' + encodeURIComponent(uuid));
        return this.wrapWalletsResponse(response);
    }

    /**
     * Creates a new wallet
     * @returns The created wallet private key and address
     * @throws {APIError}
     * @param kromerKey The Kromer key to use for authentication
     * @param uuid The UUID of the player to create the wallet for
     * @param name The name of the wallet to create
     */
    public async createWallet(kromerKey: string, uuid: string, name: string): Promise<WalletCreateResponse> {
        const response = await this.post<WalletCreateResponse>('api/_internal/wallet/create', {
            uuid,
            name,
        }, kromerKey);

        if ('privatekey' in response && 'address' in response) {
            return response;
        } else {
            throw response as APIError;
        }
    }

    public async giveMoney(kromerKey: string, address: string, amount: number): Promise<Wallet> {
        const response = await this.post<GiveMoneyResponse>('api/_internal/wallet/give-money', {
            address,
            amount,
        }, kromerKey);

        if ('wallet' in response) {
            return this.wrapWallet(response.wallet);
        } else {
            throw response as APIError;
        }
    }

}
