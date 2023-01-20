import * as monaco from 'monaco-editor';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import JsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import { emmetHTML, emmetCSS /* , emmetJSX, expandAbbreviation */ } from 'emmet-monaco-es';

const EDITOR_COMMON_OPTIONS = {
  theme: 'vs-dark',
  minimap: {
    enabled: false
  }
  /* fixedOverflowWidgets: true,
  scrollBeyondLastLine: false,
  roundedSelection: false, */
  /* padding: {
    top: 5,
  }, */
  // lineNumbersMinChars: 2
};

const DEFAULT_OPTIONS = {
  value: '',
  language: 'html'
};

const ALLOWED_EDITORS = ['html', 'javascript', 'js', 'css'];

const EDITORS = [];

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

/* const htmlEditor = monaco.editor.create($html, {
  value: `${initialHtml}`,
  language: 'html',
  ...EDITOR_COMMON_OPTIONS
});

const jsEditor = monaco.editor.create($js, {
  value: `${initialJs}`,
  language: 'javascript',
  ...EDITOR_COMMON_OPTIONS
});

const cssEditor = monaco.editor.create($css, {
  value: `${initialCss}`,
  language: 'css',
  ...EDITOR_COMMON_OPTIONS
}); */

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

export function registerEditor(language = '', container = null, initialValue = '', editor = null) {
  EDITORS.push({ language, container, initialValue, editor });
}

export function createEditor(container, options = DEFAULT_OPTIONS) {
  if(!ALLOWED_EDITORS.includes(options.language.toLowerCase())) return null;

  return monaco.editor.create(container, {
    ...options,
    ...EDITOR_COMMON_OPTIONS
  });
}

export function createEditors(onDidChangeModelContent = () => {}) {
  EDITORS.forEach((obj) => {
    const { language, container, initialValue } = obj;
    obj.editor = createEditor(container, { 
      value: `${initialValue}`,
      language
    });
    obj.editor.onDidChangeModelContent(onDidChangeModelContent);
  });

  return EDITORS;
}

export function getEditors() {
  return EDITORS;
}

export function getEditorsValues() {
  const values = [];
  EDITORS.forEach(obj => values.push(obj.editor.getValue() || ''));
  return values;
}

/* htmlEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml()));
jsEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml()));
cssEditor.onDidChangeModelContent(() => $view.setAttribute('srcdoc', createHtml())); */

emmetHTML(monaco);
emmetCSS(monaco);