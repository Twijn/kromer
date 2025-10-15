export type Wallet = {
    id: number;
    address: string;
    balance: number;
    created_at: Date;
    locked: boolean;
    total_in: number;
    total_out: number;
}

export type WalletsResponse = {
    data: Wallet[];
}

export type WalletCreateResponse = {
    privatekey: string;
    address: string;
}

export type GiveMoneyResponse = {
    wallet: Wallet;
}
