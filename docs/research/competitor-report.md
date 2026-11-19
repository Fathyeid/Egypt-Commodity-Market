# تقرير تحليل المنافسين: منصات تعلم اللغات

**تاريخ البحث:** 19 نوفمبر 2026
**نطاق البحث:** 40 منصة عالمية (قاعدة البيانات الكاملة في [`competitors.csv`](./competitors.csv))

## 0. حدود البحث (اقرأ قبل الأرقام)

- **الأسعار:** أكثر المنصات لا تنشر سعراً ثابتاً، والسعر يختلف حسب الدولة والمتجر والعروض. قيمة عمود `price_confidence` في قاعدة البيانات توضح درجة الثقة في كل سعر:
  - **High:** من قائمة متجر Apple الرسمية أو من سعر ثابت معروف (Speak وAnki).
  - **Medium:** من مصادر خارجية متعددة ومتسقة بتاريخ 2026.
  - **Low / Unverified:** مصادر متضاربة أو غير متوفرة. يجب التحقق منها يدوياً من صفحة الأسعار الرسمية قبل استخدامها في أي قرار تسعير.
- تم البحث عن الأسعار والميزات لـ 15 منصة رئيسية عبر محرك البحث في هذه الجلسة. أما بيانات الميزات لبقية المنصات فهي من المعرفة العامة الموثقة عن المنتجات، وعمود السعر فيها مكتوب "Unverified" عمداً بدل وضع رقم غير مؤكد.
- لم يتم نسخ أي تصميم أو محتوى. التحليل وظيفي فقط.

## 1. أبرز النتائج في سطور

1. **لا توجد منصة واحدة تجمع المهارات الأربع مع المحادثة الحقيقية والتحليل المستمر.**
   - Duolingo يتفوق في العادة والتحفيز.
   - Babbel يتفوق في شرح القواعد.
   - Speak وPraktika يتفوقان في التحدث.
   - ELSA يتفوق في النطق.
   - LingQ يتفوق في القراءة والاستماع.
   - italki وPreply يوفران مدرسين حقيقيين.
   - المتعلم يدفع اليوم لـ 3 أو 4 اشتراكات ليغطي كل هذا. **هذه هي الفرصة الأساسية.**
2. **الذكاء الاصطناعي أصبح ميزة الاشتراك الأعلى في كل مكان:**
   - Duolingo Max (حوالي 30 دولاراً شهرياً).
   - Speak Premium Plus (40 دولاراً شهرياً).
   - Busuu Premium Plus.
   - LingQ Premium Plus.
   - **السعر المرجعي لمدرس صوتي ذكي هو 30 إلى 40 دولاراً شهرياً.**
3. **ضعف مشترك عند المنصات الكبرى:**
   - المدرس الذكي لا يتذكر أخطاء المتعلم السابقة بشكل منظم.
   - التقارير تقيس النشاط (XP، دقائق) لا المهارة (مستوى CEFR في كل مهارة).
   - المناهج غالباً ترجمة لمنهج واحد، وليست مصممة لكل لغة.
4. **النطق:** أقوى المنافسين (ELSA) يدعم الإنجليزية فقط. خدمات التقييم الحقيقية مثل Azure Pronunciation Assessment تدعم عدة لغات، لكن تقييم الإيقاع والتنغيم (Prosody) كان موثقاً للإنجليزية الأمريكية فقط. **يجب أن نعرض للمتعلم بوضوح ما نقيسه فعلاً لكل لغة.**
5. **المتحدثون بالعربية مهملون:** المناهج المصممة لزوج اللغات (عربي ← ألماني مثلاً) نادرة جداً. هذه ميزة تنافسية حقيقية في السوق العربي.
6. **مشكلات الثقة:**
   - شكاوى من الفوترة في ELSA.
   - تضارب الأسعار وإخفاؤها عند أكثر المنافسين.
   - **التسعير الشفاف والإلغاء السهل يمكن أن يكونا ميزة تسويقية.**

## 2. التحليل حسب المحور

