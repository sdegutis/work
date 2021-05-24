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
  main.transform(editor.getValue()).then(html => {
    previewEl.srcdoc = html;
  });
}

main.refresh(() => {
  previewImmediately();
});

const data = await new Promise(main.ready);

require.config({ paths: { vs: '../../node_modules/monaco-editor/min/vs' } });

const editor = await new Promise(resolve => {
  require(['vs/editor/editor.main'], function () {
    const editor = monaco.editor.create(editorEl, {
      theme: 'vs-dark',
      value: data.template,
      language: 'html'
    });
    resolve(editor);
  });
});

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

editor.getModel().onDidChangeContent(() => {
  main.set('template', editor.getValue());
  previewSoon();
});

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
