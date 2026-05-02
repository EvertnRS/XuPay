import { queueEventBus } from "../../infra/event/QueueEventBus";
import { IQueueMessageRepository } from "../queue/domain/repository/IQueueMessageRepository";
import { QueueMessageService } from "../queue/service/QueueMessageService";

export class QueueWorker {
    constructor(
        private readonly queueMessageService : QueueMessageService,
        private readonly queueMessageRepository : IQueueMessageRepository
    ) {}

    private isProcessing = false;

    public start() {
        console.log("[Worker] Observer iniciado. Aguardando eventos NEW_MESSAGE...");
        
        //Inicia o processamento da fila quando um novo evento de mensagem é emitido
        queueEventBus.on('NEW_MESSAGE', async () => {
            await this.processQueue();
        });

        // Inicia o processamento da fila imediatamente ao iniciar o worker
        this.processQueue(); 
    }

    private async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        let nextMessage;

        try {
            while (true) {
                nextMessage = await this.queueMessageRepository.findFirstPendingMessage();

                if (!nextMessage) {
                    break;
                }

                console.log(`[Worker] Observer pegou a mensagem ID: ${nextMessage.id}`);

                await this.queueMessageService.updateQueueMessage({
                    ...nextMessage,
                    status: 'PROCESSING'
                });

                //TODO: Executar lógica de envio para o Service Client
                await new Promise(resolve => setTimeout(resolve, 1000)); 

                await this.queueMessageService.updateQueueMessage({
                    ...nextMessage,
                    status: 'DONE'
                });

                console.log(`[Worker] Mensagem ID: ${nextMessage.id} concluída.`);
            }
        } catch (error) {
            console.error("[Worker] Erro ao processar mensagem:", error);
            await this.queueMessageService.retryMessage(nextMessage!);
            
        } finally {
            this.isProcessing = false;
        }
    }
}