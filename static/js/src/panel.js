class Panel {
  constructor(name = '', parentDOM) {
    this.name = name.replace(' ', '').replace('-', '');
    this.parentDOM = parentDOM;
    this.tableDOM = document.createElement('table');
    this.tableDOM.id = this.name
    this.parentDOM.appendChild(this.tableDOM);
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