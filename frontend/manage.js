const tasksEl = document.getElementById('tasks');
const addLink = document.getElementById('add');

let taskCount = 0;

function addTaskItem(name, i) {
  taskCount++;

  const li = document.createElement('li');
  li.innerText = name;
  addLink.insertAdjacentElement('beforebegin', li);

  li.ondblclick = () => {
    const input = document.createElement('input');
    input.value = name;

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        name = input.value.trim();
        main.rename(i, name);
        li.innerText = name;
      }
      else if (e.key === 'Escape') {
        li.innerText = name;
      }
    };

    li.innerHTML = '';
    li.append(input);
    input.focus();
    input.select();
  };
}

main.ready((data) => {
  data.tasks.forEach(({ name }, i) => {
    addTaskItem(name, i);
  });

  addLink.onclick = (e) => {
    e.preventDefault();

    const li = document.createElement('li');
    addLink.insertAdjacentElement('beforebegin', li);

    const input = document.createElement('input');
    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const name = input.value.trim();
        main.create(name);

        li.remove();
        addTaskItem(name, taskCount);
      }
      else if (e.key === 'Escape') {
        li.remove();
      }
    };

    li.append(input);
    input.focus();
  };
});
