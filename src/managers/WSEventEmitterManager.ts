import {BaseManager} from "./BaseManager";
import {TransactionWithMeta, WSHelloResponse} from "../types";

type WSEventMap = {
    keepalive: Date;
    // Ready/error/close events
    ready: WSHelloResponse;
    error: Event;
    close: CloseEvent;
    // Kromer events
    transaction: TransactionWithMeta;
}

type WSEvent = keyof WSEventMap;
type Handler<T> = [T] extends [void] ? () => void : (data: T) => void;

export class WSEventEmitterManager extends BaseManager {
    private listeners = new Map<WSEvent, Set<Function>>();

    protected fire<E extends WSEvent>(
        event: E,
        ...args: [WSEventMap[E]] extends [void] ? [] : [WSEventMap[E]]
    ): void {
        const set = this.listeners.get(event);
        if (!set) return;
        for (const cb of set) {
            (cb as any)(...args);
        }
    }

    public on<E extends WSEvent>(event: E, callback: Handler<WSEventMap[E]>): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const set = this.listeners.get(event)!;
        set.add(callback as Function);

        // Return unsubscribe function
        return () => {
            set.delete(callback as Function);
            if (set.size === 0) {
                this.listeners.delete(event);
            }
        };
    }
}