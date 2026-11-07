// Builds the Arabic technical proposal (عرض فني).
// Usage: LOGO_RATIO=0.638 node build-ard.js modules.json "عرض-فني-السحابة-الكبيرة-إلى-التكافل.docx" bigcloud-logo.png
const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, BorderStyle,
  LevelFormat, Footer, Header, PageNumber, ImageRun, PageBreak, HeadingLevel } = require("docx");
const [dataPath, out, logo] = process.argv.slice(2);
const mods = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const NAVY = "152B56", BLUE = "0F75DB", ORANGE = "FF5722", SOFT = "F3F5FB", RED = "C62828", FONT = "Arial";
const strip = (s) => s.replace(/محصّل/g, "\u0001").replace(/ّ/g, "").replace(/\u0001/g, "محصّل");
const R = (text, o = {}) => new TextRun({ text: strip(text), font: FONT, rightToLeft: true, size: 24, ...o });
const P = (runs, o = {}) => new Paragraph({ bidirectional: true, spacing: { after: 120, line: 320 }, ...o, children: Array.isArray(runs) ? runs : [R(runs)] });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, bidirectional: true, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 4 } }, children: [R(t, { bold: true, size: 32, color: NAVY })] });
const H2 = (t, extra = []) => new Paragraph({ heading: HeadingLevel.HEADING_2, bidirectional: true, keepNext: true, children: [R(t, { bold: true, size: 26, color: BLUE }), ...extra] });
const bullet = (t) => new Paragraph({ bidirectional: true, numbering: { reference: "dots", level: 0 }, spacing: { after: 60 }, children: [R(t, { size: 22 })] });
const W = 9026;
const cell = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
  shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
  children: [P([R(t, { size: 21, bold: !!o.bold, color: o.color })], { spacing: { after: 0, line: 280 } })] });
const table = (cols, head, rows) => new Table({ visuallyRightToLeft: true, width: { size: W, type: WidthType.DXA }, columnWidths: cols,
  rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, cols[i], { fill: NAVY, bold: true, color: "FFFFFF" })) }),
    ...rows.map((r, k) => new TableRow({ cantSplit: true, children: r.map((v, i) => cell(v, cols[i], { fill: k % 2 ? SOFT : undefined, bold: i === 0 })) }))] });

const DESC = {
  m02: "سجل موحد لكل عميل، فرداً أو شركة: الوثائق والشهادات والمطالبات وسجل التغييرات. يكشف النظام التكرار ويتحقق من الهوية وقوائم العقوبات (KYC وPEP) عند التسجيل.",
  m06: "إصدار شهادة التكافل خلال دقيقة بملف PDF موقع ورمز QR للتحقق، مع الملاحق والإلغاء والتجديد. يرسل النظام تنبيه SMS أو بريد للعميل قبل انتهاء الشهادة بـ30 يوماً.",
  m05: "قواعد اكتتاب وتسعير تعطي قراراً فورياً للحالات العادية. تذهب الحالات الخاصة إلى صاحب الصلاحية حسب مصفوفة الموافقات.",
  m09: "تمر كل مطالبة بست مراحل من التسجيل حتى الإغلاق، مع لوحة متابعة لمهلة الصرف (5 أيام عمل). يصرف النظام التعويض من صندوق المشتركين فقط بعد اعتماد صاحب الصلاحية.",
  m10: "تسجيل اتفاقيات إعادة التكافل النسبية وغير النسبية والإسناد الاختياري. يحسب النظام حصة المعيد من كل مطالبة ويسجل الاسترداد آلياً، مع مطابقة الكشوف شهرياً.",
  m07: "تحصيل المساهمات من الفروع والمنافذ والمصارف، شهرياً أو ربع سنوياً أو سنوياً. يقسم النظام كل إيصال آلياً بين صندوق المشتركين (التبرع) وصندوق المساهمين (أجرة الوكالة).",
  m04: "سجل الوكلاء والوسطاء والتراخيص، ولوحة أداء لكل وكيل. يحسب النظام العمولة بشكل متدرج على المساهمات المحصّلة فقط، مع كشف شهري باعتماد المدير المالي.",
  m12: "قيود محاسبية تلقائية لكل عملية، وتوازن مستقل لكل صندوق. تصدر الميزانية وقائمة الدخل وميزان المراجعة لكل صندوق ولكل فرع تأمين بضغطة زر.",
  m28: "24 مؤشر أداء و12 لوحة تفاعلية تتحدث كل ساعة. ترتبط المنصة بأداة Metabase أو Power BI للقراءة فقط.",
  m16: "حالة شرعية إلزامية على كل عقد وعملية، وسجل للاستثناءات والتطهير. اعتماد قرارات الهيئة الشرعية داخل المنظومة، وإصدار شهادة الالتزام السنوية.",
  m15: "حساب الفائض التأميني خطوة بخطوة بمعادلة ثابتة بعد سداد القرض الحسن. يوزع النظام الفائض 100% على المشتركين بنسبة المساهمة، نقداً أو خصماً على التجديد.",
  m11: "محافظ استثمار منفصلة لكل صندوق بعقود مرابحة ومضاربة وإجارة وصكوك. يوزع النظام العوائد ويحسب حصة المضارب، مع تقارير أداء دورية.",
  m33: "ملفات الموظفين والعقود والإجازات والحضور والسلف ونهاية الخدمة. فتح حساب الدخول عند التعيين، وإغلاق الحساب في يوم إنهاء الخدمة.",
  m34: "كشف رواتب شهري بثلاث خطوات: إعداد ثم تدقيق ثم اعتماد المدير المالي. يحسب النظام الضمان الاجتماعي والضريبة والدمغة والتضامن، ويصدر القسائم وملف التحويل المصرفي.",
};

