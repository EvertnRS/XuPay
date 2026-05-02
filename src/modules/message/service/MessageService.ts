import { MessageBody } from "@/@types/contracts/MessageBody";
import { Socket } from "net";
import { MessageRepositoryImpl } from "../domain/repository/MessageRepositoryimpl";
import { queueEventBus } from "../../../infra/event/QueueEventBus";
import { ErrorHandler } from "@/infra/middleware/Error";
import { QueueMessageService } from "@/modules/queue/service/QueueMessageService";
import { MessageWorker } from "@/modules/worker/MessageWorker";
import crypto from "crypto";

export class MessageService {
    constructor(
        private messageRepository: MessageRepositoryImpl,
        private queueMessageService: QueueMessageService,
        private messageWorker = new MessageWorker(this.queueMessageService)
    ) {
        this.messageWorker.register();
    }    

    public async publish(message:MessageBody, socket: Socket): Promise<void> {
        const existingMessage = await this.messageRepository.findByTimestamp(new Date(message.timestamp));
        if (existingMessage) {
            return ErrorHandler.handle("Mensagem já existe", socket);
        }

        const payloadHash = await this.generatePayloadHash(message.payload);
         
         const savedMessage = await this.messageRepository.saveMessage({
            source: message.source,
            type: message.type,
            payload: payloadHash,
            timestamp: new Date(message.timestamp)
        });

        queueEventBus.emit('MESSAGE_CREATED', savedMessage.id);
        
        socket.write(`Mensagem publicada: ${message.type} - ${message.payload} - ${message.timestamp}`);
        socket.end();
    }

    //TODO: Refatorar para usar um serviço de hashing e não acoplar diretamente o hash aqui
    private async generatePayloadHash(payload: string): Promise<string> {
        return crypto
            .createHash("sha256")
            .update(payload)
            .digest("hex");
        }
    
}