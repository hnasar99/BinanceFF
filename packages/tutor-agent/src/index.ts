import type { SupportedLocale } from '../../i18n/src/index';

export interface TutorContext {
  locale: SupportedLocale;
  userExperience: 'new' | 'intermediate' | 'advanced';
  activeSurface: 'simulation' | 'bounty' | 'outcome' | 'ranking';
  activeBounty?: {
    objective: string;
    status: string;
    budgetUsd?: number;
    netResultUsd?: number;
  };
}

export interface TutorSuggestion {
  title: string;
  intent: string;
  explanation: string;
  requiresCapital: boolean;
}

const examples: Record<SupportedLocale, TutorSuggestion[]> = {
  en: [
    {
      title: 'Explore without capital',
      intent: 'Analyze a hypothetical BNB Chain yield opportunity under medium risk and explain the team formation.',
      explanation: 'A free simulation that shows how agents organize, execute jobs and verify an outcome.',
      requiresCapital: false,
    },
    {
      title: 'Compare execution teams',
      intent: 'Form two candidate teams for the same arbitrage analysis and compare cost, latency and expected success.',
      explanation: 'Shows why team composition matters instead of choosing agents independently.',
      requiresCapital: false,
    },
  ],
  es: [
    {
      title: 'Explorar sin capital',
      intent: 'Analizá una oportunidad hipotética de yield en BNB Chain con riesgo medio y explicá cómo se forma el equipo.',
      explanation: 'Una simulación gratuita que muestra cómo los agentes se organizan, ejecutan tareas y verifican el resultado.',
      requiresCapital: false,
    },
    {
      title: 'Comparar equipos',
      intent: 'Formá dos equipos candidatos para el mismo análisis de arbitraje y compará costo, latencia y éxito esperado.',
      explanation: 'Muestra por qué importa la composición del equipo y no sólo el ranking individual.',
      requiresCapital: false,
    },
  ],
  'pt-BR': [], 'zh-CN': [], ko: [], ja: [], fr: [], de: [],
};

export function tutorSuggestions(context: TutorContext): TutorSuggestion[] {
  const localized = examples[context.locale];
  return localized.length > 0 ? localized : examples.en;
}

export function tutorSystemRules(context: TutorContext): string[] {
  return [
    `Respond in locale ${context.locale}.`,
    'Teach by proposing executable examples inside the product, not by sending the user to documentation.',
    'Explain budgets, constraints, team formation, execution events and Proof of Outcome in plain language.',
    'Prefer contextual suggestions based on the current surface and active bounty.',
    'Never imply a simulated transaction, mock result or forecast is real on-chain execution.',
    'Never authorize or silently trigger a capital-moving action; explicit user confirmation is required.',
  ];
}
