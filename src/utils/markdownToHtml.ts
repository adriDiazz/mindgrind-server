// src/utils/markdownToHtml.ts
import { marked } from 'marked';

export async function markdownToHtml(markdown: string): Promise<string> {
  // Opcional: Configura opciones globales de 'marked' aquí
  marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true, // Habilita GitHub Flavored Markdown (GFM)
    breaks: false, // Convierte los saltos de línea en <br>
    pedantic: false,
  });

  // Convierte el contenido Markdown a HTML
  return await marked.parse(markdown);
}
