const tasksEl = document.getElementById('tasks');
const addLink = document.getElementById('add');

let taskCount = 0;

function addTaskItem(name) {
  taskCount++;

  const li = document.createElement('li');
  li.innerText = name;
  addLink.insertAdjacentElement('beforebegin', li);

  li.ondblclick = () => {
    const index = [...li.parentElement.children].indexOf(li);

    const input = document.createElement('input');
    input.value = name;

    input.onkeydown = (e) => {
      if (e.key === 'Enter') {
        const newName = input.value.trim();

        if (newName) {
          name = newName;
          main.rename(index, name);
          li.innerText = name;
        }
        else {
          if (confirm(`Are you sure you want to delete the task "${name}"?`)) {
            main.delete(index);
            li.remove();
          }
          else {
            li.innerText = name;
          }
        }
      }
      else if (e.key === 'Escape') {
        li.innerText = name;
      }
    };
    input.onblur = () => li.innerText = name;

    li.innerHTML = '';
    li.append(input);
    input.focus();
    input.select();
  };
}

main.ready((data) => {
  data.tasks.forEach(({ name }) => {
    addTaskItem(name);
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
        addTaskItem(name);
      }
      else if (e.key === 'Escape') {
        li.remove();
      }
    };
    input.onblur = () => li.remove();

    li.append(input);
    input.focus();
  };
});
