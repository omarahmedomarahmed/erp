import type { Dict } from "@/lib/types";

// Page texts for /risks ("rk.*") and the extra labels of /dictionary ("rk.dict.*").
export const dict: Dict = {
  // ---- Risks page: the 4 protection layers ----
  "rk.layers.title": { ar: "أربع طبقات حماية", en: "Four layers of protection", cat: "label" },
  "rk.layers.intro": { ar: "لا نعتمد على حذر المستخدم. كل خطأ خطير يمر على أربع طبقات تمنعه أو تكشفه.", en: "We do not rely on users being careful. Every serious mistake meets four layers that stop or expose it.", cat: "help" },
  "rk.layer.db.title": { ar: "قيود قاعدة البيانات", en: "Database constraints", cat: "label" },
  "rk.layer.db.text": { ar: "قاعدة البيانات نفسها ترفض خلط الصناديق والقيد غير المتوازن، حتى لو أخطأ البرنامج.", en: "The database itself rejects mixed funds and unbalanced entries, even if the software errs.", cat: "help" },
  "rk.layer.mc.title": { ar: "Maker-checker وفصل المهام", en: "Maker-checker and segregation of duties", cat: "label" },
  "rk.layer.mc.text": { ar: "من يُدخل العملية لا يعتمدها. المبالغ الكبيرة تحتاج معتمدا ثانيا حسب الصلاحيات.", en: "Whoever enters a transaction cannot approve it. Large amounts need a second approver by authority limits.", cat: "help" },
  "rk.layer.audit.title": { ar: "سجل التدقيق", en: "Audit trail", cat: "label" },
  "rk.layer.audit.text": { ar: "نسجل كل تغيير ومحاولة ممنوعة: من وماذا ومتى. لا أحد يحذف السجل أو يعدّله.", en: "We log every change and blocked attempt: who, what, when. Nobody can delete or edit the log.", cat: "help" },
  "rk.layer.ssb.title": { ar: "اعتماد الهيئة الشرعية", en: "Sharia board approval", cat: "label" },
  "rk.layer.ssb.text": { ar: "المنتجات والعقود ونسب الوكالة والفائض تنتظر اعتماد الهيئة الشرعية قبل أن تعمل.", en: "Products, contracts, Wakala and surplus ratios wait for Sharia board approval before they go live.", cat: "help" },
  "rk.modules.title": { ar: "الوحدات الحساسة", en: "Sensitive modules", cat: "label" },
  "rk.modules.none": { ar: "لا وحدات حساسة بعد.", en: "No sensitive modules yet.", cat: "message" },

  // ---- Dictionary page: extra labels ----
  "rk.dict.module": { ar: "الوحدة", en: "Module", cat: "label" },
  "rk.dict.default": { ar: "النص الأصلي", en: "Default", cat: "label" },
  "rk.dict.prev": { ar: "السابق", en: "Previous", cat: "button" },
  "rk.dict.next": { ar: "التالي", en: "Next", cat: "button" },
  "rk.dict.page": { ar: "صفحة {page} من {pages}", en: "Page {page} of {pages}", cat: "label" },
  "rk.dict.uncheckedByEdit": { ar: "التعديل يلغي المراجعة. علّموه من جديد إن كان صحيحا.", en: "Editing clears the check. Tick it again if correct.", cat: "help" },
  "rk.dict.rule": { ar: "كل المدخلات تبدأ غير مراجَعة. عدّلوا النص أو علّموه مراجَعا إن كانت الترجمة صحيحة. التعديل يظهر في كل الشاشات فورا.", en: "Every entry starts unchecked. Edit it, or mark it checked if the translation is right. Changes show on every screen at once.", cat: "help" },
  "rk.dict.cat.label": { ar: "تسمية", en: "Label", cat: "label" },
  "rk.dict.cat.button": { ar: "زر", en: "Button", cat: "label" },
  "rk.dict.cat.status": { ar: "حالة", en: "Status", cat: "label" },
  "rk.dict.cat.menu": { ar: "قائمة", en: "Menu", cat: "label" },
  "rk.dict.cat.message": { ar: "رسالة", en: "Message", cat: "label" },
  "rk.dict.cat.field": { ar: "حقل", en: "Field", cat: "label" },
  "rk.dict.cat.help": { ar: "نص مساعدة", en: "Help text", cat: "label" },
  "rk.dict.cat.term": { ar: "مصطلح", en: "Term", cat: "label" },
};
