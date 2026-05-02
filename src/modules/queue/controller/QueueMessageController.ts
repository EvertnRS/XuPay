import { Socket } from "net";
import { QueueMessageService } from "../service/QueueMessageService";
import type { Request }  from "../../../@types/contracts/Request";
import { isValidBodyRequest } from "@/@types/contracts/Request";

export class QueueMessageController{
    constructor(
        private readonly queueMessageService: QueueMessageService
    ) {}

    public async retry(request: Request, socket: Socket): Promise<void> {
        const messageBody = isValidBodyRequest(request.body, socket);

        if (!messageBody) {
            return;
        }

        this.queueMessageService.retryMessage(messageBody, socket);

    }
    
}