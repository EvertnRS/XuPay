import { IQueueMessageRepository } from "../domain/repository/IQueueMessageRepository";
import { QueueMessage } from "../domain/entity/QueueMessage";
import { Socket } from "net";

export class QueueMessageService {
    constructor(
        private queueMessageRepository: IQueueMessageRepository
    ) {}

    private static readonly MAX_RETRIES = 3;
    
    public async saveQueueMessage(messageId: string, retryCount: number): Promise<void> {
        await this.queueMessageRepository.saveMessage({
            messageId,
            retryCount
        });
    }

    public async updateQueueMessage(queueMessage: QueueMessage): Promise<void> {
        await this.queueMessageRepository.updateMessage(queueMessage);
    }

    public async retryMessage(queueMessage: QueueMessage, socket?: Socket): Promise<void> {
        if(queueMessage.retryCount + 1 > QueueMessageService.MAX_RETRIES) {
            await this.queueMessageRepository.updateMessage({
                ...queueMessage,
                status: 'FAILED'
            });
        } else {
            await this.queueMessageRepository.updateMessage({
                ...queueMessage,
                status: 'PENDING',
                retryCount: queueMessage.retryCount + 1
            });
        }

        if (socket) {
            socket.write(`Mensagem ${queueMessage.status === 'FAILED' ? 'falhou após múltiplas tentativas' : 'republicada para nova tentativa'}: ${queueMessage.messageId} - Tentativa: ${queueMessage.retryCount}`);
            socket.end();
        }
    }
}