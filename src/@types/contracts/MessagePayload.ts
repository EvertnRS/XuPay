import { Payload } from "./PayloadBase";

export type MessagePayload = Payload & {
  kind: "MESSAGE_PAYLOAD";
  service: string;
  idempotencyKey: string;
  apiPayload: string;
};