export const supportedLocales = ['en', 'es', 'pt-BR', 'zh-CN', 'ko', 'ja', 'fr', 'de'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export type MessageKey =
  | 'app.intent.placeholder'
  | 'app.run'
  | 'app.tutor.title'
  | 'app.tutor.tryExample'
  | 'app.outcome.verified'
  | 'app.bounty.cost'
  | 'app.bounty.netResult';

const messages: Record<SupportedLocale, Record<MessageKey, string>> = {
  en: {
    'app.intent.placeholder': 'What should the agent economy accomplish?',
    'app.run': 'Run',
    'app.tutor.title': 'Agent Tutor',
    'app.tutor.tryExample': 'Try an example',
    'app.outcome.verified': 'Verified outcome',
    'app.bounty.cost': 'Cost',
    'app.bounty.netResult': 'Net result',
  },
  es: {
    'app.intent.placeholder': '¿Qué querés que logre la economía de agentes?',
    'app.run': 'Ejecutar',
    'app.tutor.title': 'Tutor de Agentes',
    'app.tutor.tryExample': 'Probar un ejemplo',
    'app.outcome.verified': 'Resultado verificado',
    'app.bounty.cost': 'Costo',
    'app.bounty.netResult': 'Resultado neto',
  },
  'pt-BR': {
    'app.intent.placeholder': 'O que a economia de agentes deve realizar?',
    'app.run': 'Executar',
    'app.tutor.title': 'Tutor de Agentes',
    'app.tutor.tryExample': 'Testar um exemplo',
    'app.outcome.verified': 'Resultado verificado',
    'app.bounty.cost': 'Custo',
    'app.bounty.netResult': 'Resultado líquido',
  },
  'zh-CN': {
    'app.intent.placeholder': '你希望智能体经济完成什么？',
    'app.run': '运行',
    'app.tutor.title': '智能体导师',
    'app.tutor.tryExample': '试试示例',
    'app.outcome.verified': '已验证结果',
    'app.bounty.cost': '成本',
    'app.bounty.netResult': '净结果',
  },
  ko: {
    'app.intent.placeholder': '에이전트 경제가 무엇을 달성해야 하나요?',
    'app.run': '실행',
    'app.tutor.title': '에이전트 튜터',
    'app.tutor.tryExample': '예제 실행',
    'app.outcome.verified': '검증된 결과',
    'app.bounty.cost': '비용',
    'app.bounty.netResult': '순결과',
  },
  ja: {
    'app.intent.placeholder': 'エージェント経済に何を達成させますか？',
    'app.run': '実行',
    'app.tutor.title': 'エージェント・チューター',
    'app.tutor.tryExample': '例を試す',
    'app.outcome.verified': '検証済み結果',
    'app.bounty.cost': 'コスト',
    'app.bounty.netResult': '純結果',
  },
  fr: {
    'app.intent.placeholder': "Que doit accomplir l'économie d'agents ?",
    'app.run': 'Exécuter',
    'app.tutor.title': "Tuteur d'agents",
    'app.tutor.tryExample': 'Essayer un exemple',
    'app.outcome.verified': 'Résultat vérifié',
    'app.bounty.cost': 'Coût',
    'app.bounty.netResult': 'Résultat net',
  },
  de: {
    'app.intent.placeholder': 'Was soll die Agentenökonomie erreichen?',
    'app.run': 'Ausführen',
    'app.tutor.title': 'Agenten-Tutor',
    'app.tutor.tryExample': 'Beispiel testen',
    'app.outcome.verified': 'Verifiziertes Ergebnis',
    'app.bounty.cost': 'Kosten',
    'app.bounty.netResult': 'Nettoergebnis',
  },
};

export function t(locale: SupportedLocale, key: MessageKey): string {
  return messages[locale]?.[key] ?? messages.en[key];
}

export function normalizeLocale(input?: string | null): SupportedLocale {
  if (!input) return 'en';
  const exact = supportedLocales.find((locale) => locale.toLowerCase() === input.toLowerCase());
  if (exact) return exact;
  const base = input.split('-')[0].toLowerCase();
  const baseMatch = supportedLocales.find((locale) => locale.toLowerCase().split('-')[0] === base);
  return baseMatch ?? 'en';
}
