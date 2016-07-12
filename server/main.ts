/// <reference path="../typings/globals/node/index.d.ts" />

// Startup script for running BST
import {BespokeServer} from "./bespoke-server";
import {WebhookRequest} from "./../core/webhook-request";

if (process.argv.length < 3) {
    console.error("No tool specified. Must be first argument.");
    process.exit(1);
}

let tool = process.argv[2];
// console.log("Tool: " + tool);


if (tool === "server") {
    if (process.argv.length < 5) {
        console.error("For server, must specify port to forward to!");
        process.exit(1);
    }

    let webhookPort: number = parseInt(process.argv[3]);
    let serverPort: number = parseInt(process.argv[4]);
    let bespokeServer = new BespokeServer(webhookPort, serverPort);
    bespokeServer.start();
}
