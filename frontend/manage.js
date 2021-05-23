const tasksEl = document.getElementById('tasks');

main.ready((data) => {
  data.tasks.forEach(({ name }, i) => {
    const li = document.createElement('li');
    li.innerText = name;
    tasksEl.append(li);

    li.ondblclick = () => {
      const input = document.createElement('input');
      input.value = name;

      input.onkeydown = (e) => {
        if (e.keyCode === 13) {
          name = input.value.trim();
          main.rename(i, name);
          li.innerText = name;
        }
      };

      li.innerHTML = '';
      li.append(input);
      input.focus();
    };
  });
});
