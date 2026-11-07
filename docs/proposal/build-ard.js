// Builds the Arabic technical proposal (العرض الفني).
// Usage: LOGO_RATIO=0.638 node build-ard.js modules.json "العرض-الفني-منظومة-التكافل.docx" bigcloud-logo.png
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, BorderStyle,
  LevelFormat, Footer, Header, PageNumber, ImageRun, PageBreak, HeadingLevel } = require("docx");
const [dataPath, out, logo] = process.argv.slice(2);
const mods = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const NAVY = "152B56", BLUE = "0F75DB", ORANGE = "FF5722", SOFT = "F3F5FB", RED = "C62828", FONT = "Arial";
const strip = (s) => s.replace(/محصّل/g, "\u0001").replace(/ّ/g, "").replace(/\u0001/g, "محصّل");
const R = (text, o = {}) => new TextRun({ text: strip(text), font: FONT, rightToLeft: true, size: 24, ...o });
const P = (runs, o = {}) => new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, spacing: { after: 120, line: 320 }, ...o, children: Array.isArray(runs) ? runs : [R(runs)] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, alignment: AlignmentType.RIGHT, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 4 } }, children: [R(t, { bold: true, size: 32, color: NAVY })] });
const H2 = (t, extra = []) => new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, alignment: AlignmentType.RIGHT, keepNext: true, children: [R(t, { bold: true, size: 26, color: BLUE }), ...extra] });
const bullet = (t) => new Paragraph({ bidirectional: true, alignment: AlignmentType.RIGHT, numbering: { reference: "dots", level: 0 }, spacing: { after: 60 }, children: [R(t, { size: 22 })] });
const W = 9026;
const cell = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
  shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
  children: [P([R(t, { size: 21, bold: !!o.bold, color: o.color })], { spacing: { after: 0, line: 280 } })] });
const table = (cols, head, rows) => new Table({ visuallyRightToLeft: true, width: { size: W, type: WidthType.DXA }, columnWidths: cols,
  rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, cols[i], { fill: NAVY, bold: true, color: "FFFFFF" })) }),
    ...rows.map((r, k) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, cols[i], { fill: k % 2 ? SOFT : undefined, bold: i === 0 })) }))] });

const DESC = {
  m02: "سجل موحد لكل عميل فرداً كان أو شركة، يضم وثائقه وشهاداته ومطالباته وكل تغيير عليه. يكشف النظام التكرار ويتحقق من الهوية وقوائم العقوبات (KYC وPEP) عند التسجيل.",
  m06: "إصدار شهادة التكافل خلال دقيقة بملف PDF موقع ورمز QR للتحقق، مع الملاحق والإلغاء والتجديد. يرسل النظام تنبيه SMS أو بريد للعميل قبل انتهاء الشهادة بـ30 يوماً.",
  m05: "قواعد اكتتاب وتسعير تعطي قراراً فورياً للحالات العادية. تذهب الحالات الخاصة إلى صاحب الصلاحية حسب مصفوفة الموافقات.",
  m09: "تمر كل مطالبة بست مراحل من التسجيل حتى الإغلاق، مع لوحة متابعة لمهلة الصرف (5 أيام عمل). يصرف النظام التعويض من صندوق المشتركين فقط بعد اعتماد صاحب الصلاحية.",
  m10: "تسجيل اتفاقيات إعادة التكافل النسبية وغير النسبية والإسناد الاختياري. يحسب النظام حصة المعيد من كل مطالبة ويسجل الاسترداد آلياً، مع مطابقة الكشوف شهرياً.",
  m07: "تحصيل المساهمات من الفروع والمنافذ والمصارف، شهرياً أو ربع سنوياً أو سنوياً. يقسم النظام كل إيصال آلياً بين صندوق المشتركين (التبرع) وصندوق المساهمين (أجرة الوكالة).",
  m04: "سجل للوكلاء والوسطاء وتراخيصهم مع لوحة أداء لكل وكيل. يحسب النظام العمولة بشكل متدرج على المساهمات المحصّلة فقط، مع كشف شهري يعتمده المدير المالي.",
  m12: "قيود محاسبية تلقائية لكل عملية، وكل صندوق متوازن وحده. تصدر الميزانية وقائمة الدخل وميزان المراجعة لكل صندوق ولكل فرع تأمين بضغطة زر.",
  m28: "24 مؤشر أداء و12 لوحة تفاعلية تتحدث كل ساعة. ترتبط المنصة بأداة Metabase أو Power BI للقراءة فقط.",
  m16: "حالة شرعية إلزامية على كل عقد وعملية، وسجل للاستثناءات والتطهير. تعتمد الهيئة الشرعية قراراتها داخل المنظومة، ويصدر النظام شهادة الالتزام السنوية.",
  m15: "حساب الفائض التأميني خطوة بخطوة بمعادلة ثابتة بعد سداد القرض الحسن. يوزع النظام الفائض 100% على المشتركين بنسبة مساهماتهم، نقداً أو خصماً على التجديد.",
  m11: "محافظ استثمار منفصلة لكل صندوق بعقود مرابحة ومضاربة وإجارة وصكوك. يوزع النظام العوائد ويحسب حصة المضارب، مع تقارير أداء دورية.",
  m33: "ملفات الموظفين والعقود والإجازات والحضور والسلف ونهاية الخدمة. يفتح التعيين حساب الدخول للموظف، ويغلقه إنهاء الخدمة في اليوم نفسه.",
  m34: "كشف رواتب شهري يعده موظف ويراجعه مدقق ويعتمده المدير المالي. يحسب النظام الضمان الاجتماعي والضريبة والدمغة والتضامن، ويصدر القسائم وملف التحويل المصرفي.",
};

