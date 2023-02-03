export interface IState<T> {
  restore(state: T): void
  get state(): T
}