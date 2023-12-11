import { ContextMenu } from '../../dist/context-menu.js';

const container = document.getElementById('container');

if (container === null) {
    throw new Error("container is null")
}

const context = new ContextMenu();

container.addEventListener("contextmenu", (ev) => {
    ev.preventDefault()
    context.open([
        {
            type: "button",
            name: "sad",
            text: "haha"
        },

    ])
})

context.addEventHandler('clickButton', (name: string, data: any) => {
    console.log(1, name, data)
})
class A {
    constructor(context: ContextMenu) {
        console.log(context)
        context.addEventHandler('clickButton', (name: string, data: any) => {
            console.log(2, name, data)
        })
    }
}

const a: A = new A(context)

console.log(a)