import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { deviceReference } from "./devices";
import { ampProfileText, matchAmp } from "./amps";
import { AMP_MODES, matchDevice, PARTS, PICKUP_CONFIGS } from "./gear";
import { guitarProfileText, matchGuitar, pickupLayoutText } from "./guitars";
import { ToneResultSchema, type ToneEvent, type ToneRequest, type ToneResult } from "./schema";
import { PREFERRED_SOURCES } from "./sources";

const MODEL = "claude-opus-5-5";
const BETAS: Anthropic.Beta.AnthropicBeta[] = ["server-side-fallback-2026-07-01"];
const MAX_CONTINUATIONS = 5;

export class ToneError extends Error {}

type Emit = (event: ToneEvent) => void;

const RESEARCH_PROMPT = `You are a meticulous guitar tone researcher and studio engineer. You research a song's guitar tone on the web, then work out how to recreate it on the user's own gear - whatever amp, modeler, multi-FX, guitar and pedals they have. Your output is an internal research report that another step will turn into the final answer, so be thorough and concrete rather than polished.

Work in three phases.

PHASE 1 - The original rig for this exact song and part (if the user named a specific solo or section, research that one; a guitarist's rig often differs between the rhythm track and a solo). Find, with sources:
- Guitar model, which pickup (and pickup model, if known) was used for this part, tuning.
- Amp(s): exact model, channel, and any known settings.
- Cabinet and speakers.
- Microphones on the cab, their position (cap/edge/off-axis) and distance; room mics if relevant.
- Pedals and rack effects in signal order, with any known settings (wah position, delay times, etc.).
- Recording context: studio, producer/engineer, double-tracking, notable post-production.
- The song's tempo (BPM) and key, so delay times can be synced.
Search in English. Check these preferred sites first (fetch their pages directly where useful), then widen to interviews, rig rundowns, magazine articles and forums:
${PREFERRED_SOURCES.map((s) => `- ${s.name} (${s.url}): ${s.use}`).join("\n")}
For every claim, label it confirmed (a source states it), likely (strong indirect evidence, e.g. the artist's rig in that era) or guess. When sources disagree, say so.

PHASE 2 - Rebuild that tone with the user's own gear: their amp, their processor or multi-FX if they have one, and their pedals. Research what the user's gear can do: the amp's real channels, knobs and voicing; for a modeling amp or processor, its official model list, manual or a reliable forum list stating which real amp, pedal, cab and microphone each model is based on. If a verified model reference or a user amp profile is provided, use it as the source of truth for model, channel, mode and knob names. Follow "How the amp is used" strictly: it decides whether the core tone comes from the amp or from the processor. Decide how the pieces work together (e.g. processor into the amp's clean channel or effects return, or the amp's own drive with pedals in front) and say so. Use exact model, channel and knob names as they appear on the gear, and only parameters it really has. Cover the cab and mic as far as the gear allows; when it can't set something (e.g. mic distance), say how to approximate it.

PHASE 3 - Compensate for the guitar and use the user's pedals.
- Use the user's guitar and pickup profiles when given. Compare the original guitar and pickups with the user's (e.g. Les Paul humbuckers vs. Strat single-coils). Choose the pickup selector position on the user's guitar that gets closest, and adjust for the difference in output and frequency response: typically more gain and mids, less treble, a boost or overdrive in front, and a noise gate for single-coil hum when going from humbuckers to single-coils; the reverse when going from single-coils to humbuckers. State each adjustment and why.
- For each pedal the user owns, say whether to use it, where it goes in the chain and exactly how to set every knob; if it shouldn't be used, say so.

Finish with concrete starting settings for every block (0-10 knob values as plain numbers; times with units, synced to the song's tempo where relevant), guitar settings (selector position, volume and tone knobs), playing tips, and notes on any compromises. List every source URL you relied on.`;

const STRUCTURE_PROMPT = `You turn a guitar tone research report into the final structured answer for the user. Use only what the report supports; keep the report's confirmed/likely/guess labels and don't invent model names that aren't in it. Write all prose fields in Turkish. Keep gear model names, knob and parameter names exactly as they appear on the device or pedal (usually English).`;

function gearLine(label: string, text: string): string[] {
  if (!text) return [`- ${label}: none`];
  const device = matchDevice(text);
  return [`- ${label}: ${text}${device ? ` (known controls: ${device.controls})` : ""}`];
}

