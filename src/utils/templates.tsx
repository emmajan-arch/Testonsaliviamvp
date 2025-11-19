// Templates de protocoles pré-configurés

export interface DemographicQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'number';
  options?: string[];
  required: boolean;
}

export interface Metric {
  id: string;
  label: string;
  type: 'scale_1_10';
  isStandard: boolean;
}

export interface Task {
  id: string;
  order: number;
  title: string;
  scenario: string;
  type: 'exploratoire' | 'objectif';
  durationExpectedMinutes: number;
  metricsToCollect: string[];
}

export interface PostTestQuestion {
  id: string;
  question: string;
  type: 'text' | 'scale_1_10';
}

export interface ProtocolTemplate {
  name: string;
  description: string;
  demographicQuestions: DemographicQuestion[];
  metrics: Metric[];
  tasks: Task[];
  postTestQuestions: PostTestQuestion[];
}

export const TEMPLATES: Record<string, ProtocolTemplate> = {
  ai_conversational: {
    name: "Assistant IA Conversationnel",
    description: "Pour tester un chatbot ou assistant IA (basé sur le protocole Alivia)",
    demographicQuestions: [
      {
        id: "dept",
        question: "Département",
        type: "select",
        options: ["RH", "Finance", "Tech", "Marketing", "Autre"],
        required: true
      },
      {
        id: "ai_experience",
        question: "Expérience avec l'IA générative (ChatGPT, Gemini, etc.)",
        type: "select",
        options: ["Jamais utilisé", "Occasionnellement (quelques fois)", "Régulièrement (plusieurs fois par semaine)"],
        required: true
      },
      {
        id: "product_frequency",
        question: "Fréquence d'utilisation du produit testé",
        type: "select",
        options: ["Jamais", "1-2 fois", "3-5 fois", "Plus de 5 fois"],
        required: false
      }
    ],
    metrics: [
      { id: "ease", label: "Facilité", type: "scale_1_10", isStandard: true },
      { id: "trust", label: "Confiance dans les réponses", type: "scale_1_10", isStandard: false },
      { id: "fluidity", label: "Fluidité", type: "scale_1_10", isStandard: false },
      { id: "autonomy", label: "Autonomie", type: "scale_1_10", isStandard: false },
      { id: "satisfaction", label: "Satisfaction", type: "scale_1_10", isStandard: false }
    ],
    tasks: [
      {
        id: "task_1",
        order: 1,
        title: "Découverte libre de l'interface",
        scenario: "Vous arrivez pour la première fois sur l'application. Prenez quelques minutes pour explorer l'interface librement et partagez vos premières impressions à voix haute.",
        type: "exploratoire",
        durationExpectedMinutes: 3,
        metricsToCollect: ["ease"]
      },
      {
        id: "task_2",
        order: 2,
        title: "Recherche d'un document ou information",
        scenario: "Imaginez que vous cherchez une information spécifique dans votre base de connaissances. Essayez de la trouver en utilisant l'assistant.",
        type: "objectif",
        durationExpectedMinutes: 5,
        metricsToCollect: ["ease", "trust"]
      },
      {
        id: "task_3",
        order: 3,
        title: "Vérification des sources",
        scenario: "Après avoir obtenu une réponse, vérifiez d'où proviennent les informations fournies par l'assistant.",
        type: "objectif",
        durationExpectedMinutes: 3,
        metricsToCollect: ["ease", "trust"]
      },
      {
        id: "task_4",
        order: 4,
        title: "Reformulation d'une question",
        scenario: "Si la première réponse ne vous satisfait pas, essayez de reformuler votre question pour obtenir une meilleure réponse.",
        type: "exploratoire",
        durationExpectedMinutes: 4,
        metricsToCollect: ["fluidity", "autonomy"]
      },
      {
        id: "task_5",
        order: 5,
        title: "Utilisation de l'historique",
        scenario: "Retrouvez une conversation précédente dans l'historique et reprenez-la.",
        type: "objectif",
        durationExpectedMinutes: 3,
        metricsToCollect: ["ease"]
      },
      {
        id: "task_6",
        order: 6,
        title: "Évaluation de la pertinence",
        scenario: "Posez une question complexe et évaluez si la réponse fournie est pertinente et complète.",
        type: "exploratoire",
        durationExpectedMinutes: 5,
        metricsToCollect: ["trust", "satisfaction"]
      },
      {
        id: "task_7",
        order: 7,
        title: "Gestion d'une erreur",
        scenario: "Essayez de poser une question hors sujet ou mal formulée. Observez comment l'assistant réagit.",
        type: "exploratoire",
        durationExpectedMinutes: 3,
        metricsToCollect: ["fluidity", "satisfaction"]
      },
      {
        id: "task_8",
        order: 8,
        title: "Comparaison avec d'autres outils",
        scenario: "Pensez à d'autres assistants IA que vous avez utilisés. Qu'est-ce qui est différent ici ?",
        type: "exploratoire",
        durationExpectedMinutes: 3,
        metricsToCollect: ["satisfaction"]
      },
      {
        id: "task_9",
        order: 9,
        title: "Scénario réel d'utilisation",
        scenario: "Imaginez un cas d'usage réel de votre quotidien professionnel et essayez de le résoudre avec l'assistant.",
        type: "objectif",
        durationExpectedMinutes: 7,
        metricsToCollect: ["ease", "trust", "fluidity", "autonomy", "satisfaction"]
      }
    ],
    postTestQuestions: [
      {
        id: "ptq_1",
        question: "Utiliseriez-vous cet assistant IA dans votre travail quotidien ?",
        type: "scale_1_10"
      },
      {
        id: "ptq_2",
        question: "Qu'avez-vous le plus apprécié ?",
        type: "text"
      },
      {
        id: "ptq_3",
        question: "Qu'avez-vous trouvé le plus frustrant ou difficile ?",
        type: "text"
      }
    ]
  },

  navigation_architecture: {
    name: "Navigation & Architecture d'information",
    description: "Pour tester la clarté de navigation d'un site web ou application",
    demographicQuestions: [
      {
        id: "role",
        question: "Rôle",
        type: "select",
        options: ["Designer", "Développeur", "Product Manager", "Utilisateur final", "Autre"],
        required: true
      },
      {
        id: "web_experience",
        question: "Niveau d'aisance avec les interfaces web",
        type: "select",
        options: ["Débutant", "Intermédiaire", "Avancé"],
        required: true
      }
    ],
    metrics: [
      { id: "ease", label: "Facilité", type: "scale_1_10", isStandard: true },
      { id: "search_time", label: "Temps de recherche ressenti", type: "scale_1_10", isStandard: false }
    ],
    tasks: [
      {
        id: "task_1",
        order: 1,
        title: "Première impression",
        scenario: "Arrivez sur la page d'accueil et décrivez ce que vous voyez. Qu'est-ce que ce site/application propose ?",
        type: "exploratoire",
        durationExpectedMinutes: 2,
        metricsToCollect: []
      },
      {
        id: "task_2",
        order: 2,
        title: "Trouver la page Contact",
        scenario: "Vous souhaitez contacter l'équipe. Trouvez comment le faire.",
        type: "objectif",
        durationExpectedMinutes: 2,
        metricsToCollect: ["ease", "search_time"]
      },
      {
        id: "task_3",
        order: 3,
        title: "Accéder à la documentation",
        scenario: "Trouvez la documentation ou les ressources d'aide.",
        type: "objectif",
        durationExpectedMinutes: 2,
        metricsToCollect: ["ease", "search_time"]
      },
      {
        id: "task_4",
        order: 4,
        title: "Navigation dans les catégories",
        scenario: "Explorez les différentes sections du site. La structure est-elle logique ?",
        type: "exploratoire",
        durationExpectedMinutes: 4,
        metricsToCollect: ["ease"]
      },
      {
        id: "task_5",
        order: 5,
        title: "Retour à la page d'accueil",
        scenario: "Vous êtes perdu dans le site. Retournez à la page d'accueil.",
        type: "objectif",
        durationExpectedMinutes: 1,
        metricsToCollect: ["ease"]
      }
    ],
    postTestQuestions: [
      {
        id: "ptq_1",
        question: "La navigation était-elle intuitive ?",
        type: "scale_1_10"
      },
      {
        id: "ptq_2",
        question: "Qu'est-ce qui pourrait être amélioré dans l'organisation du contenu ?",
        type: "text"
      }
    ]
  },

  onboarding: {
    name: "Parcours d'onboarding",
    description: "Pour tester la première utilisation et la prise en main d'un produit",
    demographicQuestions: [
      {
        id: "similar_products",
        question: "Avez-vous déjà utilisé des produits similaires ?",
        type: "select",
        options: ["Oui, régulièrement", "Oui, occasionnellement", "Non, jamais"],
        required: true
      }
    ],
    metrics: [
      { id: "ease", label: "Facilité", type: "scale_1_10", isStandard: true },
      { id: "satisfaction", label: "Satisfaction", type: "scale_1_10", isStandard: false }
    ],
    tasks: [
      {
        id: "task_1",
        order: 1,
        title: "Créer un compte",
        scenario: "Créez un nouveau compte sur la plateforme.",
        type: "objectif",
        durationExpectedMinutes: 3,
        metricsToCollect: ["ease"]
      },
      {
        id: "task_2",
        order: 2,
        title: "Compléter le profil",
        scenario: "Remplissez les informations de votre profil.",
        type: "objectif",
        durationExpectedMinutes: 4,
        metricsToCollect: ["ease"]
      },
      {
        id: "task_3",
        order: 3,
        title: "Découvrir le tableau de bord",
        scenario: "Explorez le tableau de bord principal. Que pouvez-vous faire ici ?",
        type: "exploratoire",
        durationExpectedMinutes: 3,
        metricsToCollect: ["satisfaction"]
      },
      {
        id: "task_4",
        order: 4,
        title: "Première action",
        scenario: "Effectuez l'action principale du produit (créer un projet, envoyer un message, etc.).",
        type: "objectif",
        durationExpectedMinutes: 5,
        metricsToCollect: ["ease", "satisfaction"]
      }
    ],
    postTestQuestions: [
      {
        id: "ptq_1",
        question: "Vous sentez-vous prêt à utiliser ce produit de manière autonome ?",
        type: "scale_1_10"
      },
      {
        id: "ptq_2",
        question: "Qu'est-ce qui vous a aidé pendant la prise en main ?",
        type: "text"
      },
      {
        id: "ptq_3",
        question: "Qu'est-ce qui vous a bloqué ou ralenti ?",
        type: "text"
      }
    ]
  },

  blank: {
    name: "Projet vierge",
    description: "Partir de zéro et configurer votre propre protocole",
    demographicQuestions: [],
    metrics: [
      { id: "ease", label: "Facilité", type: "scale_1_10", isStandard: true }
    ],
    tasks: [],
    postTestQuestions: []
  }
};
