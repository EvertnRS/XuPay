import { Socket } from "net";
import { Request, isValidBodyRequest} from "@/@types/contracts/Request";
import { MessageService } from "../service/MessageService";

export class MessageController{
    constructor(
        private messageService: MessageService
    ) {}

    public publish(request: Request, socket: Socket): void {
        const messageBody = isValidBodyRequest(request.body, socket);
        if (!messageBody) {
            return;
        }
        this.messageService.publish(messageBody, socket);
    }
}