import { queueEventBus } from "@/infra/event/QueueEventBus";
import { QueueMessageService } from "../queue/service/QueueMessageService";

export class MessageWorker {
  constructor(
    private readonly queueMessageService: QueueMessageService
  ) {}

  public register(): void {
    queueEventBus.on("MESSAGE_CREATED", async ({ messageId }) => {
      await this.queueMessageService.saveQueueMessage(messageId, 0);

      queueEventBus.emit("NEW_MESSAGE", {
        messageId,
      });
    });
  }
}