// Interface text, in Russian. Content (questions, answers) is localised by the
// backend according to the selected language; these are the chrome strings.

/** Russian plural for a count: 1 вопрос, 2 вопроса, 5 вопросов. */
function plural(count: number, one: string, few: string, many: string): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const UI = {
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
  mistakesEmpty: "Пока нет ошибок",
  topicsSection: "Темы",
  questions: "вопросов",
  start: "Начать",
  best: "Лучший результат",

  // Quiz
  question: "Вопрос",
  finish: "Завершить",
  finishing: "Завершение…",
  next: "Далее",
  correct: "Верно",
  wrong: "Неверно",
  explanation: "Пояснение",
  situation: "Ситуация",
  answeredOf: (answered: number, total: number) => `Отвечено ${answered} из ${total}`,
  finishHint: "Завершить можно в любой момент — вопросы без ответа засчитываются как неверные",
  timeLeft: "Осталось",
  timeIsUp: "Время вышло",
  confirmFinishTitle: "Завершить тест?",
  confirmFinishText: (unanswered: number) =>
    `${unanswered} ${plural(unanswered, "вопрос остался", "вопроса остались", "вопросов остались")} без ответа и будут засчитаны как неверные.`,
  resumeNotice: "Вы вернулись к незаконченному тесту",

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
  remove: "Удалить",
  confirmRemove: "Удалить безвозвратно?",
  credentialsIssued: "Аккаунт создан — передайте данные студенту",
  extendDays: "Продлить (дней)",
  nothingFound: "Ничего не найдено",
  lastLogin: "Последний вход",
  never: "Не входил",

  // Generic
  loading: "Загрузка…",
  error: "Что-то пошло не так",
  retryAction: "Повторить",
} as const;
