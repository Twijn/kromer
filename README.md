# Kromer API Wrapper

> This wrapper is still a work in progress! Some things might be broken or might not exist in this wrapper yet.

API Wrapper for Kromer, a fake currency built for Reconnected.CC

## Installation

```bash
npm install kromer
```

## Getting Started

Simple usage:

```ts
import { KromerApi } from "kromer";

// Create a new KromerApi Instance
const api = new KromerApi();

api.getMOTD().then(motd => {
    console.log(motd);
});

api.addresses;    // Stores endpoints related to addresses
api.names;        // Stores endpoints related to names
api.transactions; // Stores endpoints related to transactions
```
