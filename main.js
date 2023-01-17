import * as monaco from 'monaco-editor';
import { emmetHTML, emmetCSS /* , emmetJSX, expandAbbreviation */ } from 'emmet-monaco-es';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';

import './style.css';

const $ = selector => document.querySelector(selector);

const $app = document.getElementById('app');
const $html = $('#html');
const $js = $('#js');
const $css = $('#css');
const $view = $('#view');

$html.style.width = '50vw';
$html.style.height = '50vh';

window.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    switch (label) {
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker();
      case 'typescript':
      case 'javascript':
        return new JsWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker();
    }
  }
};

const EDITOR_COMMON_OPTIONS = {
  theme: 'vs-dark',
  minimap: {
    enabled: false
  }
  /* padding: {
    top: 5,
  }, */
  // lineNumbersMinChars: 2
};

const htmlEditor = monaco.editor.create($html, {
  value: '',
  language: 'html',
  // tabCompletion: "on",
  fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false,
  ...EDITOR_COMMON_OPTIONS
  // glyphMargin: -100,
  // automaticLayout: true
  // autoClosingBrackets: true
});

const jsEditor = monaco.editor.create($js, {
  value: '',
  language: 'javascript',
  ...EDITOR_COMMON_OPTIONS
  // automaticLayout: true
});

const cssEditor = monaco.editor.create($css, {
  value: '',
  language: 'css',
  ...EDITOR_COMMON_OPTIONS
  // automaticLayout: true
});

htmlEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml()));
jsEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml()));
cssEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml()));

// https://github.com/microsoft/monaco-editor/issues/221
monaco.languages.registerCompletionItemProvider('html', {
  triggerCharacters: ['>'],
  provideCompletionItems: (model, position) => {
    const codePre = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column
    });

    const tag = codePre.match(/.*<(\w+)>$/)?.[1];

    if (!tag) {
      return {};
    }

    const word = model.getWordUntilPosition(position);

    return {
      suggestions: [
        {
          label: `</${tag}>`,
          kind: monaco.languages.CompletionItemKind.EnumMember,
          insertText: `</${tag}>`,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }
        }
      ]
    };
  }
});

emmetHTML(monaco);
emmetCSS(monaco);

function createHtml () {
  const htmlValue = htmlEditor.getValue() || '<h1>Welcome to Codi.link! - from value</h1>';
  const jsValue = jsEditor.getValue();
  const cssValue = cssEditor.getValue();

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
