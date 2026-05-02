import { Socket } from "net";
import { Request, isValidBodyRequest} from "@/@types/Request";
import { MessageService } from "../service/MessageService";

export class MessageController{
    private messageService: MessageService  = new MessageService();

    public publish(request: Request, socket: Socket): void {
        const messageBody = isValidBodyRequest(request.body, socket);
        if (!messageBody) {
            return;
        }
        this.messageService.publish(messageBody, socket);
    }

    public retry(request: Request, socket: Socket): void {
        const messageBody = isValidBodyRequest(request.body, socket);
        if (!messageBody) {
            return;
        }
        this.messageService.retry(messageBody, socket);
    }
}