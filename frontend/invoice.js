const rateEl = document.getElementById('rate');
const editorEl = document.getElementById('editor');
const previewEl = document.getElementById('right');
const generateButton = document.getElementById('generate');

main.ready((data) => {
  console.log(data);

  rateEl.value = data.rate.toFixed();

  editorEl.value = data.template;

  generateButton.onclick = (e) => {
    e.preventDefault();

    previewEl.innerHTML = main.transform(editorEl.value, data);
  };
});
