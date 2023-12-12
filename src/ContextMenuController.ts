import Point2D from './Point2D';
import ContextMenuEventData from './ContextMenuEventData';
import ContextMenuData from './ContextMenuData';
import EventType from './EventType';
import {type} from "node:os";

export default class ContextMenuController {
  get listeners(): ContextMenuEventData[] {
    return this._listeners;
  }

  private _listeners: ContextMenuEventData[] = [];
  private stylesheet: CSSStyleSheet;

  private menuElement: Node | undefined;
  private cursorPage: Point2D;
  private cursorScreenPage: Point2D;

  constructor() {
    this.cursorPage = { x: 0, y: 0 };
    this.cursorScreenPage = { x: 0, y: 0 };

    document.addEventListener('mousemove', this.watchMouseMove.bind(this));
    document.addEventListener('mousedown', this.watchMouseDown.bind(this));

    const styleEl: HTMLStyleElement = document.createElement('style');
    styleEl.appendChild(document.createTextNode(''));
    document.head.appendChild(styleEl);

    if (styleEl.sheet === null) {
      throw new Error("style is not initialized")
    }

    this.stylesheet = styleEl.sheet as CSSStyleSheet;

    this.addEventHandler = this.addEventHandler.bind(this);
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);

    this.initDefaultCss();
  }

  private initDefaultCss() {
    this.css(
      '.context-menu',
      `
      position: absolute;
      display: initial;
      overflow: auto;
      width: 120px;
      padding: 5px;
      border: 1px solid #f5f5f5;
      border-radius: 5px;
      background-color: white;
      box-shadow: 0px 0px 19px 0px rgba(0, 0, 0, 0.2);
      `
    );

    this.css(
      '.context-menu li',
      `
      border-radius: 5px;
      padding: 5px 2px;
      `
    );

    this.css(
      '.context-menu .context-menu-btn',
      `
      cursor: pointer;
      `
    );

    this.css(
      '.context-menu .context-menu-btn:hover',
      `
      background-color: #f0f8ff;
      `
    );
  }

  private css(selector: string, styleString: string) {
    const rule = `${selector} { ${styleString} }`;
    const index = this.stylesheet.cssRules.length;

    this.stylesheet.insertRule(rule, index);
  }

  private watchMouseMove(ev: MouseEvent) {
    this.cursorScreenPage.x = ev.screenX;
    this.cursorScreenPage.y = ev.screenY;
    this.cursorPage.x = ev.pageX;
    this.cursorPage.y = ev.pageY;
  }

  private watchMouseDown(ev: MouseEvent) {
    if (ev.target && this.menuElement) {
      const elem: HTMLElement = ev.target as HTMLElement;

      if (!elem.parentElement?.isSameNode(this.menuElement) && !elem.isSameNode(this.menuElement)) {
        this.close();
      }
    }
  }

  /** Открыто меню или нет
   * @return {boolean}
   */
  public get isOpen(): boolean {
    return this.menuElement !== undefined;
  }

  /** Открытие меню
   *
   * @param menu {ContextMenuData[]} - список элементов меню, которые нужно отобразить
   * @param [data] {any} - данные, которые передадутся, при вызове события
   */
  public open (menu: ContextMenuData[] | undefined, data?: any) {
    this.close();

    if (menu === undefined) {
      return;
    }

    this.createMenu(menu, data);
  }

  /** Закрытие контекстного меню
   *
   */
  public close () {
    this.menuElement?.parentElement?.removeChild(this.menuElement);
    this.menuElement = undefined;
  }

  private createMenu(menuData: ContextMenuData[], data: any) {
    const menu = document.createElement('ul');
    menu.className = 'context-menu';

    for (let i = 0; i < menuData.length; i++) {
      const elemData: ContextMenuData = menuData[i];

      let elem;

      if (elemData.type === 'hr') {
        elem = document.createElement('hr');
      } else {
        elem = document.createElement('li');
        if (elemData.type === 'button') {
          elem.className = 'context-menu-btn';

          elem.addEventListener('click', () => {
            console.log(this.listeners, this._listeners, this.listeners.length, this._listeners.length)
            this.listeners.map((e) => {
              if (e.type === 'clickButton') {
                e.event(elemData.name, data);
              }
            });

            this.close();
          });
        }
        elem.textContent = String(elemData.text);
      }
      menu.appendChild(elem);
    }

    this.menuElement = menu;
    document.body.appendChild(menu);

    if (menu.clientHeight + this.cursorScreenPage.y > document.documentElement.clientHeight) {
      menu.style.maxHeight = `${this.cursorPage.y}px`;
      menu.style.top = `${this.cursorPage.y - menu.clientHeight}px`;
    } else {
      menu.style.maxHeight = `${document.documentElement.clientHeight - this.cursorPage.y}px`;
      menu.style.top = `${this.cursorPage.y}px`;
    }

    if (menu.clientWidth + this.cursorScreenPage.x > document.documentElement.clientWidth) {
      menu.style.left = `${this.cursorPage.x - menu.clientWidth}px`;
    } else {
      menu.style.left = `${this.cursorPage.x}px`;
    }

    menu.style.visibility = '';
  }

  /** Добавляет событие на какое либо действие с меню
   *
   * @param type {EventType} -
   * @param event
   */
  public addEventHandler (type: EventType, event: (name: string, data: any) => void) {
    this._listeners.push({
      type,
      event
    });
  }
}
