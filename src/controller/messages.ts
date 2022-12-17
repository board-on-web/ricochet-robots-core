import { IncomeMessage } from "../models/income-messages"
import { Message } from "../models/messages"

export type MessagesListener = (event: MessageEvent<Message | IncomeMessage>) => void

export class MessagesController {
  public subscribeToMessages(onMessage: MessagesListener) {
    window.addEventListener('message', onMessage)
  }

  public emit(event: Message) {
    window.postMessage(event)
  }
}