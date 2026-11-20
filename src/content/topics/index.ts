import { enTopics } from "./en";
import { deTopics } from "./de";
import { frTopics } from "./fr";
import { esTopics } from "./es";
export type { TopicSeed } from "./types";

export const TOPIC_SEEDS = [...enTopics, ...deTopics, ...frTopics, ...esTopics];