const body = [];
if (logo && fs.existsSync(logo)) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new ImageRun({ type: logo.endsWith(".png") ? "png" : "jpg", data: fs.readFileSync(logo), transformation: { width: 180, height: 180 * (+process.env.LOGO_RATIO || 0.4) } })] }));
body.push(
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [R("العرض الفني", { bold: true, size: 56, color: NAVY })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [R("منظومة التكافل لإدارة أعمال التأمين التكافلي", { size: 28, color: BLUE, bold: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 360 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } }, children: [R("مقدم إلى شركة التكافل للتأمين · نوفمبر 2026", { size: 22, color: "5B6B86" })] }),
  P([R("السادة/ شركة التكافل للتأمين المحترمين", { bold: true })]),
  P([R("تحية طيبة وبعد،")]),
  P([R("يسرنا في شركة السحابة الكبيرة لتكنولوجيا المعلومات والذكاء الاصطناعي أن نضع بين أيديكم تصوراً مبدئياً لمنظومة ERP المخصصة لشركتكم، راجين الاطلاع واتخاذ ما ترونه مناسباً، ويأتي عرضنا الفني على النحو الآتي:")], { spacing: { after: 240, line: 340 } }),

  H1("أولاً: نظرة عامة على المشروع"),
  P("منصة التكافل منظومة متكاملة لإدارة أعمال التأمين التكافلي، تغطي الوحدات الاثنتي عشرة الواردة في العرض الأصلي، مع وحدتي الموارد البشرية والرواتب، أي 14 وحدة في منصة واحدة."),
  P("تعمل المنصة باللغة العربية بالكامل، مع قاموس مصطلحات يعدل أي مصطلح في كل الشاشات من صفحة واحدة، وتعمل على الحاسوب والجهاز اللوحي والهاتف."),
  P("تفصل قاعدة البيانات أموال صندوق المشتركين عن أموال صندوق المساهمين فصلاً تاماً، وتحمل كل عملية حالتها الشرعية، ولا ينفذ النظام أي عملية حساسة دون اعتماد شخص ثان."),
  P("تعتمد المنصة على لغة TypeScript وقاعدة بيانات PostgreSQL، وتصل الشركة كحزمة Docker واحدة تعمل على خوادمها الداخلية أو في السحابة، مع ثلاث بيئات مستقلة (التطوير والاختبار والإنتاج) ونسخ احتياطي يومي."),
  P("تضم المنصة مساعداً ذكياً (الأتمتة) بتقنية Atmet يلخص البيانات ويقترح القرارات مع رابط لكل مصدر، ولا ينفذ أي إجراء نيابة عن الموظف دون تأكيده."),
  P([R("عرض تفاعلي للمنصة متاح على الرابط "), R("takafuly.vercel.app", { bold: true, color: BLUE, rightToLeft: false }), R(" برمز الدخول المرسل للشركة.")]),

  new Paragraph({ children: [new PageBreak()] }),
  H1("ثانياً: الجدول الزمني (6 أشهر)"),
  P("3 أشهر للبناء، وشهر للاختبار مع تشغيل النظامين القديم والجديد معاً، وشهران للتشغيل الفعلي تحت الإشراف، ثم التسليم والضمان."),
  table([2300, 1500, 5226], ["المرحلة", "المدة", "الأعمال"], [
    ["البناء", "الشهر 1", "الأساس (المستخدمون والصلاحيات والقاموس والمنتجات)، وإدارة العملاء، والاكتتاب، وإصدار الوثائق، وتحصيل المساهمات"],
    ["البناء", "الشهر 2", "المحاسبة والمالية مع فصل الصندوقين، والمطالبات، وإعادة التكافل، والوكلاء والوسطاء"],
    ["البناء", "الشهر 3", "الرقابة الشرعية، والاستثمار، والفائض، ولوحات القيادة، والموارد البشرية، والرواتب، واختبار الاختراق"],
    ["الاختبار والتشغيل المتوازي", "الشهر 4", "نقل البيانات من النظام الحالي، والربط مع المصارف وSMS، وتشغيل النظامين معاً ومقارنة الأرقام يومياً، والتدريب واختبار القبول"],
    ["التشغيل تحت الإشراف", "الشهران 5 و6", "إيقاف النظام القديم، ومتابعة ومطابقة يومية، وإصلاح الملاحظات خلال 24 ساعة، وإقفالان شهريان كاملان، ثم التسليم"],
    ["الضمان", "6 أشهر", "إصلاح أي خلل بعد التسليم دون تكلفة"],
  ]),

  P("", { spacing: { after: 200 } }),
  H1("ثالثاً: وحدات المنظومة"),
  P("لكل وحدة وصف مختصر، وما لا يسمح به النظام فيها. الوحدات المعلمة «وحدة حساسة» تحميها قواعد إضافية في قاعدة البيانات نفسها."),
);
mods.forEach((m, i) => {
  body.push(H2(`${i + 1}. ${m.name}${m.brief ? ` (البند ${m.brief})` : ""}`, m.sensitive ? [R("   ● وحدة حساسة", { bold: true, size: 20, color: RED })] : []));
  body.push(P(DESC[m.id], { spacing: { after: 80, line: 300 } }));
  body.push(P([R("ما لا يسمح به النظام:", { bold: true, size: 22, color: NAVY })], { spacing: { after: 40 }, keepNext: true }));
  m.rules.forEach(([what]) => body.push(bullet(what)));
  body.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
});
body.push(
  H1("رابعاً: الوحدات الحساسة وطريقة حمايتها"),
  P("ثماني وحدات تتعامل مع المال أو الهوية أو الحكم الشرعي مباشرة، ولكل منها حماية في قاعدة البيانات لا في الشاشة فقط، مع سجل تدقيق لكل محاولة."),
  table([2100, 3463, 3463], ["الوحدة", "الخطر", "كيف يحميها النظام"], mods.filter((m) => m.sensitive).map((m) => [m.name, m.risk.replace(/\.$/, ""), m.controls[0]])),
  P("", { spacing: { after: 120 } }),
  P("المساعد الذكي في هذه الوحدات يقترح فقط، ولا ينفذ أي إجراء دون تأكيد موظف مسؤول باسمه."),
  P("", { spacing: { after: 240 } }),
  P([R("وتفضلوا بقبول فائق الاحترام والتقدير،")]),
  P([R("شركة السحابة الكبيرة لتكنولوجيا المعلومات والذكاء الاصطناعي", { bold: true, color: NAVY })]),
);

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 32, bold: true, color: NAVY }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 26, bold: true, color: BLUE }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.RIGHT, style: { paragraph: { indent: { right: 360, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1200, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ bidirectional: true, alignment: AlignmentType.LEFT, children: [R("العرض الفني · منظومة التكافل", { size: 16, color: "8A97AD" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "8A97AD" })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log("written", out); });
