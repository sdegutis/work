const rateEl = document.getElementById('rate');
const editorEl = document.getElementById('editor');
const previewEl = document.getElementById('right');
const generateButton = document.getElementById('generate');

main.ready((data) => {
  console.log(data);

  rateEl.value = data.rate.toFixed();
  rateEl.oninput = () => {
    const rate = +rateEl.value;
    const valid = !isNaN(rate);
    rateEl.classList.toggle('invalid', !valid);
    if (valid) {
      main.set('rate', rate);
    }
  };

  editorEl.value = data.template;
  editorEl.oninput = () => {
    main.set('template', editorEl.value);
  };

  generateButton.onclick = (e) => {
    e.preventDefault();

    main.transform(editorEl.value).then(html => {
      previewEl.innerHTML = html;
    });
  };
});
