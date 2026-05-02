import { Socket } from "net";
import type { Request }  from "../@types/Request";
import { MessageController } from "../modules/message/controller/MessageController";
import { Error } from "../infra/middleware/Error";

export class Routes {
    private messageController = new MessageController();

	public handle(request:Request, socket:Socket):void  {
        
        if (request.method === 'POST' && request.path === '/publish'){
            this.messageController.publish(request, socket);
        }
        else if (request.method === 'POST' && request.path === '/retry'){
            this.messageController.retry(request, socket);
        }
        else {
            Error.handle("Rota não encontrada", socket);       
        }
    }
}