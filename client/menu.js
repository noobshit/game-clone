function create_factory_menu(menu_owner, options) {
    const table = document.createElement('table')
    table.classList.add('zui-table')
    table.classList.add('zui-table-horizontal')
    table.classList.add('zui-table-highlight')

    const tbody = document.createElement('tbody')
    table.appendChild(tbody)
    for (let entry of options) {
        const tr = new Tr(tbody)
        tr
            .add_text_td(entry.product.amount)
            .add_text_td(entry.product.label)
            .add_text_td(entry.cost.metal)
            .add_text_td(entry.cost.explo)
            .add_button('+1', _ => send_menu_choice('add', menu_owner, entry.option, 1))
    }

   return table
}

class Tr {
    constructor(table) {
        this.tr = document.createElement('tr')
        table.appendChild(this.tr)
    }

    add_text_td(text) {
        const td = document.createElement('td')
        td.textContent = text
        this.tr.appendChild(td)
        return this
    }

    add_button(text, callback) {
        const td = document.createElement('td')
        const button = document.createElement('button')
        button.textContent = text
        button.onclick = callback
        td.appendChild(button)
        this.tr.appendChild(td)
        return this
    }
}

function show_factory_menu(data) {
    const root = document.getElementById('menu')
    root.innerHTML = ''
    const table = create_factory_menu(data.menu_owner, data.options)
    root.appendChild(table)
}