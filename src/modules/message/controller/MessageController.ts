import { Socket } from "net";
import { Request } from "@/@types/Request";
import { MessageService } from "../service/MessageService";

export class MessageController{
    private messageService: MessageService  = new MessageService();

    public publish(request: Request, socket: Socket): void {
        
        this.messageService.publish(request.body, socket);
    }

    public retry(request: Request, socket: Socket): void {
        this.messageService.retry(request.body, socket);
    }
}