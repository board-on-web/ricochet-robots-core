import { Message } from "../models/messages"

export type MessagesListener = (event: MessageEvent<Message>) => void

export class MessagesController {
  public addMessagesListener(onMessage: MessagesListener) {
    window.addEventListener('message', onMessage)
  }

  public postMessage(event: Message) {
    window.postMessage(event)
    window.top?.postMessage(event, import.meta.env.VITE_APP_GAME_ORIGIN)
  }
}