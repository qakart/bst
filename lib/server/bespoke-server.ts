import {NodeManager} from "./node-manager";
import {WebhookManager} from "./webhook-manager";
import {WebhookRequest} from "../core/webhook-request";
import {HTTPHelper} from "../core/http-helper";
import {Global} from "../core/global";

export class BespokeServer {
    private nodeManager: NodeManager;
    private webhookManager: WebhookManager;

    public constructor (private webhookPort: number, private nodePort: number) {}

    public start (started?: () => void): void {
        let self = this;

        let count = 0;
        // Make sure both NodeManager and WebhookManager have started
        let callbackCounter = function () {
            count++;
            if (count === 2) {
                if (started !== undefined && started !== null) {
                    started();
                }
            }
        };

        this.nodeManager = new NodeManager(this.nodePort);
        this.nodeManager.start(callbackCounter);

        this.webhookManager = new WebhookManager(this.webhookPort);
        this.webhookManager.start(callbackCounter);
        this.webhookManager.onWebhookReceived = function(webhookRequest: WebhookRequest) {
            // Check if this is a ping
            if (webhookRequest.isPing()) {
                HTTPHelper.respond(webhookRequest.sourceSocket, 200, "bst-server-" + Global.version());

            } else {
                if (webhookRequest.nodeID() === null) {
                    HTTPHelper.respond(webhookRequest.sourceSocket, 400, "No node specified. Must be included with the querystring as node-id.");
                } else {
                    // Lookup the node
                    let node = self.nodeManager.node(webhookRequest.nodeID());
                    if (node == null) {
                        HTTPHelper.respond(webhookRequest.sourceSocket, 404, "Node is not active: " + webhookRequest.nodeID());
                    } else {
                        node.forward(webhookRequest);
                    }
                }
            }
        };
    }

    public stop(callback: () => void): void {
        // Use a counter to see that both callbacks have completed
        // The beauty of Node - use non-synchronized counter variables like this safely :-)
        let count = 0;
        let callbackFunction = function () {
            count++;
            if (count === 2) {
                callback();
            }
        };
        this.nodeManager.stop(callbackFunction);
        this.webhookManager.stop(callbackFunction);
    }

}
