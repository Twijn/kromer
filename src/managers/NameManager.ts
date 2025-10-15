import { BaseManager } from './BaseManager';
import type {
    Name,
    NameCheckResponse,
    NameCostResponse,
    NameResponse,
    NamesResponse,
    PaginatedQuery,
    RegisterNameBody, TransferNameBody, UpdateNameBody
} from '../types';

export default class NameManager extends BaseManager {
	/**
	 * Removes ending .kro on names
	 * @param name
	 * @private
	 */
	private normalizeName(name: string): string {
		return name.toLowerCase().replace('.kro', '');
	}

	/**
	 * Retrieves all names
	 * @param query Pagination options
	 * @returns Found names
	 * @throws {APIError}
	 */
	public async getAll(query?: PaginatedQuery): Promise<NamesResponse> {
		const response = await this.api.get<NamesResponse>('names', query);
		return this.wrapNameResponse(response);
	}

	/**
	 * Retrieves all names, sorted by the latest
	 * @param query Pagination query options
	 * @returns Sorted names
	 * @throws {APIError}
	 */
	public async getLatest(query?: PaginatedQuery): Promise<NamesResponse> {
		const response = await this.api.get<NamesResponse>('names/new', query);
		return this.wrapNameResponse(response);
	}

	/**
	 * Retrieves a single name
	 * @param name The address to retrieve (e.g. reconnected.kro)
	 * @returns The found name
	 * @throws {APIError}
	 */
	public async get(name: string): Promise<Name> {
		name = this.normalizeName(name);
		const response = await this.api.get<NameResponse>(`names/${name}`);
		return this.wrapName(response.name);
	}

	/**
	 * Retrieves the current cost of a new name
	 * @returns The current name cost
	 * @throws {APIError}
	 */
	public async getCost(): Promise<number> {
		const response = await this.api.get<NameCostResponse>('names/cost');
		return response.name_cost;
	}

	/**
	 * Checks if a name is currently available
	 * @param name The name to check
	 * @returns If the name is available
	 * @throws {APIError}
	 */
	public async check(name: string): Promise<boolean> {
		name = this.normalizeName(name);
		const response = await this.api.get<NameCheckResponse>(`names/check/${name}`);
		return response.available;
	}

	/**
	 * Registers a new name
	 * @param name The name to register
	 * @param body Name register body
	 * @throws {APIError}
	 */
	public async register(name: string, body: RegisterNameBody): Promise<void> {
		name = this.normalizeName(name);
		await this.api.post<NameResponse>(`names/${name}`, body);
	}

    /**
     * Transfers a name to another address
     * @param name The name to transfer
     * @param body Transfer name body
     * @returns The transferred name
     * @throws {APIError}
     */
    public async transfer(name: string, body: TransferNameBody): Promise<Name> {
        name = this.normalizeName(name);
        const response = await this.api.post<NameResponse>(`names/${name}/transfer`, body);
        return this.wrapName(response.name);
    }

    /**
     * Updates a name
     * @param name The name to update
     * @param body Update name body
     * @returns The updated name
     * @throws {APIError}
     */
    public async update(name: string, body: UpdateNameBody): Promise<Name> {
        name = this.normalizeName(name);
        const response = await this.api.post<NameResponse>(`names/${name}/update`, body);
        return this.wrapName(response.name);
    }
}
