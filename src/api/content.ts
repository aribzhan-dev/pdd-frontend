// Catalogue reads.

import { request } from "@/api/client";
import type { Language, TopicBrief } from "@/types/api";

export const contentApi = {
  listTopics: (lang: Language) =>
    request<TopicBrief[]>("/topics", { query: { lang } }),
};
