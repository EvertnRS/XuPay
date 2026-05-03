import type { Request } from "../../@types/contracts/Request";
import { MessagePayload } from "@/@types/contracts/MessagePayload";
import { QueueMessagePayload } from "@/@types/contracts/QueueMessagePayload";
import { Payload } from "@/@types/contracts/MessageBody";

export class ResponseParser {
  public static deserialize(rawRequest: string): Request {
    const request = rawRequest.trim();

    const parts = request.split("|");

    if (parts.length !== 3) {
      throw new Error(
        "Requisição com campos diferentes do esperado " + request
      );
    }

    const [method, path, rawBody] = parts;

    const bodyParts = rawBody.split(";").map((part) => part.trim());

    if (bodyParts.length !== 4) {
      throw new Error(
        "Corpo da requisição com campos diferentes do esperado " + request
      );
    }

    const [source, type, rawPayload, timestamp] = bodyParts;

    const payload = this.parsePayloadByContent(rawPayload);

    return {
      method,
      path,
      body: {
        source,
        type,
        payload,
        timestamp,
      },
    };
  }

  private static parsePayloadByContent(rawPayload: string): Payload {
    const payload = rawPayload.trim();

    if (!payload) {
      throw new Error("Payload vazio");
    }

    if (this.isMessagePayloadContent(payload)) {
      return this.parseMessagePayload(payload);
    }

    if (this.isQueueMessagePayloadContent(payload)) {
      return this.parseQueueMessagePayload(payload);
    }

    throw new Error(
      "Formato de payload não reconhecido. Esperado MessagePayload ou QueueMessagePayload."
    );
  }

  private static isMessagePayloadContent(rawPayload: string): boolean {
    return rawPayload.includes(",apiPayload=");
  }

  private static isQueueMessagePayloadContent(rawPayload: string): boolean {
    const parsed = this.parseKeyValueList(rawPayload);

    return (
      typeof parsed.id === "string" &&
      !parsed.service &&
      !parsed.idempotencyKey &&
      !parsed.apiPayload
    );
  }

  private static parseMessagePayload(rawPayload: string): MessagePayload {
    const apiPayloadMarker = ",apiPayload=";
    const markerIndex = rawPayload.indexOf(apiPayloadMarker);

    if (markerIndex === -1) {
      throw new Error(
        "Payload inválido. Esperado: service=xxx,idempotencyKey=yyy,apiPayload=zzz"
      );
    }

    const metadataPart = rawPayload.slice(0, markerIndex);
    const apiPayload = rawPayload.slice(
      markerIndex + apiPayloadMarker.length
    );

    const metadata = this.parseKeyValueList(metadataPart);

    if (!metadata.service) {
      throw new Error("Payload inválido. Campo service ausente.");
    }

    if (!metadata.idempotencyKey) {
      throw new Error("Payload inválido. Campo idempotencyKey ausente.");
    }

    if (!apiPayload.trim()) {
      throw new Error("Payload inválido. Campo apiPayload vazio.");
    }

    return {
      kind: "MESSAGE_PAYLOAD",
      service: metadata.service,
      idempotencyKey: metadata.idempotencyKey,
      apiPayload: apiPayload.trim(),
    };
  }

  private static parseQueueMessagePayload(
    rawPayload: string
  ): QueueMessagePayload {
    const payload = this.parseKeyValueList(rawPayload);

    if (!payload.id) {
      throw new Error("Payload inválido. Campo id ausente.");
    }

    return {
      kind: "QUEUE_MESSAGE_PAYLOAD",
      id: payload.id,
    };
  }

  private static parseKeyValueList(raw: string): Record<string, string> {
    const result: Record<string, string> = {};

    const fields = raw.split(",");

    for (const field of fields) {
      const separatorIndex = field.indexOf("=");

      if (separatorIndex === -1) {
        throw new Error(`Campo inválido: ${field}`);
      }

      const key = field.slice(0, separatorIndex).trim();
      const value = field.slice(separatorIndex + 1).trim();

      if (!key || !value) {
        throw new Error(`Campo inválido: ${field}`);
      }

      result[key] = value;
    }

    return result;
  }

  public static serialize(response: {
    method: string;
    path: string;
    body: {
      source: string;
      type: string;
      payload: string;
      timestamp: string;
    };
  }): string {
    return `${response.method}|${response.path}|${response.body.source};${response.body.type};${response.body.payload};${response.body.timestamp}`;
  }
}