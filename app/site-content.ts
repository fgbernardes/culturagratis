export { categories } from "./editorial-taxonomy";

export const parishes = [
  ["ajuda", "Ajuda"], ["alcantara", "Alcântara"], ["alvalade", "Alvalade"],
  ["areeiro", "Areeiro"], ["arroios", "Arroios"], ["avenidas-novas", "Avenidas Novas"],
  ["beato", "Beato"], ["belem", "Belém"], ["benfica", "Benfica"],
  ["campo-de-ourique", "Campo de Ourique"], ["campolide", "Campolide"], ["carnide", "Carnide"],
  ["estrela", "Estrela"], ["lumiar", "Lumiar"], ["marvila", "Marvila"],
  ["misericordia", "Misericórdia"], ["olivais", "Olivais"], ["parque-das-nacoes", "Parque das Nações"],
  ["penha-de-franca", "Penha de França"], ["santa-clara", "Santa Clara"],
  ["santa-maria-maior", "Santa Maria Maior"], ["santo-antonio", "Santo António"],
  ["sao-domingos-de-benfica", "São Domingos de Benfica"], ["sao-vicente", "São Vicente"],
] as const;

export type EditorialSection = {
  title: string;
  body?: string[];
  bullets?: string[];
};

export type EditorialPage = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  updated?: string;
  sections: EditorialSection[];
  actions?: { label: string; href: string; primary?: boolean }[];
};