function describeRequest(req: ToneRequest): string {
  const part = PARTS.find((p) => p.id === req.part)?.label ?? req.part;
  const pickups = PICKUP_CONFIGS.find((p) => p.id === req.rig.pickups)?.label ?? req.rig.pickups;
  const amp = matchAmp(req.rig.amp);
  const guitar = matchGuitar(req.rig.guitar);
  const references = [req.rig.processor, req.rig.amp]
    .map((t) => matchDevice(t))
    .map((d) => d && deviceReference(d.id))
    .filter((r, i, all): r is string => Boolean(r) && all.indexOf(r) === i);

  return [
    `Song: ${req.song}`,
    `Artist: ${req.artist || "not given"}`,
    `Part (user's wording, Turkish): ${part}${req.partDetail ? ` - ${req.partDetail}` : ""}`,
    "",
    "User's gear:",
    ...gearLine("Amp", req.rig.amp),
    ...gearLine("Processor / multi-FX", req.rig.processor),
    `- How the amp is used: ${AMP_MODES.find((m) => m.id === req.rig.ampMode)?.prompt ?? req.rig.ampMode}`,
    `- Guitar: ${req.rig.guitar || "not given"}`,
    `- Pickup configuration: ${pickups}`,
    `- Pedals: ${req.rig.pedals ? req.rig.pedals.split(/\n|,/).map((p) => p.trim()).filter(Boolean).join("; ") : "none"}`,
    ...(amp ? ["", "<user_amp_profile>", ampProfileText(amp), "</user_amp_profile>"] : []),
    ...(guitar ? ["", "<user_guitar_profile>", guitarProfileText(guitar), "</user_guitar_profile>"] : []),
    "",
    "<user_pickups_profile>",
    pickupLayoutText(req.rig.pickups),
    "</user_pickups_profile>",
    ...references.flatMap((r) => ["", "<device_reference>", r, "</device_reference>"]),
  ].join("\n");
}

function collectSources(content: Anthropic.Beta.BetaContentBlock[], into: Map<string, string>) {
  for (const block of content) {
    if (block.type === "text") {
      for (const c of block.citations ?? []) {
        if (c.type === "web_search_result_location") into.set(c.url, c.title ?? c.url);
      }
    } else if (block.type === "web_fetch_tool_result" && block.content.type === "web_fetch_result") {
      into.set(block.content.url, block.content.content.title ?? block.content.url);
    }
  }
}

async function research(client: Anthropic, req: ToneRequest, emit: Emit) {
  const userMessage: Anthropic.Beta.BetaMessageParam = { role: "user", content: describeRequest(req) };
  const assistantContent: Anthropic.Beta.BetaContentBlock[] = [];
  const sources = new Map<string, string>();

  for (let i = 0; i <= MAX_CONTINUATIONS; i++) {
    const messages: Anthropic.Beta.BetaMessageParam[] = [userMessage];
    if (assistantContent.length > 0) {
      // pause_turn: aynı asistan turunu geri gönderince sunucu kaldığı yerden devam eder
      messages.push({ role: "assistant", content: assistantContent as Anthropic.Beta.BetaContentBlockParam[] });
    }

    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: BETAS,
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: RESEARCH_PROMPT,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: 12 },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: 8 },
      ],
      messages,
    });

    stream.on("contentBlock", (block) => {
      if (block.type !== "server_tool_use") return;
      const input = block.input as { query?: unknown; url?: unknown };
      if (block.name === "web_search" && typeof input.query === "string") emit({ type: "search", query: input.query });
      if (block.name === "web_fetch" && typeof input.url === "string") emit({ type: "fetch", url: input.url });
    });

    const message = await stream.finalMessage();
    if (message.stop_reason === "refusal") throw new ToneError("Bu istek için ton araştırması yapılamadı.");

    assistantContent.push(...message.content);
    collectSources(message.content, sources);
    if (message.stop_reason !== "pause_turn") break;
  }

  const report = assistantContent
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!report.trim()) throw new ToneError("Araştırma sonuç üretmedi, lütfen tekrar dene.");

  return { report, sources };
}

async function structure(client: Anthropic, req: ToneRequest, report: string, sources: Map<string, string>) {
  const sourceList = [...sources].map(([url, title]) => `- ${title}: ${url}`).join("\n");
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(ToneResultSchema) },
    system: STRUCTURE_PROMPT,
    messages: [
      {
        role: "user",
        content: `${describeRequest(req)}\n\n<research_report>\n${report}\n</research_report>\n\n<sources_consulted>\n${sourceList || "(none recorded)"}\n</sources_consulted>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new ToneError("Bu istek için ton önerisi üretilemedi.");
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new ToneError("Yanıt eksik geldi, lütfen tekrar dene.");
  }
  return response.parsed_output;
}

export async function findTone(client: Anthropic, req: ToneRequest, emit: Emit): Promise<ToneResult> {
  emit({ type: "status", message: "Orijinal ekipman ve cihaz modelleri araştırılıyor…" });
  const { report, sources } = await research(client, req, emit);
  emit({ type: "status", message: "Ayarlar senin cihazına göre düzenleniyor…" });
  return structure(client, req, report, sources);
}
