import { Payload } from "./PayloadBase";

export type QueueMessagePayload = Payload & {
  kind: "QUEUE_MESSAGE_PAYLOAD";
  id: string;
};