import { Kafka } from "kafkajs";

import { incrementSessions, incrementUsers, incrementVotes } from "../postgress/queries";

type KafkaMessage ={
  initial:boolean
}
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
      console.log("1. KafkaManager instance created");
    }
    return this.instance;
  }

  // Connect the producer
  public async connectProducer() {
    if (!this.isProducerConnected) {
      await this.producer.connect();
      this.isProducerConnected = true;
      console.log("2. Kafka producer connected");
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
    console.log(`3. Message sent to topic ${topic}: ${message}`);
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
        console.log(`4. Received message on ${topic}: ${message.value?.toString()}`);
        await handler(message.value?.toString() || "");
      },
    });
  }

}

class KafkaApp {
  private kafkaManager: KafkaManager;

  constructor() {
    this.kafkaManager = KafkaManager.getInstance();
  }

  // Start the producer and send initial messages
  async startProducer() {
    await this.kafkaManager.connectProducer();
    await this.kafkaManager.sendMessage("Increment_Users",JSON.stringify({
       initial:true,
    }));
    await this.kafkaManager.sendMessage("Increment_Votes", JSON.stringify({
      initial:true,
   }));
    await this.kafkaManager.sendMessage("Increment_Sessions", JSON.stringify({
      initial:true,
   }));
  }


  // Set up consumers with their respective handlers
  async startConsumers() {
    await this.kafkaManager.addConsumer("Increment_Users_Group", "Increment_Users", async (message) => {
      const data:KafkaMessage  =  JSON.parse(message)
      if(data?.initial===true ){
        console.log("Increment_Users consumer starting...")
        return
      }
      await incrementUsers();
    });
    await this.kafkaManager.addConsumer("Increment_Votes_Group", "Increment_Votes", async (message) => {
      const data:KafkaMessage  =  JSON.parse(message)
      console.log("data",data)
      if(data?.initial===true ){
        console.log("Increment_Votes consumer starting...")
        return
      }
      await incrementVotes();
    });
    await this.kafkaManager.addConsumer("Increment_Sessions_Group", "Increment_Sessions", async (message) => {
      const data:KafkaMessage  =  JSON.parse(message)
      if(data?.initial===true ){
        console.log("Increment_Sessions consumer starting...")
        return
      }
      await incrementSessions();
    });
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
