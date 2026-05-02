import { MessageBody } from "@/@types/MessageBody";
import { Socket } from "net";
import crypto from "crypto";
import { MessageRepositoryImpl } from "../domain/repository/MessageRepositoryimpl";
import { QueueMessageRepositoryImpl } from "../../queue/domain/repository/QueueMessageRepositoryImpl";

export class MessageService {
    private messageRepository: MessageRepositoryImpl = new MessageRepositoryImpl(); 
    private queueMessageRepository: QueueMessageRepositoryImpl = new QueueMessageRepositoryImpl();    

    //TODO: Refatorar para usar um serviço de hashing e não acoplar diretamente o bcrypt aqui
    private generatePayloadHash(payload: string): string {
        return crypto
            .createHash("sha256")
            .update(payload)
            .digest("hex");
        }

    public async publish(message:MessageBody, socket: Socket): Promise<void> {
         const payloadHash = await this.generatePayloadHash(message.payload);
         
         const savedMessage = await this.messageRepository.saveMessage({
            source: message.source,
            type: message.type,
            payload: payloadHash,
            timestamp: new Date(message.timestamp)
        });

        this.queueMessageRepository.saveMessage({
            messageId: savedMessage.id,
            retryCount: 0
        });
        
        socket.write(`Mensagem publicada: ${message.type} - ${message.payload} - ${message.timestamp}`);
        socket.end();
    }

    public retry(message: MessageBody, socket: Socket): void {
        
    }
    
}