const rateEl = document.getElementById('rate');
const editorEl = document.getElementById('editor');
const previewEl = /** @type {HTMLIFrameElement} */(document.getElementById('preview'));
const saveButton = document.getElementById('save');

let previewTimer;
function previewSoon() {
  if (!previewTimer) {
    previewTimer = setTimeout(previewImmediately, 250);
  }
}

function previewImmediately() {
  previewTimer = undefined;
  main.transform(editorEl.value).then(html => {
    previewEl.srcdoc = PRELUDE + html;
  });
}

main.refresh(() => {
  previewImmediately();
});

const data = await new Promise(main.ready);

rateEl.value = data.rate.toFixed();
rateEl.oninput = () => {
  const rate = +rateEl.value;
  const valid = !isNaN(rate);
  rateEl.classList.toggle('invalid', !valid);
  if (valid) {
    main.set('rate', rate);
    previewSoon();
  }
};

editorEl.value = data.template;
editorEl.oninput = () => {
  main.set('template', editorEl.value);
  previewSoon();
};

previewImmediately();

window.addEventListener('resize', resizePreview);
resizePreview();

saveButton.onclick = (e) => {
  e.preventDefault();

  // TODO: save PDF with save dialog
};

function resizePreview() {
  previewEl.width = previewEl.parentElement.clientWidth;
  previewEl.height = previewEl.parentElement.clientHeight;
}

const PRELUDE = `
<style>
/* PDF */
@media screen {
  html {
    background: #f0f0f0;
    width: 9.5in;
  }

  body {
    width: 8.5in;
    background: #fff;
    padding: 1in;
    margin: 2em;
    box-shadow: 0px 1px 3px 1px #0001;
  }
}

@page {
  margin: 1in;
}

/* Reset */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
`.trim();
