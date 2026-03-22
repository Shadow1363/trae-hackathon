export type Lang = "en" | "pt";

const translations = {
  en: {
    age: {
      title: "What is your age?",
      description:
        "Age is an important factor in understanding your vision baseline and assessing potential risks like presbyopia.",
      placeholder: "e.g. 35",
      continue: "Continue",
    },
    glasses: {
      title: "Do you wear glasses or contacts?",
      description:
        "We need to know this to properly guide you through the vision acuity tests.",
      yes: "Yes, I do",
      no: "No, I don't",
    },
    astig: {
      badge: "Test 2 of 4: Astigmatism",
      title: "Astigmatism Check",
      look: "Look at the circle of lines below.",
      question: "Do any lines appear darker, sharper, or clearer than others?",
      yes: "Yes, some are darker",
      no: "No, all look the same",
    },
    contrast: {
      badge: "Test 3 of 4: Contrast",
      title: "Contrast Sensitivity",
      instruction: "Read the letters as they fade.",
      question: "Can you distinguish these letters?",
      yes: "Yes",
      no: "No, too faint",
    },
    amsler: {
      badge: "Test 4 of 4: Amsler Grid",
      title: "Retinal Check",
      instruction: "Focus on the center dot below.",
      question:
        "While looking at the center dot, do any lines look wavy, distorted, or missing?",
      yes: "Yes, some are wavy/missing",
      no: "No, all straight",
    },
    questionnaire: {
      badge: "Final Step: Questionnaire",
      title: "Eye Strain Check",
      progress: "Question {n} of {total}",
      yes: "Yes",
      no: "No",
      questions: [
        "Do you squint often?",
        "Do you get headaches after screen use?",
        "Is your vision blurry at night?",
        "Do you adjust distance to see clearly?",
      ],
    },
    results: {
      title: "Your Results",
      primary_normal: "Your vision appears stable based on this screening.",
      primary_changed:
        "Your results suggest your vision may have changed since your last check.",
      urgency: {
        urgent_title: "Urgent Medical Attention Recommended",
        urgent_desc:
          "Based on the grid test, we recommend seeking medical attention from an eye care professional as soon as possible.",
        attention_title: "Eye Exam Recommended",
        attention_desc:
          "We detected some changes in your vision. Consider scheduling a comprehensive eye exam.",
        monitor_title: "Monitor Your Vision",
        monitor_desc:
          "Mild indicators detected. Try following the recommendations below and re-test in a few weeks.",
        normal_title: "No Significant Changes Detected",
        normal_desc: "Keep up the good habits to maintain your eye health.",
      },
      indicators: "Detected Indicators",
      strain_label: "Eye strain level: {level}",
      strain_levels: { Low: "Low", Medium: "Medium", High: "High" },
      habits_title: "Healthy Habits & Recommendations",
      habits: [
        "Follow the 20-20-20 rule: Every 20 mins, look 20 feet away for 20 secs.",
        "Maintain proper room lighting.",
        "Keep screen distance between 50–70 cm.",
        "Reduce screen brightness and consider blue light filters.",
        "Blink regularly and stay hydrated to prevent dry eyes.",
      ],
      disclaimer_label: "Disclaimer:",
      disclaimer_text:
        "This app is not a medical diagnosis tool. Results are approximate and may be affected by screen size, resolution, and testing conditions. For accurate evaluation, consult an eye care professional.",
      start_over: "Start Over",
      issues: {
        retinal: "Possible retinal distortion detected",
        distance: "Distance clarity loss detected",
        difference: "Significant difference between left and right eye",
        astigmatism: "Signs of astigmatism (uneven focus)",
        contrast: "Low contrast sensitivity",
        strain_high: "High eye strain level",
      },
      risk_section: "Risk Profile by Condition",
      risk_labels: { myopia: "Myopia", astigmatism: "Astigmatism", presbyopia: "Presbyopia" },
      age_insights_title: "Age-Based Insights",
      age_groups: {
        child: "Children (0–12)",
        teen: "Teens & Young Adults (13–39)",
        mature: "Adults (40–60)",
        senior: "Seniors (60+)",
      },
      age_insights: {
        child:
          "In childhood, refractive errors are common. Regular screenings help detect myopia/astigmatism early.",
        teen:
          "Under 40, screen use can drive myopia progression. Maintain healthy visual habits and regular checks.",
        mature:
          "After 40, presbyopia emerges universally. Reading aid and balanced lighting improve near vision.",
        senior:
          "Presbyopia stabilizes; monitor cataract/glaucoma risks and maintain comprehensive eye exams.",
      },
    },
  },
  pt: {
    age: {
      title: "Qual é a sua idade?",
      description:
        "A idade é importante para entender sua linha de base de visão e avaliar riscos como presbiopia.",
      placeholder: "ex.: 35",
      continue: "Continuar",
    },
    glasses: {
      title: "Você usa óculos ou lentes de contato?",
      description:
        "Precisamos saber para orientar corretamente os testes de acuidade visual.",
      yes: "Sim, uso",
      no: "Não uso",
    },
    astig: {
      badge: "Teste 2 de 4: Astigmatismo",
      title: "Verificação de Astigmatismo",
      look: "Olhe para o círculo de linhas abaixo.",
      question:
        "Algumas linhas parecem mais escuras, nítidas ou claras do que outras?",
      yes: "Sim, algumas são mais escuras",
      no: "Não, todas parecem iguais",
    },
    contrast: {
      badge: "Teste 3 de 4: Contraste",
      title: "Sensibilidade ao Contraste",
      instruction: "Leia as letras conforme elas ficam mais fracas.",
      question: "Você consegue distinguir essas letras?",
      yes: "Sim",
      no: "Não, muito fracas",
    },
    amsler: {
      badge: "Teste 4 de 4: Grade de Amsler",
      title: "Verificação da Retina",
      instruction: "Foque no ponto central abaixo.",
      question:
        "Enquanto olha para o ponto central, alguma linha parece ondulada, distorcida ou faltando?",
      yes: "Sim, algumas estão onduladas/faltando",
      no: "Não, todas retas",
    },
    questionnaire: {
      badge: "Etapa Final: Questionário",
      title: "Verificação de Cansaço Ocular",
      progress: "Pergunta {n} de {total}",
      yes: "Sim",
      no: "Não",
      questions: [
        "Você costuma semicerrar os olhos?",
        "Você sente dores de cabeça após usar telas?",
        "Sua visão fica embaçada à noite?",
        "Você ajusta a distância para enxergar melhor?",
      ],
    },
    results: {
      title: "Seus Resultados",
      primary_normal:
        "Sua visão parece estável com base nesta triagem.",
      primary_changed:
        "Seus resultados sugerem que sua visão pode ter mudado desde sua última avaliação.",
      urgency: {
        urgent_title: "Atenção Médica Imediata Recomendada",
        urgent_desc:
          "Com base no teste da grade, recomendamos procurar um profissional de saúde ocular o quanto antes.",
        attention_title: "Exame Oftalmológico Recomendado",
        attention_desc:
          "Detectamos algumas mudanças na sua visão. Considere agendar um exame completo.",
        monitor_title: "Monitore Sua Visão",
        monitor_desc:
          "Indicadores leves detectados. Siga as recomendações abaixo e refaça o teste em algumas semanas.",
        normal_title: "Nenhuma Mudança Significativa Detectada",
        normal_desc:
          "Mantenha bons hábitos para preservar a saúde dos seus olhos.",
      },
      indicators: "Indicadores Detectados",
      strain_label: "Nível de cansaço ocular: {level}",
      strain_levels: { Low: "Baixo", Medium: "Médio", High: "Alto" },
      habits_title: "Hábitos Saudáveis e Recomendações",
      habits: [
        "Regra 20-20-20: A cada 20 min, olhe a 20 pés por 20 seg.",
        "Mantenha a iluminação adequada no ambiente.",
        "Mantenha distância da tela entre 50–70 cm.",
        "Reduza o brilho da tela e considere filtros de luz azul.",
        "Piscar com frequência e hidratar-se para evitar olhos secos.",
      ],
      disclaimer_label: "Aviso:",
      disclaimer_text:
        "Este app não é uma ferramenta de diagnóstico médico. Os resultados são aproximados e podem ser afetados por tamanho de tela, resolução e condições do teste. Para avaliação precisa, consulte um profissional.",
      start_over: "Recomeçar",
      issues: {
        retinal: "Possível distorção retiniana detectada",
        distance: "Perda de clareza à distância detectada",
        difference: "Diferença significativa entre olho esquerdo e direito",
        astigmatism: "Sinais de astigmatismo (foco irregular)",
        contrast: "Baixa sensibilidade ao contraste",
        strain_high: "Alto nível de cansaço ocular",
      },
      risk_section: "Perfil de Risco por Condição",
      risk_labels: { myopia: "Miopia", astigmatism: "Astigmatismo", presbyopia: "Presbiopia" },
      age_insights_title: "Insights por Idade",
      age_groups: {
        child: "Crianças (0–12)",
        teen: "Adolescentes e Adultos Jovens (13–39)",
        mature: "Adultos (40–60)",
        senior: "Idosos (60+)",
      },
      age_insights: {
        child:
          "Na infância, erros refrativos são comuns. Triagens regulares ajudam a detectar miopia/astigmatismo cedo.",
        teen:
          "Abaixo de 40, o uso de telas pode favorecer a progressão da miopia. Mantenha hábitos visuais saudáveis.",
        mature:
          "Após os 40, a presbiopia é universal. Óculos para leitura e iluminação adequada melhoram a visão de perto.",
        senior:
          "A presbiopia estabiliza; monitore riscos de catarata/glaucoma e mantenha exames oftalmológicos completos.",
      },
    },
  },
} as const;

export function t(lang: Lang, key: string, params?: Record<string, string | number>) {
  const parts = key.split(".");
  let cur: any = translations[lang];
  for (const p of parts) {
    if (cur == null) break;
    cur = cur[p];
  }
  let str = typeof cur === "string" ? cur : "";
  if (params && str) {
    Object.entries(params).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
  }
  return str;
}

export function getQuestions(lang: Lang) {
  return translations[lang].questionnaire.questions;
}

export function getHabits(lang: Lang) {
  return translations[lang].results.habits;
}

export function strainLevelLabel(lang: Lang, level: "Low" | "Medium" | "High") {
  return translations[lang].results.strain_levels[level];
}