| المحور | من الأفضل حالياً | الفجوة | ماذا نبني |
|---|---|---|---|
| المناهج وطرق التعليم | Babbel (منهج لكل زوج لغات)، Busuu (CEFR)، Talk To Me In Korean | أغلبها ترجمة لمنهج واحد | منهج أصلي لكل لغة مربوط بـ CEFR "Can-do"، مع وحدات خاصة بنظام الكتابة (النغمات، الكانجي، الهانغول، الأبجدية) |
| المحادثة والتحدث | Speak، Praktika، Duolingo Video Call | المحادثة لا تُبنى على أخطاء المتعلم السابقة | Roleplay تكيّفي يُدخل نقاط ضعف المتعلم داخل السيناريو |
| المدرس الذكي | Speak Tutor Call، Langua | ذاكرة ضعيفة، شخصيات سطحية | ذاكرة منظمة (أخطاء، كلمات صعبة، مستوى) + 5 شخصيات تعليمية |
| تصحيح النطق | ELSA (للإنجليزية فقط)، Rosetta TruAccent | لغة واحدة، أو درجات غير مفسرة | تقييم صوتي حقيقي لكل كلمة ومقطع، مع عرض واضح لحدود ما نقيسه في كل لغة |
| القواعد | Babbel، Duolingo Explain My Answer | التصحيح لا يتحول إلى تمرين | كل خطأ يُسجَّل في الملف ويولّد تمارين علاجية تلقائياً |
| تحديد المستوى | Busuu، EF SET | اختبارات قراءة وقواعد فقط غالباً | اختبار تكيّفي للمهارات السبع مع تقرير لكل مهارة |
| الألعاب | Duolingo (الأقوى) | قد تطغى على التعلم | XP مرتبط بإتقان حقيقي، ولا مكافأة على النشاط الفارغ |
| الفيديو والاستماع | Memrise (فيديو متحدثين أصليين)، Lingopie، FluentU | مشاكل الترخيص | محتوى أصلي ومرخص، مع مشغّل كلمات قابلة للنقر يحفظها في SRS |
| المفردات وSRS | Anki (خوارزمية FSRS)، WaniKani | Anki صعب الإعداد | خوارزمية FSRS دون أي إعداد، وبطاقات تُنشأ تلقائياً من كل نشاط |
| التقارير | Busuu، Lingoda | تقيس النشاط لا المهارة | لوحة CEFR لكل مهارة، والأخطاء المتكررة، وتطور النطق |
| المجتمع | HelloTalk، Tandem، Busuu | مشكلات أمان وإشراف | تبادل منظم حول مهام محددة، مع إشراف وإبلاغ |
| المدرسون الحقيقيون | italki، Preply، Cambly | المدرس لا يعرف تاريخ المتعلم | المدرس يرى تقرير المتعلم (بإذنه) قبل الحصة، وملخص الحصة يدخل الخطة |
| التعلم دون إنترنت | Busuu، Rosetta، Pimsleur | — | PWA مع تنزيل الدروس والمراجعة. الذكاء الاصطناعي يحتاج اتصالاً (نوضح ذلك للمتعلم) |
| الخطط المدفوعة | Speak وDuolingo (ثلاثة مستويات) | أسعار مخفية ومتضاربة | ثلاثة مستويات بأسعار معلنة تُدار من لوحة الإدارة |

## 3. ملخص أهم 15 منصة

| المنصة | النموذج | السعر التقريبي 2026 | القوة | الضعف |
|---|---|---|---|---|
| Duolingo | مجاني + Super/Max | Super حوالي 14$ شهرياً، Max حوالي 30$ شهرياً | العادة والتحفيز | محادثة سطحية |
| Babbel | اشتراك + مدى الحياة | 14 إلى 18$ شهرياً، مدى الحياة حوالي 299$ | منهج لكل زوج لغات | ذكاء اصطناعي محدود |
| Busuu | مجاني + Premium (Plus) | 15 إلى 17$ شهرياً | CEFR ومجتمع | تفاوت جودة التصحيح |
| Rosetta Stone | اشتراك + مدى الحياة | مدى الحياة 149 إلى 199$ (عروض) | انغماس ونطق | بطيء ولا يشرح القواعد |
| Memrise | مجاني + Pro | 7.5 إلى 15$ شهرياً | فيديو أصلي | تغييرات متكررة في المنتج |
| ELSA Speak | مجاني + Pro/Premium | Premium حوالي 20$ شهرياً | نطق على مستوى الصوت | إنجليزي فقط |
| Speak | Premium/Plus | 18$ و40$ شهرياً | كثافة التحدث | لغات قليلة وسعر مرتفع |
| Pimsleur | اشتراك | 15 إلى 21$ شهرياً | استرجاع صوتي | قراءة وكتابة قليلة |
| LingQ | مجاني + Premium | 15$ شهرياً | محتوى ضخم | واجهة مزدحمة |
| italki | لكل حصة | حسب المدرس | تنوع المدرسين | لا استمرارية للمنهج |
| Preply | باقات | حسب المدرس | مطابقة ذكية بالمدرس | عمولة مرتفعة |
| Mondly | اشتراك + مدى الحياة | 6 إلى 12$ شهرياً | لغات كثيرة | سطحي |
| Praktika | اشتراك | 8 إلى 15$ شهرياً | مدرس افتراضي بأفاتار | هيكل ضعيف |
| Lingoda | رصيد حصص | 40 إلى 846$ كل 4 أسابيع | مدرسون ومنهج CEFR | مكلف |
| Talkpal | مجاني + اشتراك | 6 إلى 20$ شهرياً | رخيص | تربوياً ضعيف |

