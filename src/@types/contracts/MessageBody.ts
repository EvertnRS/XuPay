import { QueueMessagePayload } from "./QueueMessagePayload";
import { MessagePayload } from "./MessagePayload";

export type Payload = MessagePayload | QueueMessagePayload;

export type MessageBody = {
    source: string;
    type: string;
    payload: Payload;
    timestamp: string;
};