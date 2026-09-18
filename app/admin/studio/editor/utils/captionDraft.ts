interface CaptionTextElement {
  id?: string;
  type: string;
  content?: string;
  fontSize?: number;
}

interface CaptionSlide {
  elements: CaptionTextElement[];
}

const normalise = (value: string) => value.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

const prefixedLine = (elements: CaptionTextElement[], prefix: string) => {
  const element = elements.find((item) => item.type === 'text' && item.content?.includes(prefix));
  return element?.content
    ?.split('\n')
    .find((line) => line.includes(prefix))
    ?.replace(prefix, '')
    .trim();
};

export function buildCaptionDraft(slides: CaptionSlide[]): string {
  const textElements = slides.flatMap((slide) => slide.elements.filter((element) => element.type === 'text' && element.content));
  const title = textElements.slice().sort((a, b) => (b.fontSize || 0) - (a.fontSize || 0))[0]?.content;
  const venue = prefixedLine(textElements, '📍');
  const date = prefixedLine(textElements, '📅');

  return [
    `✨ ${title ? normalise(title) : '[Título do evento]'}`,
    `📍 ${venue || '[Local por confirmar]'}`,
    `📅 ${date || '[Data e hora por confirmar]'}`,
    '',
    'Confirma datas, local e condições de acesso antes de publicar.',
    '',
    '#CulturaLisboa #AgendaLisboa #LisboaCultura',
  ].join('\n');
}
