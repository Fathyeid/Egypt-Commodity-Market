# German Arabic translation layer

`de-ar.jsonl.gz` overlays display meanings, not the original source corpus.

- All 40,802 previously missing German Arabic meanings now have an Arabic entry.
- 44 existing source meanings were also edited in the reviewed beginner sample.
- Total: 40,846 entries: 40,704 locally machine-translated, 142 editorial entries.
- Machine translations are **not all teacher-reviewed** and can omit or mistranslate meaning. Coverage is not a quality certification. A learner-facing notice states this.
- German source text and English meanings, sentence IDs, answer keys, exercise order, attribution and original Arabic stay unchanged.
- An ID plus source-text hash prevents applying an edit to a different sentence.
- `drafts/` records the first 56-sentence sample. Runtime does not read drafts.

## Free local method and attribution

German to Arabic with OPUS-MT / Helsinki-NLP, Apache 2.0, CPU int8 inference via CTranslate2 and SentencePiece. No paid API and no external learner data. Only the already-open source corpus was processed locally. Formal, plural and names were checked in the first sample; no claim of equivalent review for every machine result.

Observed model sources:
https://huggingface.co/Helsinki-NLP/opus-mt-de-ar
https://huggingface.co/gaudi/opus-mt-de-ar-ctranslate2
https://huggingface.co/ooeoeo/opus-mt-de-ar-ct2-float16

Tatoeba source sentence credit stays with Tatoeba under CC BY 2.0 FR. The new Arabic text is not attributed as a human Tatoeba translation. Model license: Apache 2.0.

Automatic checks reject empty Arabic, source-hash mismatches, leaked model tokens, obviously truncated outputs and repeated/Latin garbage. Failed outputs were retried and reviewed; these checks cannot establish semantic accuracy. Old downloaded lessons need re-download to receive changed meanings; saved attempts are not deleted.

Run the offline draft tool with `python scripts/factory/translate_de_ar.py --model-dir PATH --output DRAFT.jsonl --seconds 90`. Install ctranslate2 and sentencepiece separately. The downloaded Marian conversion must use decoder_start_token `<pad>` and add_source_eos `true`; incorrect conversion settings produce repetition. Drafts are never published automatically.
