import { downloadTableAsCSV } from './tableAsCSV.js'

class Panel {
  constructor(name = '', parentDOM) {
    const d = document.createElement('div')
    this.name = name.replace(' ', '').replace('-', '');
    this.parentDOM = parentDOM;
    this.tableDOM = document.createElement('table');
    this.tableDOM.id = this.name
    const button = document.createElement('button')
    button.setAttribute('type', 'button')
    button.innerText = 'Download CSV';
    button.addEventListener('click', ()=>{downloadTableAsCSV( this.name )})
    d.appendChild(button)
    d.appendChild(this.tableDOM)
    this.parentDOM.appendChild(d);
    this.fields = {};
  }

  addField(key, value) {
    const tr = document.createElement('tr')
    const elKey = document.createElement('td')
    const elValue = document.createElement('td')
    elKey.innerText = key
    elValue.innerText = value
    this.fields[key] = elValue
    tr.appendChild(elKey)
    tr.appendChild(elValue)
    this.tableDOM.appendChild(tr)
  }

  updateField(key, value) {
    this.fields[key].innerText = value
  }
}


export { Panel }