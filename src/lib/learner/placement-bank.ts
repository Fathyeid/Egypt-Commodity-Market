import "server-only";
import { getPlacementBank as handBank } from "@/content";
import type { PlacementItem } from "@/content/types";
import { corpusFile, readCorpus } from "@/lib/factory/corpus";
import { buildPlacementBank } from "@/lib/factory/placement";

/** Hand-written bank where one exists (en, de); otherwise questions generated from the shipped corpus. */
const cache: Map<string, PlacementItem[]> = ((globalThis as { __lisanPlacement?: Map<string, PlacementItem[]> }).__lisanPlacement ??= new Map());

export function getPlacementBank(language: string): PlacementItem[] {
  const hand = handBank(language);
  if (hand.length) return hand;
  const hit = cache.get(language);
  if (hit) return hit;
  const file = corpusFile(language);
  const bank = file ? buildPlacementBank(language, readCorpus(file)) : [];
  cache.set(language, bank);
  return bank;
}

export const getPlacementItem = (language: string, id: string) => getPlacementBank(language).find((i) => i.id === id) ?? null;
/** Enough items for the adaptive test (at least one per skill at each level it reaches). */
export const placementAvailable = (language: string) => getPlacementBank(language).length >= 20;
