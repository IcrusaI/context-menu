import EventType from './EventType';

export default interface ContextMenuEventData {
  type: EventType;
  event: Function;
}
