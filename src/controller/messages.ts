import { IncomeMessage } from "../models/income-messages"
import { Message } from "../models/messages"

export class MessagesController {
  constructor(onMessage: (event: MessageEvent<Message | IncomeMessage>) => void) {
    window.addEventListener('message', onMessage)
  }

  public emit(event: Message) {
    window.postMessage(event)
  }
}