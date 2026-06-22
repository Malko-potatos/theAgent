import type { RuntimeEvent, RuntimeEventSink } from "../contracts/event.ts";

export class InMemoryEventLog implements RuntimeEventSink {
  private events: RuntimeEvent[] = [];

  append(event: RuntimeEvent): void {
    this.events.push(event);
  }

  all(): RuntimeEvent[] {
    return [...this.events];
  }
}
