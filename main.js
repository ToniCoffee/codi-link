import { registerEditor, createEditors, getEditorsValues } from './editor';
import { utf8_to_b64, b64_to_utf8 } from './util/base64-util';
import { $ } from './util/dom-util';
import './style.css';

const { origin } = window.location;

const $app = $('#app');
const $html = $('#html');
const $js = $('#js');
const $css = $('#css');
const $view = $('#view');

$html.style.width = '50vw';
$html.style.height = '50vh';

// Jg== is the & symbol in base64
let [initialHtml64, initialJs64, initialCss64] = window.location.search.slice(1).split('Jg==');

const initialHtml = b64_to_utf8(initialHtml64 || '') || '';
const initialJs = b64_to_utf8(initialJs64 || '') || '';
const initialCss = b64_to_utf8(initialCss64 || '') || '';

registerEditor('html', $html, initialHtml);
registerEditor('javascript', $js, initialJs);
registerEditor('css', $css, initialCss);
createEditors(() => $view.setAttribute('srcdoc', createHtml()));

$view.setAttribute('srcdoc', createHtml());

function createHtml () {
  const [ htmlValue, jsValue, cssValue ] = getEditorsValues();

  const htmlEncode64 = utf8_to_b64(htmlValue);
  const jsEncode64 = utf8_to_b64(jsValue);
  const cssEncode64 = utf8_to_b64(cssValue);

  // Jg== is the & symbol encoded in base64
  const resultEncode64 = !htmlEncode64.length && !jsEncode64.length && !cssEncode64.length
    ? `${origin}`
    : `${origin}?${htmlEncode64}Jg==${jsEncode64}Jg==${cssEncode64}`;

  window.history.replaceState(null, null, resultEncode64);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Codi.link View</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        ${cssValue}
      </style>
    </head>
    <body>
      ${htmlValue}
      <script>
        ${jsValue}
      </script>
    </body>
  </html>  
  `;
}

const resizeObserver = new window.ResizeObserver(entries => {
  for (const entry of entries) {
    /* $js.style.width = `${window.innerWidth - entry.target.offsetWidth}px`;
    $css.style.width = `${entry.target.offsetWidth}px`;
    $view.style.width = `${window.innerWidth - entry.target.offsetWidth}px`;
    $js.style.height = `${entry.target.offsetHeight}px`;
    $css.style.height = `${window.innerHeight - entry.target.offsetHeight}px`;
    $view.style.height = `${window.innerHeight - entry.target.offsetHeight}px`; */

    $app.style.gridTemplateColumns = `${entry.target.offsetWidth}px ${window.innerWidth - entry.target.offsetWidth}px`;
    $app.style.gridTemplateRows = `${entry.target.offsetHeight}px 1fr`;
  }
});

resizeObserver.observe($html);
