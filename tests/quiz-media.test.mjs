// API and media are fixtures: these tests never log in or change real scores.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { chromium, webkit } from "playwright";

const baseURL = process.env.PDD_TEST_URL || "http://127.0.0.1:5173";
let browser;
before(async () => {
  const engine = process.env.PDD_BROWSER === "webkit" ? webkit : chromium;
  browser = await engine.launch({
    channel: engine === chromium ? process.env.PDD_BROWSER_CHANNEL : undefined,
  });
  if (process.env.PDD_SCREENSHOT_DIR) {
    await mkdir(process.env.PDD_SCREENSHOT_DIR, { recursive: true });
  }
});
after(async () => { await browser?.close(); });

const media = (url) => ({ url, kind: "situation", byte_size: 0 });

async function setup(options, { questionCount = 40, longText = false } = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    localStorage.setItem("pdd.access_token", "fixture-only");
    localStorage.setItem("pdd.language", "ru");
    window.pausedClips = [];
    const pause = HTMLMediaElement.prototype.pause;
    HTMLMediaElement.prototype.pause = function () {
      window.pausedClips.push(this.querySelector("source")?.getAttribute("src"));
      return pause.call(this);
    };
  });
  const page = await context.newPage();
  const questions = Array.from({ length: questionCount }, (_, index) => index + 1).map((id) => ({
    id, text: longText
      ? `Question ${id}: С какой максимальной скоростью Вам разрешено продолжить движение легкового автомобиля после проезда данного дорожного знака?`
      : `Question ${id}`, image: null,
    situation_video: media("/situation.mp4"),
    explanation: null, explanation_video: null, is_exam_only: false,
    answers: [
      { id: id * 10 + 1, text: "Answer A", is_correct: null },
      { id: id * 10 + 2, text: "Answer B", is_correct: null },
    ],
  }));
  const session = {
    id: 123, mode: { value: "topic", label: "Topic" },
    status: { value: "in_progress", label: "Active" },
    language: "ru", topic_id: 1, title: "Fixture",
    started_at: "2026-01-01T00:00:00Z", total_questions: questionCount,
    answered_count: 0, correct_count: 0, can_finish: false,
    min_answers_to_finish: 1, time_limit_seconds: null, seconds_left: null,
    current_position: 0, reveals_answers: true, questions,
    items: questions.map((q, position) => ({
      question_id: q.id, position, is_answered: false,
      is_correct: null, answer_id: null,
    })),
  };
  // Assert mounted players and URLs, not third-party video availability.
  await page.route("**/*.mp4", (route) => route.fulfill({
    contentType: "video/mp4", body: Buffer.alloc(0),
  }));
  await page.route("**/api/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let data;
    if (path.endsWith("/auth/me")) {
      data = {
        id: 100, full_name: "Тестовый Студент",
        role: { value: "student", label: "Студент" },
        student: {
          category: { value: "B", label: "B" },
          status: { value: "active", label: "Active" }, days_left: 30,
        },
      };
    } else if (path.endsWith("/quiz/active")) {
      data = session;
    } else if (path.endsWith("/answers")) {
      const body = route.request().postDataJSON();
      const q = questions.find((item) => item.id === body.question_id);
      const item = session.items.find((item) => item.question_id === q.id);
      item.is_answered = true;
      item.answer_id = body.answer_id;
      item.is_correct = body.answer_id === q.id * 10 + 1;
      session.answered_count++;
      session.can_finish = true;
      q.explanation = `Explanation ${q.id}`;
      q.explanation_video = media(`/explanation-${q.id}.mp4`);
      q.answers.forEach((a) => { a.is_correct = a.id === q.id * 10 + 1; });
      data = {
        is_correct: item.is_correct, correct_answer_id: q.id * 10 + 1,
        explanation: q.explanation, explanation_video_url: q.explanation_video.url,
        can_finish: true, answered_count: session.answered_count, reveals_answer: true,
      };
    } else {
      throw new Error(`Unexpected API: ${path}`);
    }
    await route.fulfill({ json: data });
  });
  await page.goto(`${baseURL}/quiz`);
  await page.getByRole("heading", { name: questions[0].text, exact: true }).waitFor();
  return { context, page };
}

