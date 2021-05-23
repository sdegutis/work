const tasksEl = document.getElementById('tasks');

main.ready((data) => {
  data.tasks.forEach(({ name }, i) => {
    const li = document.createElement('li');
    li.innerText = name;
    li.className = i;
    tasksEl.append(li);
  });
});
