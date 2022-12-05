import { Turn } from "./round"

interface MessageChangeTurn {
  event: 'change_turn',
  turn: Turn
}

interface MessageEndTurn {
  event: 'end_turn'
}

interface MessageEndGame {
  event: 'end_game'
}

type Message = 
  MessageChangeTurn
    | MessageEndTurn
    | MessageEndGame

export class MessagesController {
  constructor(onMessage: (event: MessageEvent<Message>) => void) {
    window.addEventListener('message', onMessage)
  }

  public emit(event: Message) {
    window.postMessage(event)
  }
}