import { prismaClient } from "@/infra/database/prismaClient";
import { QueueMessage } from "../entity/QueueMessage";
import { IQueueMessageRepository } from "./IQueueMessageRepository";

export class QueueMessageRepositoryImpl implements IQueueMessageRepository {
    public async saveMessage(queueMessage: Omit<QueueMessage, 'id' | 'maxRetries'>): Promise<void> {
        prismaClient.queueMessage.create({
            data: {
                messageId: queueMessage.messageId,
                retryCount: queueMessage.retryCount,
            }
        });
    }
}