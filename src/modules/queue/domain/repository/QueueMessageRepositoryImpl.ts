import { prismaClient } from "@/infra/database/prismaClient";
import { QueueMessage } from "../entity/QueueMessage";
import { IQueueMessageRepository } from "./IQueueMessageRepository";

export class QueueMessageRepositoryImpl implements IQueueMessageRepository {
    public async saveMessage(queueMessage: Omit<QueueMessage, 'id' | 'status'>): Promise<void> {
        console.log("Salvando mensagem na fila:", queueMessage);
        await prismaClient.queueMessage.create({
            data: {
                messageId: queueMessage.messageId,
                retryCount: queueMessage.retryCount,
            }
        });
    }
}