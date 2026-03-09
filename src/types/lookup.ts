import { PaginatedQuery } from "./pagination";

export type LookupQuery = PaginatedQuery & {
    orderBy?: string;
    order?: "ASC" | "DESC";
};

export type TransactionLookupQuery = LookupQuery & {
    orderBy?: "id"|"from"|"to"|"value"|"time"|"sent_name"|"sent_metaname";
    includeMined?: boolean;
};

export type NameLookupQuery = LookupQuery & {
    orderBy?: "name"|"owner"|"original_owner"|"registered"|"updated"|"transferred"|"transferredOrRegistered"|"a"|"unpaid";
}