for (const width of [320, 375, 390, 430]) {
  test(`39-question quiz fits ${width}px; only the number strip scrolls`, async () => {
    const { context, page } = await setup({
      viewport: { width, height: 844 },
      screen: { width, height: 844 }, hasTouch: true, isMobile: true,
    }, { questionCount: 39, longText: true });
    try {
      const sizes = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
        quiz: document.querySelector(".quiz").getBoundingClientRect().width,
        chips: document.querySelector(".chips").clientWidth,
        chipContent: document.querySelector(".chips").scrollWidth,
      }));
      if (process.env.PDD_SCREENSHOT_DIR) {
        await page.screenshot({
          path: join(process.env.PDD_SCREENSHOT_DIR, `phone-${width}.png`), fullPage: true,
        });
      }
      assert(sizes.document <= sizes.viewport + 1, JSON.stringify(sizes));
      assert(sizes.chipContent > sizes.chips, "question strip must scroll internally");
      // Reach a question outside the initial viewport without moving the page.
      await page.locator(".chips button").last().scrollIntoViewIfNeeded();
      await page.locator(".chips button").last().click();
      await page.getByRole("heading", { name: /^Question 39:/ }).waitFor();
      assert.equal(await page.evaluate(() => window.scrollX), 0);
      await page.getByRole("button", { name: /Answer A/ }).click();
      await page.getByText("Explanation 39", { exact: true }).waitFor();
      assert(await page.evaluate(() =>
        document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      ), "answered question must still fit");
    } finally {
      await context.close();
    }
  });
}

const cases = [
  { name: "phone portrait", width: 390, height: 844, phone: true, touch: true },
  { name: "phone landscape", width: 844, height: 390, phone: true, touch: true },
  { name: "large phone landscape", width: 932, height: 430, phone: true, touch: true },
  { name: "phone with wide layout viewport", width: 980, height: 1700,
    screen: { width: 390, height: 844 }, phone: true, touch: true },
  { name: "tablet portrait", width: 768, height: 1024, phone: false, touch: true },
  { name: "tablet landscape", width: 1024, height: 768, phone: false, touch: true },
  { name: "laptop", width: 1366, height: 768, phone: false, touch: false },
  { name: "desktop", width: 1920, height: 1080, phone: false, touch: false },
];

for (const scenario of cases) {
  test(`${scenario.name}: answer → next → revisit → reload`, async () => {
    const { width, height, touch, phone } = scenario;
    const { context, page } = await setup({
      viewport: { width, height }, screen: scenario.screen || { width, height },
      hasTouch: touch, isMobile: touch,
    });
    try {
      const sources = () => page.locator(".media video source").evaluateAll(
        (elements) => elements.map((element) => element.getAttribute("src")),
      );
      const expected = (id) => phone
        ? [`/explanation-${id}.mp4`]
        : ["/situation.mp4", `/explanation-${id}.mp4`];
      assert.deepEqual(await sources(), ["/situation.mp4"]);
      await page.getByRole("button", { name: /Answer A/ }).click();
      await page.getByRole("button", { name: "Далее", exact: true }).waitFor();
      assert.deepEqual(await sources(), expected(1));
      if (phone) {
        assert(await page.evaluate(() => window.pausedClips.includes("/situation.mp4")));
        const columns = await page.locator(".quiz__body").evaluate(
          (element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
        );
        assert.equal(columns, 1, "phone must not use laptop columns");
      }
      if (scenario.name === "phone portrait") {
        await page.setViewportSize({ width: 844, height: 390 });
        assert.deepEqual(await sources(), expected(1), "rotation keeps one player");
        await page.setViewportSize({ width, height });
      }
      await page.getByRole("button", { name: "Далее", exact: true }).click();
      await page.getByRole("heading", { name: "Question 2" }).waitFor();
      assert.deepEqual(await sources(), ["/situation.mp4"]);
      await page.getByRole("button", { name: /Answer B/ }).click();
      await page.getByRole("button", { name: "Далее", exact: true }).waitFor();
      assert.deepEqual(await sources(), expected(2), "wrong answer also reveals video");
      await page.locator(".chips button").nth(0).click();
      await page.getByRole("heading", { name: "Question 1" }).waitFor();
      assert.deepEqual(await sources(), expected(1), "revisit retains the right video");
      await page.reload();
      await page.getByRole("heading", { name: "Question 1" }).waitFor();
      assert.deepEqual(await sources(), expected(1), "reload retains the right video");
    } finally {
      await context.close();
    }
  });
}
