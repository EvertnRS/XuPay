import { Message } from "../entity/Message";


export interface IMessageRepository {
    saveMessage(message: Omit<Message, 'id' | 'status'>): Promise<Message>;
}