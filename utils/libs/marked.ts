import hljs from 'highlight.js/lib/common';
import { marked } from 'marked';

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  breaks: true,
  gfm: true,
  mangle: true,
});

export { marked, hljs };
