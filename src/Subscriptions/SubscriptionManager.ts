import { RedisClientType, createClient } from "redis";
import { UserManager } from "../User/UserManager";

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private redisClient: RedisClientType;
    private publishClient: RedisClientType;

    private subscriptions: Map<string, string[]> = new Map();
    private reverseSubscriptions: Map<string, string[]> = new Map();

    private constructor() {
        this.redisClient = createClient();
        this.publishClient = createClient();

        // Connect both clients with async/await to ensure connection
        this.connectClients();
    }

    private async connectClients() {
        try {
            await this.redisClient.connect();
            await this.publishClient.connect();  // Ensure publishClient is connected
            console.log("Redis clients connected successfully");
        } catch (error) {
            console.error("Error connecting to Redis:", error);
        }
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public subscribe(userId: string, subscription: string) {
        if (this.subscriptions.get(userId)?.includes(subscription)) {
            return;
        }

        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat(userId));

        if (this.reverseSubscriptions.get(subscription)?.length === 1) {
            this.redisClient.subscribe(subscription, this.redisCallbackHandler);
        }
    }

    public unsubscribe(userId: string, subscriptionId: string) {
        const subscriptions = this.subscriptions.get(userId);
        if (subscriptions) {
            this.subscriptions.set(userId, subscriptions.filter(s => s !== subscriptionId));
        }

        const reverseSubscriptions = this.reverseSubscriptions.get(subscriptionId);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscriptionId, reverseSubscriptions.filter(s => s !== userId));

            if (this.reverseSubscriptions.get(subscriptionId)?.length === 0) {
                this.reverseSubscriptions.delete(subscriptionId);
                this.redisClient.unsubscribe(subscriptionId);
            }
        }
    }

    public async redisPublishHandler(channelId: string, message: string) {
        try {
            if (!this.publishClient.isOpen) {
                await this.publishClient.connect();  // Ensure the client is open before publishing
            }
            this.publishClient.publish(channelId, JSON.stringify(message));
        } catch (error) {
            console.error("Error publishing to Redis:", error);
        }
    }

    private redisCallbackHandler = (message: string, channel: string) => {
        const parsedMessage = JSON.parse(message);
        this.reverseSubscriptions.get(channel)?.forEach(s => UserManager.getInstance().getUser(s)?.emit(parsedMessage));
    }

    public userLeft(userId: string) {
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
    }
}
