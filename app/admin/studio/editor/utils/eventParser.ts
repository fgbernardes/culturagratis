import type { ParsedEvent } from '../types';
import { readEventEnvelope, mapPublishedEvent } from './publishedEvent';

export const CATEGORY_COLORS: Record<string, string> = {
  'MÚSICA': '#FE7D02',
  'TEATRO': '#FFC107',
  'EXPOSIÇÃO': '#00838F',
  'CINEMA': '#1A1A1A',
  'FAMÍLIAS': '#FE7D02',
  'AR LIVRE': '#00838F',
  'ENTRADA LIVRE': '#FFC107',
};

export const parseEventText = (rawInput: string): ParsedEvent => {
  const text = rawInput.trim();
  if (!text) {
    return { title: 'Novo Evento' };
  }

  // Um JSON da pipeline nunca cai silenciosamente no interpretador de texto livre.
  if (text.startsWith('{') || text.startsWith('[')) {
    const { events } = readEventEnvelope(text);
    if (events.length !== 1) throw new Error('Escolhe um evento do lote na importação JSON.');
    const event = mapPublishedEvent(events[0]);
    return { ...event.studio, access: event.access, pipelineEvent: event };
  }

  // 2. Interpretador de texto livre / não formatado
  const lines = text
    .split('\n')
    .map((l) => l.trim().replace(/^[#*>-]\s*/, ''))
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { title: 'Novo Evento' };
  }

  const title = lines[0];
  let date = '';
  let venue = '';
  let category = '';
  let categoryColor = '#FE7D02';

  // Verificação global de gratuidade
  const lowerFullText = text.toLowerCase();
  const isFree =
    lowerFullText.includes('grátis') ||
    lowerFullText.includes('gratis') ||
    lowerFullText.includes('livre') ||
    lowerFullText.includes('gratuito') ||
    lowerFullText.includes('0€') ||
    lowerFullText.includes('0 eur') ||
    lowerFullText.includes('0 €') ||
    lowerFullText.includes('sem custos') ||
    lowerFullText.includes('acesso livre') ||
    lowerFullText.includes('entrada gratuita') ||
    lowerFullText.includes('entrada livre') ||
    lowerFullText.includes('free');

  const dateKeywords = [
    'segunda', 'terça', 'terca', 'quarta', 'quinta', 'sexta', 'sábado', 'sabado', 'domingo',
    'janeiro', 'fevereiro', 'março', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
    'horas', 'horário', 'horario', 'às', ' às ', ' as ', 'das', 'até', 'ate', 'h', 'min', 'dia', 'dias', 'semana', 'fim de semana',
  ];

  const venueKeywords = [
    'teatro', 'jardim', 'parque', 'galeria', 'largo', 'avenida', 'praça', 'praca',
    'chiado', 'penha de frança', 'penha de franca', 'belém', 'belem', 'museu',
    'auditório', 'auditorio', 'sala', 'espaço', 'espaco', 'estúdio', 'estudio',
    'ccb', 'terreiro do paço', 'terreiro do paco', 'bairro alto', 'alfama',
    'cais do sodré', 'cais do sodre', 'monsanto', 'fundação', 'fundacao',
    'pavilhão', 'pavilhao', 'culturgest', 'tivoli', 'd. maria', 'são luiz', 'sao luiz',
    'lux', 'lisboa', 'rua', 'travessa', 'miradouro', 'calçada', 'calcada',
    'centro cultural', 'mercado', 'palácio', 'palacio', 'quinta',
  ];

  const categoryMatchers = [
    {
      category: 'MÚSICA',
      color: '#FE7D02',
      patterns: ['música', 'musica', 'concerto', 'jazz', 'fado', 'rock', 'dj', 'acústico', 'acustico', 'orquestra', 'recital', 'banda', 'festival de jazz', 'show'],
    },
    {
      category: 'TEATRO',
      color: '#FFC107',
      patterns: ['teatro', 'peça', 'peca', 'comédia', 'comedia', 'drama', 'stand-up', 'ópera', 'opera', 'espetáculo', 'espetaculo', 'dança', 'danca', 'circo', 'performance'],
    },
    {
      category: 'EXPOSIÇÃO',
      color: '#00838F',
      patterns: ['exposição', 'exposicao', 'galeria', 'mostra', 'pintura', 'fotografia', 'artes', 'escultura', 'instalação', 'instalacao', 'artes plásticas', 'artes plasticas'],
    },
    {
      category: 'CINEMA',
      color: '#1A1A1A',
      patterns: ['cinema', 'filme', 'curta', 'longa', 'documentário', 'documentario', 'exibição', 'exibicao', 'sessão', 'sessao', 'cineclube', 'cine'],
    },
    {
      category: 'FAMÍLIAS',
      color: '#FE7D02',
      patterns: ['famílias', 'familias', 'crianças', 'criancas', 'infantil', 'contos', 'marionetas', 'oficinas infantis', 'pais e filhos', 'bebés', 'bebes', 'família', 'familia'],
    },
    {
      category: 'AR LIVRE',
      color: '#00838F',
      patterns: ['ar livre', 'ar-livre', 'ao ar livre', 'jardim', 'parque', 'miradouro'],
    },
  ];

  // Processar linhas subsequentes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // 1. Procurar correspondência de Categoria se ainda não encontrada
    if (!category) {
      // Verificar se a linha declara explicitamente a categoria (ex.: "Categoria: Música", "Estilo: Teatro")
      const explicitCatMatch = lowerLine.match(/(?:categoria|estilo|género|genero|tipo)[:\s]+([^,\n]+)/i);
      const testText = explicitCatMatch ? explicitCatMatch[1] : lowerLine;

      for (const matcher of categoryMatchers) {
        if (matcher.patterns.some((pat) => testText.includes(pat))) {
          category = matcher.category;
          categoryColor = matcher.color;
          break;
        }
      }
    }

    // 2. Verificar se a linha contém indicação de local ou data
    const hasVenueIndicator = venueKeywords.some((v) => lowerLine.includes(v));
    const hasDateIndicator =
      dateKeywords.some((d) => lowerLine.includes(d)) ||
      /\b\d{1,2}[:h]\d{2}\b/i.test(lowerLine) ||
      /\b\d{1,2}\/\d{1,2}\b/.test(lowerLine) ||
      /\b\d{1,2}\s+de\s+[a-zçã]+/i.test(lowerLine);

    if (hasVenueIndicator && !hasDateIndicator) {
      if (venue) venue += ' • ' + line;
      else venue = line;
    } else if (hasDateIndicator && !hasVenueIndicator) {
      if (date) date += ' • ' + line;
      else date = line;
    } else if (hasVenueIndicator && hasDateIndicator) {
      if (!date) date = line;
      else if (!venue) venue = line;
      else venue += ' • ' + line;
    } else {
      // Linha sem palavras-chave óbvias: se não for mera menção de categoria/gratuito, atribuir
      if (!lowerLine.startsWith('categoria:') && !lowerLine.startsWith('estilo:')) {
        if (!date) date = line;
        else if (!venue) venue = line;
      }
    }
  }

  // Se não foi encontrada categoria no corpo, verificar o título
  if (!category) {
    const lowerTitle = title.toLowerCase();
    for (const matcher of categoryMatchers) {
      if (matcher.patterns.some((pat) => lowerTitle.includes(pat))) {
        category = matcher.category;
        categoryColor = matcher.color;
        break;
      }
    }
  }

  return {
    title,
    date: date || undefined,
    venue: venue || undefined,
    category: category || undefined,
    categoryColor,
    isFree,
  };
};
