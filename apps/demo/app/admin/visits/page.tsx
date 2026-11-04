import { cookies } from "next/headers";
import { listVisits } from "@/lib/visits";
import { personaById } from "@/content/personas";

export const dynamic = "force-dynamic";

const EVENT: Record<string, [string, string]> = {
  code_ok: ["Access code entered", "bg-ok-soft text-ok"],
  wrong_code: ["Wrong code", "bg-danger-soft text-danger"],
  role: ["Role chosen", "bg-soft text-brand-deep"],
};
function device(ua?: string | null) {
  if (!ua) return "—";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const br = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : /bot|crawl|spider|preview|WhatsApp|Telegram|Slack/i.test(ua) ? "Bot / preview" : "Other";
  const kind = /Mobi|iPhone|Android(?!.*Tablet)/.test(ua) ? "Mobile" : /iPad|Tablet/.test(ua) ? "Tablet" : "Desktop";
  return `${kind} · ${os} · ${br}`;
}

export default async function Visits({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const owner = (await cookies()).get("tt_owner")?.value;
  const ok = !!process.env.OWNER_CODE && owner === process.env.OWNER_CODE;
  const { e } = await searchParams;
  if (!ok) {
    return (
      <div dir="ltr" className="grid min-h-screen place-items-center bg-navy p-4">
        <form action="/api/owner" method="post" className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
          <h1 className="mb-1 text-[18px] font-extrabold text-navy">Visit log</h1>
          <p className="mb-4 text-[13px] text-muted">Owner key required.</p>
          <input name="key" type="password" autoFocus className="w-full rounded-md border border-line px-3 py-2" placeholder="OWN-XXXX-XXXX" />
          {e && <p className="mt-2 text-[12px] text-danger">Wrong key.</p>}
          <button className="mt-4 w-full rounded-md bg-brand py-2 font-bold text-white">Open</button>
        </form>
      </div>
    );
  }
  const rows = await listVisits();
  return (
    <div dir="ltr" className="min-h-screen bg-canvas p-6">
      <h1 className="text-[22px] font-extrabold text-navy">Visit log</h1>
      <p className="mb-4 text-[13px] text-muted">{rows.length} events · newest first · times in Libya time (UTC+2)</p>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full text-[13px]">
          <thead className="bg-soft text-start text-navy"><tr>{["Time", "Event", "Role", "IP", "Country", "City", "Device", "User agent"].map((h) => <th key={h} className="px-3 py-2 text-start font-bold whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const ev = EVENT[r.event] ?? [r.event, ""];
              return (
                <tr key={r.id} className="border-t border-line align-top">
                  <td className="px-3 py-2 whitespace-nowrap num">{r.at ? new Date(r.at).toLocaleString("en-GB", { timeZone: "Africa/Tripoli" }) : "—"}</td>
                  <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[12px] font-bold whitespace-nowrap ${ev[1]}`}>{ev[0]}</span></td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.persona ? personaById(r.persona)?.id ?? r.persona : "—"}</td>
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{r.ip ?? "—"}</td>
                  <td className="px-3 py-2">{r.country ?? "—"}{r.region ? ` / ${r.region}` : ""}</td>
                  <td className="px-3 py-2">{r.city ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{device(r.ua)}</td>
                  <td className="max-w-[360px] px-3 py-2 text-[11px] break-all text-muted">{r.ua ?? "—"}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={8} className="px-3 py-6 text-center text-muted">No visits yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
