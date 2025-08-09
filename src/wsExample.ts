import {KromerApi} from "./KromerApi";

const kromer = new KromerApi();
const client = kromer.createWsClient(undefined, [
    "transactions",
]);

// Log all Transaction events
client.on("transaction", transaction => {
    console.log(transaction);
});

client.on("ready", () => {
    // Log current subscriptions
    client.getSubscriptions().then(console.log, console.error);

    // Get an address
    client.getAddress("serverwelf").then(console.log, console.error);
});

client.connect().catch(console.error);
