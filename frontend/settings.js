const tasksEl = document.getElementById('tasks');
const addLink = document.getElementById('add');
const rateEl = document.getElementById('rate');
const invoiceNumberEl = document.getElementById('invoiceNumber');
const showTemplatesButton = document.getElementById('showTemplates');

const query = new URLSearchParams(window.location.search);
const data = JSON.parse(query.get('data'));

function addTaskItem(name) {
  const li = document.createElement('li');
  const showName = () => {
    const span = document.createElement('span');
    span.innerText = name;
    span.className = 'item';
    li.innerHTML = '';
    li.append(span);
  };
  showName();
  addLink.parentElement.insertAdjacentElement('beforebegin', li);

  li.ondblclick = () => {
    if (li.querySelector('input')) return;

    const index = [...li.parentElement.children].indexOf(li);

    const input = document.createElement('input');
    input.className = 'item';
    input.value = name;

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const newName = input.value.trim();

        if (newName) {
          name = newName;
          main.rename(index, name);
          input.blur();
        }
        else {
          if (confirm(`Delete task "${name}"?`)) {
            main.delete(index);
            li.remove();
          }
          else {
            input.blur();
          }
        }
      }
      else if (e.key === 'Escape') {
        input.blur();
      }
    };
    input.onblur = showName;

    li.innerHTML = '';
    li.append(input);
    input.focus();
    input.select();
  };
}

showTemplatesButton.onclick = (e) => {
  e.preventDefault();
  main.showTemplates();
};

rateEl.value = data.rate;
rateEl.oninput = () => {
  const rate = +rateEl.value;
  const valid = !isNaN(rate);
  rateEl.classList.toggle('invalid', !valid);
  if (valid) {
    main.setRate(rate);
  }
};

invoiceNumberEl.value = data.invoiceNumber.toFixed();
invoiceNumberEl.oninput = () => {
  const invoiceNumber = +invoiceNumberEl.value;
  const valid = !isNaN(invoiceNumber);
  invoiceNumberEl.classList.toggle('invalid', !valid);
  if (valid) {
    main.setInvoiceNumber(invoiceNumber);
  }
};

data.tasks.forEach(({ name }) => {
  addTaskItem(name);
});

addLink.onclick = (e) => {
  e.preventDefault();

  const li = document.createElement('li');
  addLink.parentElement.insertAdjacentElement('beforebegin', li);

  const input = document.createElement('input');
  input.className = 'item';

  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const name = input.value.trim();
      main.create(name);

      input.onblur = null;
      li.remove();

      addTaskItem(name);
    }
    else if (e.key === 'Escape') {
      input.onblur = null;
      li.remove();
    }
  };
  input.onblur = () => li.remove();

  li.append(input);
  input.focus();
};
