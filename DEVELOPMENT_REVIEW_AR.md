# مراجعة توزيع المهارات

هذا مستودع مهارات مشتق، وليس تطبيقًا مستقلاً. القواعد الحالية في CLAUDE.md تربط المهارات المروجة engineering/productivity بREADME وdocs وplugin.json، وتستبعد المهارات التجريبية. فحص النسخة الحالية وجد تطابقًا؛ غياب تحقق تلقائي يتيح انحراف التسجيل لاحقًا.

الخطة المنفذة: فاحص مستقل بلا تبعيات يقرأ فهرس المصدر الفعلي؛ يتحقق الاسم والتسجيل والروابط وصفحات الوثائق والتكرار واستبعاد غير المروج؛ أمر `npm run validate` يجمعه مع فحص الإصدار الموجود؛ workflow للPR/main؛ اختبارات تثبت فشل الفحص إذا فصل التسجيل أو فقدت الوثائق.

المصادر: [Agent Skills specification](https://agentskills.io/specification)، [Node test runner](https://nodejs.org/api/test.html)، [GitHub workflow triggers](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow). الفاحص محدود بعقد التوزيع المحلي؛ ليس بديلًا لفاحص YAML عام.

التحقق: `npm run validate` نجح على الفهرس الحقيقي؛ `node --test scripts/validate-catalog.test.mjs` أربعة اختبارات ناجحة؛ `git diff --check` ناجح. لم تُعدل manifests ولا سلوك المهارات أو التثبيت المحلي، لذا لا حاجة لتحديث router أو تثبيت مهارات على الجهاز.

التكامل: npm/workflow -> validate-catalog -> ملفات يستهلكها plugin والمستخدم -> فشل واضح قبل توزيع تسجيل ناقص. تعطيل تسجيل fixture فشل كما ينبغي. workflow لم ينفذ عن بعد بعد؛ يجب قراءة نتيجته على commit المنشور. لا بقايا محذوفة.
