// Interface text in both languages.
//
// Content — questions, answers, explanations — is localised by the backend
// according to the requested language. These are the chrome strings around it,
// and they have to switch with the same toggle, otherwise the switcher only
// half works.
//
// Both dictionaries are typed against the Russian one, so a key added to RU
// without a Kazakh counterpart is a compile error rather than a Russian word
// appearing on a Kazakh screen.

import type { Language } from "@/types/api";

/** Russian plural for a count: 1 вопрос, 2 вопроса, 5 вопросов. */
function pluralRu(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

const RU = {
  appName: "ПДД",
  tagline: "Онлайн подготовка к экзамену",

  // Auth
  signIn: "Войти",
  signingIn: "Вход…",
  signOut: "Выйти",
  iin: "ИИН",
  password: "Пароль",
  iinPlaceholder: "12 цифр",
  showPassword: "Показать пароль",
  hidePassword: "Скрыть пароль",
  loginHint: "Логин и пароль выдаёт учебный центр",

  // Navigation
  topics: "Темы",
  history: "Мои результаты",
  students: "Студенты",
  managers: "Менеджеры",
  back: "Назад",

  // Catalogue
  modes: "Режимы",
  startNewTest: "Начать новое тестирование",
  startTest: "Начать тестирование",
  exam: "40 вопросов (аналогично СпецЦОН)",
  examHint: "40 минут на 40 вопросов, как на реальном экзамене",
  training: "В режиме обучения",
  trainingHint: "40 вопросов без ограничения по времени",
  mistakes: "Работа над ошибками",
  mistakesHint: "Вопросы, где вы ошибались",
  pickTopicsHint:
    "Отметьте несколько тем — из них соберётся тест до 40 вопросов",
  partsCount: (count: number) =>
    `${count} ${pluralRu(count, "часть", "части", "частей")}`,
  choosePart: "Выберите часть:",
  topicsPicked: (count: number) =>
    `Выбрано ${count} ${pluralRu(count, "тема", "темы", "тем")}`,
  pickedRunHint: "до 40 случайных вопросов",
  startPicked: "Начать по выбранным",
  clearPicked: "Сбросить",
  mistakesEmpty: "Пока нет ошибок",
  topicsSection: "Темы",
  questions: "вопросов",
  start: "Начать",
  best: "Лучший результат",
  resume: "Продолжить",

  // Quiz
  question: "Вопрос",
  finish: "Завершить",
  finishing: "Завершение…",
  next: "Далее",
  correct: "Верно",
  wrong: "Неверно",
  answerRecorded: "Ответ записан",
  explanation: "Пояснение",
  situation: "Ситуация",
  replay: "Повторить",
  answeredOf: (answered: number, total: number) =>
    `Отвечено ${answered} из ${total}`,
  finishHint:
    "Завершить можно в любой момент — вопросы без ответа засчитываются как неверные",
  timeLeft: "Осталось",
  timeIsUp: "Время вышло",
  confirmFinishTitle: "Завершить тест?",
  confirmFinishText: (unanswered: number) =>
    `${unanswered} ${pluralRu(
      unanswered,
      "вопрос остался",
      "вопроса остались",
      "вопросов остались",
    )} без ответа и будут засчитаны как неверные.`,
  resumeNotice: "Вы вернулись к незаконченному тесту",
  noActiveTest: "Нет активного теста",

  // Result
  passed: "Тест сдан",
  failed: "Тест не сдан",
  correctAnswers: "Правильных ответов",
  time: "Время",
  retry: "Пройти заново",
  toTopics: "К темам",
  review: "Разбор теста",
  mistakesList: "Разбор ошибок",
  showAll: "Все вопросы",
  showMistakes: "Только ошибки",
  noMistakes: "Ошибок нет",
  yourAnswer: "Ваш ответ",
  correctAnswer: "Правильный ответ",
  noAnswer: "Без ответа",
  emptyHistory: "Вы ещё не проходили тесты",

  // Staff
  createStudent: "Создать студента",
  createManager: "Создать менеджера",
  name: "Имя",
  surname: "Фамилия",
  phone: "Телефон",
  category: "Категория",
  status: "Статус",
  accessDays: "Срок доступа (дней)",
  accessUntil: "Доступ до",
  daysLeft: "Осталось",
  note: "Заметка",
  search: "Поиск по имени, ИИН или телефону",
  save: "Сохранить",
  saving: "Сохранение…",
  cancel: "Отмена",
  edit: "Изменить",
  editStudent: "Изменить студента",
  open: "Открыть",
  studentDetails: "Данные студента",
  accessFrom: "Доступ с",
  createdAt: "Создан",
  passwordUnchanged: "Оставьте пустым, чтобы не менять",
  remove: "Удалить",
  confirmRemove: "Удалить безвозвратно?",
  credentialsIssued: "Аккаунт создан — передайте данные студенту",
  extendDays: "На сколько дней продлить",
  extend: "Продлить",
  extendAccess: "Продление доступа",
  newExpiry: "Новая дата окончания",
  accessLapsed: "срок истёк",
  nothingFound: "Ничего не найдено",
  lastLogin: "Последний вход",
  never: "Не входил",
  days: (count: number) =>
    `${count} ${pluralRu(count, "день", "дня", "дней")}`,

  // Appearance
  switchToDark: "Тёмная тема",
  switchToLight: "Светлая тема",

  // Generic
  loading: "Загрузка…",
  error: "Что-то пошло не так",
  retryAction: "Повторить",
};

/** Every dictionary must answer for the same keys, with the same shapes. */
type Strings = typeof RU;

// Kazakh has no three-form plural agreement: a number is simply followed by
// the singular noun, so no helper is needed here.
const KZ: Strings = {
  appName: "ЖҚЕ",
  tagline: "Емтиханға онлайн дайындық",

  // Auth
  signIn: "Кіру",
  signingIn: "Кіру…",
  signOut: "Шығу",
  iin: "ЖСН",
  password: "Құпия сөз",
  iinPlaceholder: "12 сан",
  showPassword: "Құпия сөзді көрсету",
  hidePassword: "Құпия сөзді жасыру",
  loginHint: "Логин мен құпия сөзді оқу орталығы береді",

  // Navigation
  topics: "Тақырыптар",
  history: "Менің нәтижелерім",
  students: "Студенттер",
  managers: "Менеджерлер",
  back: "Артқа",

  // Catalogue
  modes: "Режимдер",
  startNewTest: "Жаңа тестілеуді бастау",
  startTest: "Тестілеуді бастау",
  exam: "40 сұрақ (АХҚО сияқты)",
  examHint: "Нақты емтихандағыдай — 40 сұраққа 40 минут",
  training: "Оқу режимінде",
  trainingHint: "Уақыт шектеусіз 40 сұрақ",
  mistakes: "Қателермен жұмыс",
  mistakesHint: "Сіз қателескен сұрақтар",
  pickTopicsHint:
    "Бірнеше тақырыпты белгілеңіз — олардан 40 сұраққа дейін тест жиналады",
  partsCount: (count: number) => `${count} бөлім`,
  choosePart: "Бөлімді таңдаңыз:",
  topicsPicked: (count: number) => `${count} тақырып таңдалды`,
  pickedRunHint: "40-қа дейін кездейсоқ сұрақ",
  startPicked: "Таңдалғандар бойынша бастау",
  clearPicked: "Тазалау",
  mistakesEmpty: "Әзірге қате жоқ",
  topicsSection: "Тақырыптар",
  questions: "сұрақ",
  start: "Бастау",
  best: "Үздік нәтиже",
  resume: "Жалғастыру",

  // Quiz
  question: "Сұрақ",
  finish: "Аяқтау",
  finishing: "Аяқталуда…",
  next: "Келесі",
  correct: "Дұрыс",
  wrong: "Қате",
  answerRecorded: "Жауап жазылды",
  explanation: "Түсіндірме",
  situation: "Жағдай",
  replay: "Қайталау",
  answeredOf: (answered: number, total: number) =>
    `${total} сұрақтың ${answered} жауап берілді`,
  finishHint:
    "Кез келген уақытта аяқтауға болады — жауапсыз сұрақтар қате деп есептеледі",
  timeLeft: "Қалды",
  timeIsUp: "Уақыт бітті",
  confirmFinishTitle: "Тестті аяқтайсыз ба?",
  confirmFinishText: (unanswered: number) =>
    `${unanswered} сұрақ жауапсыз қалды және қате деп есептеледі.`,
  resumeNotice: "Сіз аяқталмаған тестке оралдыңыз",
  noActiveTest: "Белсенді тест жоқ",

  // Result
  passed: "Тест тапсырылды",
  failed: "Тест тапсырылмады",
  correctAnswers: "Дұрыс жауаптар",
  time: "Уақыт",
  retry: "Қайта өту",
  toTopics: "Тақырыптарға",
  review: "Тест талдауы",
  mistakesList: "Қателерді талдау",
  showAll: "Барлық сұрақтар",
  showMistakes: "Тек қателер",
  noMistakes: "Қате жоқ",
  yourAnswer: "Сіздің жауабыңыз",
  correctAnswer: "Дұрыс жауап",
  noAnswer: "Жауапсыз",
  emptyHistory: "Сіз әлі тест тапсырған жоқсыз",

  // Staff
  createStudent: "Студент құру",
  createManager: "Менеджер құру",
  name: "Аты",
  surname: "Тегі",
  phone: "Телефон",
  category: "Санат",
  status: "Мәртебе",
  accessDays: "Қолжетімділік мерзімі (күн)",
  accessUntil: "Қолжетімділік мерзімі",
  daysLeft: "Қалды",
  note: "Ескертпе",
  search: "Аты, ЖСН немесе телефон бойынша іздеу",
  save: "Сақтау",
  saving: "Сақталуда…",
  cancel: "Болдырмау",
  edit: "Өзгерту",
  editStudent: "Студентті өзгерту",
  open: "Ашу",
  studentDetails: "Студент деректері",
  accessFrom: "Қолжетімділік басталды",
  createdAt: "Құрылды",
  passwordUnchanged: "Өзгертпеу үшін бос қалдырыңыз",
  remove: "Жою",
  confirmRemove: "Қайтарымсыз жою керек пе?",
  credentialsIssued: "Аккаунт құрылды — деректерді студентке беріңіз",
  extendDays: "Неше күнге ұзарту керек",
  extend: "Ұзарту",
  extendAccess: "Қолжетімділікті ұзарту",
  newExpiry: "Жаңа аяқталу күні",
  accessLapsed: "мерзімі бітті",
  nothingFound: "Ештеңе табылмады",
  lastLogin: "Соңғы кіру",
  never: "Кірмеген",
  days: (count: number) => `${count} күн`,

  // Appearance
  switchToDark: "Қараңғы тақырып",
  switchToLight: "Жарық тақырып",

  // Generic
  loading: "Жүктелуде…",
  error: "Бірдеңе дұрыс болмады",
  retryAction: "Қайталау",
};

const DICTIONARIES: Record<Language, Strings> = { ru: RU, kz: KZ };

/** The dictionary for a language. */
export function strings(language: Language): Strings {
  return DICTIONARIES[language] ?? RU;
}

export type { Strings };