export const editorialPages: EditorialPage[] = [
  {
    slug: "apoia",
    eyebrow: "APOIAR O PROJETO",
    title: "Dá-nos uma mãozinha",
    intro: "O teu apoio ajuda a manter uma agenda cultural independente e gratuita para quem a consulta.",
    sections: [
      { title: "Apoio voluntário", body: ["Apoiar o Cultura Grátis Lisboa é uma escolha tua. Não é uma compra nem uma condição para consultar o site, sugerir uma iniciativa ou receber a newsletter."] },
      { title: "Buy Me a Coffee", body: ["Podes apoiar o projeto através do Buy Me a Coffee. O pagamento é feito na plataforma externa, sem ser processado neste site."] },
      { title: "Outras formas de apoiar", body: ["Stripe: ligação de pagamento em configuração. MB WAY: QR em preparação. Não é necessário apoiar para consultar o site."] },
      { title: "Colaborar", body: ["Para propostas de colaboração ou dúvidas, escreve para ola@culturagratis.com."] },
    ],
    actions: [
      { label: "Apoiar no Buy Me a Coffee", href: "https://buymeacoffee.com/culturagratislisboa", primary: true },
      { label: "Escrever ao CGL", href: "mailto:ola@culturagratis.com?subject=Apoiar%20o%20CGL" },
    ],
  },
  {
    slug: "noticias",
    eyebrow: "NOTÍCIAS",
    title: "Notícias",
    intro: "Atualizações sobre o projeto e a cultura de Lisboa, com fontes e datas identificadas.",
    sections: [
      { title: "Primeiras notícias", body: ["Ainda não há notícias publicadas nesta secção. Quando houver, cada texto indicará a data e as fontes utilizadas."] },
    ],
    actions: [{ label: "Conhecer o projeto", href: "/sobre", primary: true }],
  },
  {
    slug: "coletividades",
    eyebrow: "COLETIVIDADES",
    title: "A cultura também nasce no bairro",
    intro: "Uma secção para dar visibilidade a coletividades, associações e espaços comunitários do município de Lisboa.",
    sections: [
      { title: "Diretório em preparação", body: ["Ainda não há entidades listadas. As futuras fichas terão identificação, freguesia, contactos públicos e ligações oficiais confirmadas antes da publicação."] },
      { title: "Tens uma correção?", body: ["Se representas uma coletividade ou encontraste informação desatualizada, escreve para ola@culturagratis.com."] },
    ],
    actions: [{ label: "Contactar o CGL", href: "mailto:ola@culturagratis.com?subject=Coletividades", primary: true }],
  },

  {
    slug: "sobre",
    eyebrow: "O PROJETO",
    title: "Cultura sem barreira económica, com Lisboa por inteiro",
    intro: "O Cultura Grátis Lisboa é uma plataforma editorial independente para descobrir propostas culturais de acesso gratuito no município de Lisboa.",
    sections: [
      {
        title: "Para que existimos",
        body: [
          "A informação cultural está dispersa, muda depressa e nem sempre explica bem as condições de entrada. Reunimos, verificamos e organizamos essa informação para que seja útil antes de sair de casa.",
          "Tratamos a cultura como um direito, a cidade como palco e a curadoria como responsabilidade. A utilidade vem antes das métricas e a clareza antes do entusiasmo fabricado.",
        ],
      },
      {
        title: "Como funciona",
        bullets: [
          "Descobrimos propostas em fontes identificáveis.",
          "Confirmamos gratuitidade, data, hora, local e condições de acesso.",
          "Uma pessoa revê e publica cada entrada; nenhuma sugestão entra automaticamente.",
          "Mantemos a fonte e a data da última verificação visíveis para facilitar a confirmação.",
        ],
      },
      {
        title: "Independente e responsável",
        body: [
          "O site, e não as redes sociais, é a referência pública do projeto. Comunicamos com rigor editorial, mas o CGL não se apresenta como órgão de comunicação social nem reivindica estatuto jornalístico formal.",
          "A seleção editorial mantém-se independente de promotores, espaços, plataformas e agendas políticas. O critério central é simples: dar visibilidade a eventos, atividades e outras iniciativas que dinamizem Lisboa e sejam acessíveis sem qualquer pagamento por parte do público.",
        ],
      },
    ],
    actions: [
      { label: "Ler a política dos 0 €", href: "/politica-0-euros", primary: true },
      { label: "Contactar o projeto", href: "/contactos" },
    ],
  },
  {
    slug: "politica-0-euros",
    eyebrow: "CRITÉRIO EDITORIAL",
    title: "Grátis quer dizer 0 €",
    intro: "Publicamos apenas propostas culturais cujo acesso pode ser feito sem pagamento, custos ocultos ou consumo obrigatório.",
    sections: [
      {
        title: "O que pode entrar",
        bullets: [
          "Entrada livre sem inscrição.",
          "Bilhete ou reserva gratuitos, mesmo quando a lotação é limitada.",
          "Lista de espera ou levantamento prévio, quando a condição está explicada com clareza.",
          "Gratuitidade condicionada, quando o critério é objetivo, público e verificável.",
          "Donativo voluntário apenas depois de revisão editorial humana.",
        ],
      },
      {
        title: "O que fica de fora",
        bullets: [
          "Consumo mínimo ou compra obrigatória.",
          "Preço escondido numa fase posterior da reserva.",
          "Pagamento à saída, contribuição obrigatória ou custo indireto necessário.",
          "Eventos pagos — incluindo os que custam até 5 €.",
        ],
      },
      {
        title: "Quando há dúvidas",
        body: [
          "A entrada não é publicada até haver confirmação suficiente. Se as condições mudarem, a informação volta a ser revista e a página pode ser corrigida, assinalada como indisponível ou retirada da agenda.",
        ],
      },
    ],
    actions: [{ label: "Sugerir um evento", href: "/submeter-evento", primary: true }],
  },
  {
    slug: "contactos",
    eyebrow: "CONTACTOS",
    title: "Fala connosco",
    intro: "Escolhe o canal certo para conseguirmos responder e verificar a informação mais depressa.",
    sections: [
      {
        title: "Contacto geral",
        body: ["Para questões sobre o projeto, parcerias e informação institucional: ola@culturagratis.com."],
      },
      {
        title: "Eventos e correções",
        body: ["Para uma nova proposta, usa a página Sugerir evento. Se encontraste um erro numa página já publicada, usa Reportar correção e indica a fonte sempre que possível."],
      },
      {
        title: "Privacidade",
        body: ["Questões sobre dados pessoais: privacidade@culturagratis.com."],
      },
    ],
    actions: [
      { label: "Sugerir evento", href: "/submeter-evento", primary: true },
      { label: "Reportar correção", href: "/corrigir-informacao" },
    ],
  },
  {
    slug: "submeter-evento",
    eyebrow: "PARTICIPAR",
    title: "Sugere um evento gratuito",
    intro: "Partilha uma proposta que cumpra a política dos 0 €. Cada sugestão é verificada e nenhuma é publicada automaticamente.",
    sections: [
      {
        title: "O que precisamos",
        bullets: [
          "Nome do evento, data e horário.",
          "Local e freguesia de Lisboa.",
          "Ligação para uma fonte oficial e atualizada.",
          "Condições exatas de acesso: entrada livre, reserva, levantamento ou lotação.",
          "Informação de acessibilidade, se estiver confirmada pela organização.",
        ],
      },
      {
        title: "Antes de enviar",
        body: ["Confirma que o acesso é realmente 0 €. Propostas com consumo obrigatório, preço oculto ou pagamento posterior não são elegíveis."],
      },
    ],
  },
  {
    slug: "corrigir-informacao",
    eyebrow: "PARTICIPAR",
    title: "Encontraste informação errada?",
    intro: "Identifica a página, descreve o que mudou e junta uma fonte atual sempre que exista.",
    sections: [
      {
        title: "O que precisamos",
        bullets: [
          "Ligação ou título do evento.",
          "Descrição curta do erro ou da alteração.",
          "Fonte oficial que confirme a correção, se disponível.",
        ],
      },
      {
        title: "O que acontece depois",
        body: ["A equipa editorial confirma a alteração antes de atualizar a página. Cancelamentos, mudanças de horário e alterações de acesso têm prioridade."],
      },
    ],
  },
  {
    slug: "verificacao",
    eyebrow: "CGL VERIFICA",
    title: "Verificamos antes de publicar",
    intro: "O selo CGL Verifica identifica informação prática que foi confirmada editorialmente numa fonte oficial ou primária identificável.",
    updated: "Metodologia v1.0 · agosto de 2026",
    sections: [
      {
        title: "O que significa o selo",
        body: [
          "Quando uma página apresenta o selo Verificado pelo CGL, significa que revimos os dados essenciais do evento e registámos a data dessa verificação. O selo confirma a informação publicada; não avalia a qualidade artística da proposta nem certifica a entidade organizadora.",
          "O CGL é um projeto editorial independente. Este selo não é uma certificação oficial, uma garantia pública ou um selo atribuído pela organização do evento.",
        ],
      },
      {
        title: "O que confirmamos",
        bullets: [
          "Título, data e horário anunciados.",
          "Local, morada e território abrangido pelo CGL.",
          "Gratuitidade e eventuais condições de reserva, levantamento, inscrição ou lotação.",
          "Modo de acesso e informação de acessibilidade apenas quando existe confirmação suficiente.",
          "Ligação para a fonte usada e data da última verificação.",
        ],
      },
      {
        title: "Que fontes usamos",
        body: [
          "Privilegiamos páginas e comunicações oficiais da entidade organizadora, do equipamento cultural, do promotor ou da plataforma de reservas indicada pela organização. Quando existem dados contraditórios, a publicação fica pendente até conseguirmos confirmação suficiente.",
          "Redes sociais podem ser usadas como fonte primária quando pertencem à organização e contêm a atualização mais recente, mas não substituem automaticamente uma página oficial mais completa.",
        ],
      },
      {
        title: "O que o selo não garante",
        bullets: [
          "Que a programação não será alterada depois da verificação.",
          "Que ainda existem lugares disponíveis ou que a entrada está assegurada.",
          "A qualidade, segurança, acessibilidade integral ou adequação do evento a cada pessoa.",
          "A exatidão de informação que a própria entidade organizadora ainda não publicou ou confirmou.",
        ],
      },
      {
        title: "Correções e atualizações",
        body: [
          "Se uma condição mudar, atualizamos a página e renovamos a data de verificação. Cancelamentos, alterações de horário, mudança de local e perda de gratuitidade têm prioridade editorial.",
          "Qualquer pessoa pode reportar um erro. A correção é confirmada antes de ser publicada e a fonte atualizada fica disponível na página do evento.",
        ],
      },
    ],
    actions: [
      { label: "Reportar uma correção", href: "/corrigir-informacao", primary: true },
      { label: "Ler a política dos 0 €", href: "/politica-0-euros" },
    ],
  },
  {
    slug: "acessibilidade",
    eyebrow: "ACESSIBILIDADE",
    title: "Uma agenda para poder ser usada por todos",
    intro: "O nosso objetivo de produto é cumprir as WCAG 2.2 no nível AA. A construção e os testes de acessibilidade continuam antes do lançamento.",
    updated: "Estado: versão em construção · agosto de 2026",
    sections: [
      {
        title: "O que estamos a implementar",
        bullets: [
          "Navegação integral por teclado e foco sempre visível.",
          "Contraste de texto e controlos compatível com leitura confortável.",
          "Reflow em ecrãs estreitos, zoom e respeito pela preferência de movimento reduzido.",
          "Etiquetas, estados e mensagens de erro compreensíveis por tecnologias de apoio.",
        ],
      },
      {
        title: "Acessibilidade dos eventos",
        body: ["Só indicamos recursos de acessibilidade quando existe confirmação numa fonte ou pela organização. Quando não conseguimos confirmar, dizemos precisamente isso."],
      },
      {
        title: "Reportar uma barreira",
        body: ["Se não consegues consultar ou operar alguma parte do site, escreve para ola@culturagratis.com e indica a página, o dispositivo e o problema encontrado."],
      },
    ],
    actions: [{ label: "Reportar uma barreira", href: "mailto:ola@culturagratis.com?subject=Barreira%20de%20acessibilidade", primary: true }],
  },
  {
    slug: "privacidade",
    eyebrow: "TRANSPARÊNCIA",
    title: "Política de Privacidade",
    intro: "Aqui explicamos, de forma clara, que dados recolhemos, para que servem e como os protegemos.",
    updated: "Versão 1.3 · 1 de setembro de 2026",
    sections: [
      {
        title: "Quem é responsável pelo tratamento",
        body: ["O responsável pelo tratamento dos dados pessoais é Filipe Bernardes, que gere o projeto Cultura Grátis Lisboa.", "Para qualquer questão sobre privacidade, escreve para privacidade@culturagratis.com."],
      },
      {
        title: "Que dados tratamos",
        body: ["Recolhemos o primeiro nome e o endereço de email que introduzes no formulário. Guardamos também o estado da subscrição e da confirmação, a versão do texto de consentimento que aceitaste e as datas associadas à submissão, confirmação, cancelamento ou eliminação.", "Podemos ainda tratar alguns registos técnicos necessários para entregar as mensagens, proteger o formulário e prevenir abusos. Entre eles podem estar o endereço IP, informação sobre o navegador ou dispositivo, sinais de segurança tratados pelos fornecedores e dados sobre entrega, devolução ou cancelamento das mensagens.", "Não pedimos apelido, número de telemóvel ou outros dados através deste formulário. Também não criamos perfis nem tomamos decisões automáticas com efeitos jurídicos ou semelhantes."],
      },
      {
        title: "Para que usamos os dados e com que fundamento",
        bullets: ["Gerir a subscrição, usar o primeiro nome na saudação e enviar comunicações do Cultura Grátis Lisboa, incluindo o aviso de abertura do site. Fazemo-lo com base no teu consentimento.", "Confirmar que o endereço de email é realmente teu e guardar prova do consentimento, para podermos demonstrar que respeitamos as regras aplicáveis.", "Entregar as mensagens e gerir devoluções, cancelamentos e listas de supressão. Para isso, apoiamo-nos no teu consentimento e no nosso interesse legítimo em manter a lista segura e atualizada.", "Proteger o formulário contra spam, fraude e utilização automática abusiva. Fazemo-lo com base no nosso interesse legítimo em garantir a segurança do serviço.", "Cumprir obrigações legais e, quando necessário, exercer ou defender direitos. Nestes casos, o fundamento será uma obrigação legal ou o nosso interesse legítimo, consoante a situação."],
      },
      {
        title: "Como funciona a subscrição",
        body: ["A subscrição tem dois passos, num processo conhecido como double opt-in. Depois de enviares o formulário, recebes uma mensagem para confirmar o endereço. Só passas a fazer parte da lista quando clicas na ligação de confirmação.", "Se não confirmares dentro do prazo disponibilizado pelo Brevo, o endereço não entra na lista de contactos. Os registos das tentativas não confirmadas são eliminados no prazo operacional máximo de 30 dias, salvo se existir uma razão técnica ou jurídica devidamente justificada para os conservar durante mais tempo.", "Todas as mensagens incluem uma forma simples de cancelar a subscrição. Não prometemos uma frequência fixa de envio. Nesta fase, a lista serve sobretudo para avisar da abertura do site."],
      },
      {
        title: "Fornecedores e destinatários",
        body: ["Para manter este serviço a funcionar, recorremos à Brevo / Sendinblue SAS, que aloja a lista, gere a dupla confirmação e envia as mensagens. Recorremos também à Cloudflare para o alojamento, a entrega e a proteção técnica do site, incluindo o Cloudflare Turnstile, que ajuda a prevenir spam, fraude e abuso.", "Estes prestadores tratam os dados de acordo com os respetivos contratos e condições de tratamento. Se houver tratamento fora do Espaço Económico Europeu, têm de ser aplicadas as garantias previstas no RGPD, como decisões de adequação ou cláusulas contratuais-tipo, conforme o caso.", "O CGL não vende listas nem entrega os contactos a terceiros para que façam publicidade própria."],
      },
      {
        title: "Conservação",
        bullets: ["Subscritores confirmados: enquanto a subscrição estiver ativa.", "Tentativas não confirmadas: até 30 dias, salvo necessidade técnica ou jurídica justificada.", "Depois do cancelamento: o endereço é retirado dos envios. Pode ser mantido numa lista mínima de supressão para respeitar o cancelamento e evitar reativação indevida.", "Prova do consentimento e registos de conformidade: apenas durante o período necessário para demonstrar o cumprimento de obrigações ou exercer ou defender direitos."],
      },
      {
        title: "Segurança",
        body: ["Aplicamos medidas de segurança adequadas ao risco. Entre elas estão a dupla confirmação da subscrição, o Cloudflare Turnstile com validação no servidor, a limitação de acessos, a autenticação das contas de administração, a atualização dos serviços e a revisão dos registos necessários."],
      },
      {
        title: "Cookies e tecnologias semelhantes",
        body: ["Esta página usa apenas a tecnologia necessária para proteger o formulário contra abusos. O Cloudflare Turnstile é usado exclusivamente para esse fim e a configuração não ativa a funcionalidade de pre-clearance. Antes de disponibilizarmos o formulário, testamos os cookies e os pedidos feitos a serviços externos.", "Nesta fase, o site não usa cookies de análise de audiência, marketing, personalização ou publicidade comportamental. Por isso não existe um banner de consentimento: não há nada a aceitar para além do que é estritamente necessário ao funcionamento e à segurança do formulário.", "Se os testes detetarem cookies ou tecnologias que não sejam estritamente necessários, o formulário não será disponibilizado sem um mecanismo válido de informação e consentimento."],
      },
      {
        title: "Direitos",
        body: ["Nos termos aplicáveis, podes pedir acesso aos teus dados, a sua retificação ou apagamento, a limitação do tratamento, a portabilidade e a oposição quando o tratamento se baseie num interesse legítimo. Também podes retirar o consentimento a qualquer momento.", "Para exercer estes direitos, escreve para privacidade@culturagratis.com. Podes ainda apresentar uma reclamação à Comissão Nacional de Proteção de Dados (CNPD), em www.cnpd.pt."],
      },
      {
        title: "Alterações",
        body: ["Atualizaremos esta política sempre que mudarem os dados tratados, as finalidades, as funcionalidades ou os fornecedores do projeto. A versão e a data da última atualização aparecem no início da página."],
      },
    ],
    actions: [{ label: "Contacto de privacidade", href: "mailto:privacidade@culturagratis.com", primary: true }],
  },
  {
    slug: "cookies",
    eyebrow: "TRANSPARÊNCIA",
    title: "Cookies e tecnologias semelhantes",
    intro: "A versão pública atual não ativa cookies opcionais de análise, marketing ou personalização.",
    updated: "Versão de pré-lançamento · agosto de 2026",
    sections: [
      {
        title: "Tecnologia estritamente necessária",
        body: ["O alojamento e a segurança podem usar tecnologia técnica indispensável para entregar e proteger o serviço. A área de gestão recorre a autenticação, mas não faz parte da navegação pública."],
      },
      {
        title: "Se isto mudar",
        body: ["Antes de ativarmos medição, marketing ou personalização, atualizaremos esta página e implementaremos escolhas válidas, com recusa por defeito para tudo o que não seja necessário."],
      },
    ],
  },
  {
    slug: "termos",
    eyebrow: "TRANSPARÊNCIA",
    title: "Termos de utilização",
    intro: "O Cultura Grátis Lisboa organiza informação cultural para ajudar a descobrir propostas gratuitas na cidade. Esta versão acompanha a fase de construção do serviço.",
    updated: "Versão de pré-lançamento · agosto de 2026",
    sections: [
      {
        title: "Informação editorial",
        body: ["Verificamos os dados antes da publicação, mas horários, lotação e condições podem mudar por decisão das entidades organizadoras. Confirma sempre a fonte oficial indicada na página do evento."],
      },
      {
        title: "Ligações externas",
        body: ["As ligações para organizações, reservas e fontes são disponibilizadas para confirmação. O conteúdo e funcionamento desses serviços pertencem aos respetivos responsáveis."],
      },
      {
        title: "Sugestões e correções",
        body: ["Enviar uma sugestão não garante publicação. Podemos editar, pedir confirmação, rejeitar ou retirar conteúdos que não cumpram a política dos 0 € e os critérios editoriais."],
      },
      {
        title: "Direitos e contacto",
        body: ["Não reutilizamos imagens ou textos de terceiros sem base adequada. Para correções, direitos ou outras questões, escreve para ola@culturagratis.com."],
      },
    ],
  },
];

export function getEditorialPage(slug: string) {
  return editorialPages.find((page) => page.slug === slug);
}
