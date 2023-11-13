import ElementType from "./ElementType";

export default interface ContextMenuData {
    type: ElementType,
    name?: string,
    text?: string,
}