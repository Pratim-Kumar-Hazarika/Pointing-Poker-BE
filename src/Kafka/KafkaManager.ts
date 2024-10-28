import { Kafka } from "kafkajs";
// Uncomment to enable PostgreSQL integration
// import pg from "pg";

// PostgreSQL Client Setup (Uncomment if needed)
// const client = new pg.Client({
//   user: "your-username",
//   host: "localhost",
//   database: "your-database",
//   password: "your-password",
//   port: 5432,
// });

// client.connect();

// KafkaManager Singleton Class
export class KafkaManager {
  private static instance: KafkaManager;
  private kafka: Kafka;
  private producer;
  // private consumers: any[] = [];
  private isProducerConnected = false;

  private constructor() {
    this.kafka = new Kafka({
      clientId: "my-app",
      brokers: ["localhost:9092"],
    });
    this.producer = this.kafka.producer();
  }

  public static getInstance(): KafkaManager {
    if (!this.instance) {
      this.instance = new KafkaManager();
      console.log("KafkaManager instance created");
    }
    return this.instance;
  }

  // Connect the producer
  public async connectProducer() {
    if (!this.isProducerConnected) {
      await this.producer.connect();
      this.isProducerConnected = true;
      console.log("Kafka producer connected");
    }
  }

  // Send a message to a topic
  public async sendMessage(topic: string, message: string) {
    if (!this.isProducerConnected) {
      await this.connectProducer();
    }
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
    console.log(`Message sent to topic ${topic}: ${message}`);
  }

  // Disconnect the producer
  public async disconnectProducer() {
    if (this.isProducerConnected) {
      await this.producer.disconnect();
      this.isProducerConnected = false;
      console.log("Kafka producer disconnected");
    }
  }

  // Add and connect a consumer
  public async addConsumer(groupId: string, topic: string, handler: (message: string) => Promise<void>) {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`Received message on ${topic}: ${message.value?.toString()}`);
        await handler(message.value?.toString() || "");
      },
    });
  }

}

// PostgreSQL Operations (Replace placeholders with real queries)

async function userJoined() {
  console.log("Hey someone joined....");
  // await client.query("UPDATE counts SET total_votes = total_votes + 1 WHERE id = 1");
}
async function incrementVotes() {
  console.log("Increment votes in PostgreSQL");
  // await client.query("UPDATE counts SET total_votes = total_votes + 1 WHERE id = 1");
}

async function incrementPlayers() {
  console.log("Increment players in PostgreSQL");
  // await client.query("UPDATE counts SET total_players = total_players + 1 WHERE id = 1");
}

// Kafka Application Manager Class
class KafkaApp {
  private kafkaManager: KafkaManager;

  constructor() {
    this.kafkaManager = KafkaManager.getInstance();
  }

  // Start the producer and send initial messages
  async startProducer() {
    await this.kafkaManager.connectProducer();
    // await this.kafkaManager.sendMessage("total_votes", "Increment vote");
    // await this.kafkaManager.sendMessage("total_players", "Increment player count");
  }

  // Set up consumers with their respective handlers
  async startConsumers() {

    await this.kafkaManager.addConsumer("users_joined_group", "user_joined", async (message) => {
      await userJoined();
      console.log("Hey joined users incremented");
    });
    // await this.kafkaManager.addConsumer("total_votes_group", "total_votes", async (message) => {
    //   await incrementVotes();
    //   console.log("Total votes incremented");
    // });

    // await this.kafkaManager.addConsumer("total_votes_group", "total_votes", async (message) => {
    //   await incrementVotes();
    //   console.log("Total votes incremented");
    // });

    // await this.kafkaManager.addConsumer("total_players_group", "total_players", async (message) => {
    //   await incrementPlayers();
    //   console.log("Total players incremented");
    // });

    // await this.kafkaManager.addConsumer("total_players_group", "total_players", async (message) => {
    //   await incrementPlayers();
    //   console.log("Total players incremented");
    // });
  }

  // Disconnect producer and consumers
  async shutdown() {
    await this.kafkaManager.disconnectProducer();
    // await client.end(); // Uncomment if using PostgreSQL
    console.log("Kafka Manager and PostgreSQL disconnected.");
  }
}

// Main Execution
(async () => {
  const kafkaApp = new KafkaApp();
  await kafkaApp.startProducer();
  await kafkaApp.startConsumers();

  // Call shutdown when the application needs to stop
  // Uncomment the following line to test disconnection
  // await kafkaApp.shutdown();
})();
