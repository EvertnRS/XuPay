import { MessageBody } from "@/@types/contracts/MessageBody";
import { Socket } from "net";
import { IMessageRepository } from "../domain/repository/IMessageRepository";
import { queueEventBus } from "../../../infra/event/QueueEventBus";
import { ErrorHandler } from "@/infra/middleware/Error";
import { QueueMessageService } from "@/modules/queue/service/QueueMessageService";
import { MessageWorker } from "@/modules/worker/MessageWorker";
import { ResponseParser } from "@/infra/parser/ResponseParser";
import crypto from "crypto";

export class MessageService {
  private readonly messageWorker: MessageWorker;

  constructor(
    private messageRepository: IMessageRepository,
    private queueMessageService: QueueMessageService
  ) {
    this.messageWorker = new MessageWorker(this.queueMessageService);
    this.messageWorker.register();
  }

  public async publish(messageBody: MessageBody, socket: Socket): Promise<void> {
    if (messageBody.payload.kind !== "MESSAGE_PAYLOAD") {
      return ErrorHandler.handle("Payload inválido para publicação",socket);
    }

    const apiPayload = messageBody.payload.apiPayload;

    const existingMessage = await this.messageRepository.findByIdempotencyKey(
      messageBody.payload.idempotencyKey
    );

    if (existingMessage) {
      return ErrorHandler.handle("Mensagem já existe", socket);
    }

    const payloadHash = this.generatePayloadHash(apiPayload);

    const savedMessage = await this.messageRepository.saveMessage({
      source: messageBody.source,
      type: messageBody.type,
      service: messageBody.payload.service,
      payload: payloadHash,
      timestamp: new Date(messageBody.timestamp),
      idempotencyKey: messageBody.payload.idempotencyKey
    });

    queueEventBus.emit("MESSAGE_CREATED", {
      messageId: savedMessage.id,
    });

    const payload = `service=${messageBody.payload.service},apiPayload=${apiPayload}`;

    const response = ResponseParser.serialize({
        method: 'POST',
        path:'publish',
        body: {
            source: 'MESSAGE_SERVICE',
            type: 'RESPONSE',
            payload,
            timestamp: new Date().toISOString()
        }
    });

    socket.write(response);
    socket.end();
  }

  private generatePayloadHash(payload: string): string {
    return crypto
      .createHash("sha256")
      .update(payload)
      .digest("hex");
  }

}