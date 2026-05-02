import { QueueMessage } from "../entity/QueueMessage";

export interface IQueueMessageRepository {
    saveMessage(queueMessage: Omit<QueueMessage, 'id' | 'maxRetries'>): Promise<void>;
}