## 4. الميزات التي تميز منصتنا

1. **ملف المتعلم الموحد (Learner Model):** مصدر واحد للحقيقة يجمع:
   - مستوى CEFR لكل مهارة من المهارات السبع.
   - سجل الأخطاء مصنفاً حسب القاعدة.
   - حالة كل كلمة في نظام SRS.
   - تاريخ النطق لكل صوت.

   يقرأ منه كل شيء: المدرس الذكي، والمحادثات، والتمارين، والتقارير، والمدرس البشري.
2. **الحلقة التكيفية:**
   - كل خطأ يُصنَّف حسب القاعدة.
   - إذا تكرر الخطأ يتولد تمرين علاجي.
   - يدخل التمرين في خطة اليوم.
   - يعاد قياس المهارة.
3. **مناهج أصلية لكل لغة:**
   - وحدات خاصة بنظام الكتابة والأصوات في كل لغة.
   - شرح القواعد بلغة المتعلم الأم، مع تقابلات مخصصة للمتحدث بالعربية.
4. **صدق القياس:**
   - لا نعرض درجة نطق إلا من خدمة تقييم حقيقية.
   - نوضح للمتعلم ما المقيس وما غير المقيس في كل لغة.
5. **التعلم حسب الهدف:** مسارات للعمل والسفر والدراسة والهجرة والمقابلات، بمفردات وسيناريوهات مخصصة.
6. **عربية أولاً:** واجهة RTL كاملة، وسوق عربي مهمل نسبياً.
7. **تسعير شفاف:** أسعار معلنة، وإلغاء بنقرة، وتجربة مجانية حقيقية.

## 5. المصادر الرئيسية المستخدمة

- Duolingo: [Duolingo Blog – Max](https://blog.duolingo.com/duolingo-max)، [familypro.io](https://familypro.io/en/blog/duolingo-max-vs-super)، [ghacks](https://www.ghacks.net/2023/03/21/duolingo-max-vs-super-gpt-4-powered-difference/)، [storylearning](https://storylearning.com/duolingo-max-review)
- Babbel: [Babbel Support – Pricing](https://support.babbel.com/hc/en-gb/articles/19650417983378-Pricing)، [ThePricer](https://www.thepricer.org/how-much-does-babbel-cost/)، [NerdWallet](https://www.nerdwallet.com/finance/learn/how-much-does-babbel-cost)
- Busuu: [Busuu Premium plans](https://www.busuu.com/en/premium-plans)، [Busuu Help](https://help.busuu.com/hc/articles/16269241908497)، [frontdeskreview](https://frontdeskreview.com/software/language-learning/busuu/)
- ELSA: [App Store](https://apps.apple.com/us/app/elsa-learn-and-speak-English/id1083804886)، [ELSA plan comparison](https://elsanow.freshdesk.com/en/support/solutions/articles/31000178976-choosing-the-right-elsa-plan-free-vs-pro-vs-premium)
- Speak: [App Store](https://apps.apple.com/us/app/-/id1286609883)، [Android Authority](https://androidauthority.com/speak-ai-tutor-call-3725246)، [Recurdash](https://recurdash.com/subscription-pricing/speak)
- Rosetta Stone: [TechRepublic](https://www.techrepublic.com/article/rosetta-stone-best-price/)، [PopSci](https://www.popsci.com/gear/rosetta-stone-new-years-deal-2026/)
- Pimsleur: [onlinecourseing](https://onlinecourseing.com/pimsleur-cost/)، [storylearning](https://storylearning.com/blog/pimsleur-review)
- LingQ: [LingQ Premium review](https://www.lingq.com/blog/lingq-premium-review-2026-is-it-worth-the-upgrade)، [LingQ free vs premium](https://www.lingq.com/blog/lingq-free-vs-premium/)
- italki وPreply: [italki blog](https://www.italki.com/en/blog/italki-vs-preply)، [Preply blog](https://preply.com/en/blog/italki-and-preply-review)، [pensight](https://pensight.com/post/italki-commission-teachers)
- Memrise وMondly وPraktika: [learnenglish.life](https://www.learnenglish.life/guides/mondly-pricing/)، [frontdeskreview](https://frontdeskreview.com/software/language-learning/memrise/)، [Praktika blog](https://praktika.ai/blog/how-much-does-it-cost-to-learn-spanish-september-2026)
- Lingoda وCambly وTalkpal: [learnenglish.life](https://learnenglish.life/compare/cambly-vs-lingoda/)، [languatalk](https://languatalk.com/blog/talkpal-review/)
- تقييم النطق: [Microsoft Learn – Pronunciation assessment](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment)، [Language support](https://learn.microsoft.com/azure/ai-services/speech-service/language-support)