const body = [];
if (logo && fs.existsSync(logo)) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new ImageRun({ type: logo.endsWith(".png") ? "png" : "jpg", data: fs.readFileSync(logo), transformation: { width: 180, height: 180 * (+process.env.LOGO_RATIO || 0.4) } })] }));
body.push(
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [R("عرض فني", { bold: true, size: 56, color: NAVY })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [R("من شركة السحابة الكبيرة لتكنولوجيا المعلومات والذكاء الاصطناعي", { size: 26, color: BLUE, bold: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [R("إلى شركة التكافل للتأمين", { size: 26, color: NAVY, bold: true })] }),
  new Paragraph({ bidirectional: true, alignment: AlignmentType.CENTER, spacing: { after: 360 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ORANGE, space: 8 } }, children: [R("منظومة التكافل لإدارة أعمال التأمين التكافلي · نوفمبر 2026", { size: 22, color: "5B6B86" })] }),
  // Opening letter: the owner's exact text, verbatim (no additions, no removals).
  P([R("السادة شركة التكافل للتامين ", { bold: true })]),
  P([R("تحية طيبة وبعد : ")]),
  P([R("يسرنا في شركة السحابة الكبيرة لتكنولوجيا المعلومات والذكاء الاصطناعي ان نضع بين تصور مبدئي لمنظومة ERB والمخصصة لشركتكم راجين الاطلاع واتخاذ ماترونه مناسبا وسياتي عرضنا الفني على النحو الآتي : ")], { spacing: { after: 240, line: 340 } }),
  H1("اولاً:"),
  H2("نظرة عامة على المشروع"),
  P("منصة التكافل منظومة متكاملة لإدارة أعمال التأمين التكافلي، تغطي الوحدات الاثنتي عشرة الواردة في العرض الأصلي، مع وحدتي الموارد البشرية والرواتب، أي 14 وحدة في منصة واحدة."),
  P("تعمل المنصة باللغة العربية بالكامل، مع قاموس مصطلحات يعدل أي مصطلح في كل الشاشات من صفحة واحدة، وتعمل على الحاسوب والجهاز اللوحي والهاتف."),
  P("تفصل قاعدة البيانات أموال صندوق المشتركين عن أموال صندوق المساهمين فصلاً تاماً، ولكل عملية حالة شرعية إلزامية، ولا ينفذ النظام أي عملية حساسة دون اعتماد شخص ثان."),
  P("تعتمد المنصة على لغة TypeScript وقاعدة بيانات PostgreSQL، وتصل الشركة كحزمة Docker واحدة تعمل على الخوادم الداخلية للشركة أو في السحابة، مع ثلاث بيئات مستقلة (التطوير والاختبار والإنتاج) ونسخ احتياطي يومي."),
  P("تضم المنصة مساعداً ذكياً (الأتمتة) بتقنية Atmet يلخص البيانات ويقترح القرارات مع رابط لكل مصدر، ولا ينفذ أي إجراء نيابة عن الموظف دون تأكيد صريح."),
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
  P("لكل وحدة وصف مختصر وقائمة بما لا يسمح به النظام. الوحدات المعلمة «وحدة حساسة» لها حماية إضافية داخل قاعدة البيانات."),
);
mods.forEach((m, i) => {
  body.push(H2(`${i + 1}. ${m.name}${m.brief ? ` (البند ${m.brief})` : ""}`, m.sensitive ? [R("   ● وحدة حساسة", { bold: true, size: 20, color: RED })] : []));
  body.push(P(DESC[m.id], { spacing: { after: 80, line: 300 } }));
  body.push(P([R("ما لا يسمح به النظام:", { bold: true, size: 22, color: NAVY })], { spacing: { after: 40 }, keepNext: true }));
  m.rules.forEach(([what]) => body.push(bullet(what)));
  body.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
});
body.push(
  H1("رابعاً: الوحدات الحساسة وطريقة الحماية"),
  P("ثماني وحدات تتعامل مع المال أو الهوية أو الحكم الشرعي مباشرة. الحماية في قاعدة البيانات لا في الشاشة فقط، مع سجل تدقيق لكل محاولة."),
  table([2100, 3463, 3463], ["الوحدة", "الخطر", "طريقة الحماية"], mods.filter((m) => m.sensitive).map((m) => [m.name, m.risk.replace(/\.$/, ""), m.controls[0]])),
  P("", { spacing: { after: 120 } }),
  P("المساعد الذكي في هذه الوحدات يقترح فقط، ولا ينفذ أي إجراء دون تأكيد موظف مسؤول بالاسم."),
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
  numbering: { config: [{ reference: "dots", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1300, bottom: 1200, left: 1440, right: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ bidirectional: true, children: [R("عرض فني · شركة السحابة الكبيرة إلى شركة التكافل للتأمين", { size: 16, color: "8A97AD" })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: "8A97AD" })] })] }) },
    children: body,
  }],
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log("written", out); });
