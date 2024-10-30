import { AliveWebSocket } from "../User/types";

export function heartbeat(this: AliveWebSocket) {
    this.isAlive = true;
  }