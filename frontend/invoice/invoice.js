const rateEl = document.getElementById('rate');
const editorEl = document.getElementById('editor');
const previewEl = /** @type {HTMLIFrameElement} */(document.getElementById('preview'));
const generateButton = document.getElementById('generate');

main.ready((data) => {
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
    previewSoon();
  };

  let previewTimer;
  function previewSoon() {
    if (!previewTimer) {
      previewTimer = setTimeout(previewImmediately, 250);
    }
  }

  function previewImmediately() {
    previewTimer = undefined;
    main.transform(editorEl.value).then(html => {
      previewEl.srcdoc = html;
    });
  }

  previewImmediately();

  window.addEventListener('resize', resizePreview);
  resizePreview();

  generateButton.onclick = (e) => {
    e.preventDefault();

    // TODO: save PDF with save dialog
  };
});

function resizePreview() {
  previewEl.width = previewEl.parentElement.clientWidth;
  previewEl.height = previewEl.parentElement.clientHeight;
}
