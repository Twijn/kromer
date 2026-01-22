# Kromer API Wrapper

A TypeScript API wrapper for [Kromer](https://kromer.reconnected.cc), a currency system built for [Reconnected.CC](https://reconnected.cc).

## Installation

```bash
npm install kromer
```

## Getting Started

```ts
import { KromerApi } from "kromer";

const api = new KromerApi();

// Get the message of the day
const motd = await api.getMOTD();
console.log(motd.motd);

// Get current money supply
const supply = await api.getSupply();
console.log(`Current supply: ${supply} KRO`);
```

## Configuration

```ts
const api = new KromerApi({
  syncNode: 'https://kromer.reconnected.cc/api/krist/', // API endpoint
  requestTimeout: 10_000 // Request timeout in ms
});
```

## API Reference

### Core Methods

| Method | Description |
|--------|-------------|
| `api.getMOTD()` | Get the message of the day |
| `api.getSupply()` | Get the current money supply |
| `api.login(privatekey)` | Authenticate and get address info for a private key |

---

### Addresses (`api.addresses`)

```ts
// Resolve an address or name to an Address object
const address = await api.addresses.resolve("ktwijnmall");
const address = await api.addresses.resolve("example.kro");

// Get a specific address
const address = await api.addresses.get("ktwijnmall");

// Get multiple addresses at once
const addresses = await api.addresses.getMultiple(["ktwijnmall", "k111111111"]);

// Get all addresses (paginated)
const addresses = await api.addresses.getAll({ limit: 50, offset: 0 });

// Get richest addresses
const rich = await api.addresses.getRich({ limit: 10 });

// Get names owned by an address
const names = await api.addresses.getNames("ktwijnmall");

// Get transactions for an address
const transactions = await api.addresses.getTransactions("ktwijnmall", { limit: 50 });

// Decode address from private key (offline)
const address = api.addresses.decodeAddressFromPrivateKey("yourprivatekey");
```

---

### Transactions (`api.transactions`)

```ts
// Get all transactions (paginated)
const transactions = await api.transactions.getAll({ limit: 50 });

// Get latest transactions
const latest = await api.transactions.getLatest({ limit: 10 });

// Get a specific transaction
const tx = await api.transactions.get(123456);

// Get transaction with parsed metadata
const tx = await api.transactions.getWithMeta(123456);
console.log(tx.meta.entries);          // Array of { name, value } pairs
console.log(tx.meta.minecraftPlayer);  // { uuid, name } if present

// Send a transaction
const tx = await api.transactions.send({
  privatekey: "yourprivatekey",
  to: "ktwijnmall",       // or "example.kro"
  amount: 100,
  metadata: "message=Hello;custom=value"  // optional
});
```

---

### Names (`api.names`)

```ts
// Get all names (paginated)
const names = await api.names.getAll({ limit: 50 });

// Get latest registered names
const latest = await api.names.getLatest({ limit: 10 });

// Get a specific name
const name = await api.names.get("example.kro");

// Check name availability
const available = await api.names.check("example");

// Get current name registration cost
const cost = await api.names.getCost();

// Register a new name
await api.names.register("example", {
  privatekey: "yourprivatekey"
});

// Transfer a name to another address
const name = await api.names.transfer("example.kro", {
  privatekey: "yourprivatekey",
  address: "ktwijnmall"
});

// Update name data
const name = await api.names.update("example.kro", {
  privatekey: "yourprivatekey",
  a: "newdata"  // Optional A record
});
```

---

### WebSockets

Real-time updates via WebSocket connection:

```ts
// Create a WebSocket client
const ws = api.createWsClient("yourprivatekey", ["transactions", "ownTransactions"]);

// Connect to the server
await ws.connect();

// Listen for events
ws.on("ready", (hello) => {
  console.log("Connected!", hello);
});

ws.on("transaction", (tx) => {
  console.log("New transaction:", tx);
});

ws.on("keepalive", (serverTime) => {
  console.log("Server time:", serverTime);
});

ws.on("close", (event) => {
  console.log("Connection closed");
});

// Manage subscriptions
await ws.subscribe("names");
await ws.unsubscribe("transactions");

// Get current subscription levels
const subs = await ws.getSubscriptions();

// Get valid subscription levels
const valid = await ws.getValidSubscriptionLevels();

// Get authenticated address info
const me = await ws.getMe();

// Login/logout
await ws.login("anotherprivatekey");
await ws.logout();

// Get address info via WebSocket
const address = await ws.getAddress("ktwijnmall");
```

**Subscription Levels:**
- `transactions` - All transactions
- `ownTransactions` - Transactions involving your address
- `names` - All name changes
- `ownNames` - Changes to names you own
- `motd` - Message of the day updates

---

### External API (`api.external`)

Server-side utilities for wallet management (requires Kromer API key):

```ts
// Get wallet by Minecraft username
const wallet = await api.external.getWalletByName("username");

// Get wallet by Minecraft UUID
const wallet = await api.external.getWalletByUUID("uuid-here");

// Create a new wallet (requires API key)
const { privatekey, address } = await api.external.createWallet(
  "your-kromer-key",
  "player-uuid",
  "player-name"
);

// Give money to an address (requires API key)
const wallet = await api.external.giveMoney("your-kromer-key", "ktwijnmall", 100);
```

---

## Error Handling

All methods throw `APIError` on failure:

```ts
import { APIError } from "kromer";

try {
  const address = await api.addresses.get("invalid");
} catch (error) {
  const apiError = error as APIError;
  console.log(apiError.error);   // Error code
  console.log(apiError.message); // Human-readable message
}
```

## Types

All types are exported from the package:

```ts
import {
  Address,
  Transaction,
  Name,
  MotdResponse,
  APIError,
  SubscriptionLevel,
  // ... and more
} from "kromer";
```

## License

MIT
