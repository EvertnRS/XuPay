import { prismaClient } from "@/infra/database/prismaClient";
import { IMessageRepository } from "./IMessageRepository";
import { Message } from "../entity/Message";

export class MessageRepositoryImpl implements IMessageRepository {
    public async saveMessage(message: Omit<Message, 'id' | 'status'>): Promise<Message> {
        return await prismaClient.message.create({
            data: {
                source: message.source,
                type: message.type,
                payload: message.payload,
                timestamp: message.timestamp
            }
        });
    }
}