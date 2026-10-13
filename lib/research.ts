import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { readResearch, researchKey, writeResearch } from "./cache";
import { deviceReference } from "./devices";
import { ampProfileText, matchAmp } from "./amps";
import { AMP_MODES, matchDevice, PARTS, PICKUP_CONFIGS } from "./gear";
import { guitarProfileText, matchGuitar, pickupLayoutText } from "./guitars";
import { readGearProfile } from "./gear-profiles";
import { matchPedal, pedalProfileText } from "./pedals";
import { customPickupsText } from "./pickups";
import { z } from "zod";
import {
  AdaptedToneSchema,
  mergeTone,
  OriginalToneSchema,
  gearProfileText,
  GearProfileSchema,
  type GearProfile,
  type ToneEvent,
  type ToneMeta,
  type ToneRequest,
  type ToneResult,
} from "./schema";
import { PREFERRED_SOURCES } from "./sources";

const MODEL = "claude-opus-5-5";
const BETAS: Anthropic.Beta.AnthropicBeta[] = ["server-side-fallback-2026-07-01"];
const MAX_CONTINUATIONS = 5;

export class ToneError extends Error {}

type Emit = (event: ToneEvent) => void;

const ORIGINAL_PROMPT = `You are a meticulous guitar tone researcher and studio engineer. Research the ORIGINAL studio tone of one part of a song on the web. Another step will later adapt it to a specific user's gear, so do not discuss any user's gear here. Your output is an internal research report, so be thorough and concrete rather than polished.

Research, for this exact song and part (if a specific solo or section is named, research that one; a player's rig often differs between the rhythm track and a solo):
- The instrument: model, which pickup (and pickup model, if known) was used for this part, tuning.
- Amp(s): exact model, channel, and any known settings.
- Cabinet and speakers.
- Microphones on the cab, their position (cap/edge/off-axis) and distance; room mics if relevant.
- Pedals and rack effects in signal order, with any known settings (wah position, delay times, etc.).
- Recording context: studio, producer/engineer, double-tracking, notable post-production.
- Song profile: tempo (BPM), key, and the character of the tone in a few tags (e.g. tight low end, scooped mids, bright, compressed, saturated, roomy).
- Playing: the techniques this part needs (e.g. fast alternate picking, palm muting, legato, wide bends, vibrato, pinch harmonics) and how hard it is to play.
- The song's other guitar parts (e.g. clean intro, main riff, solo, outro) and how their tone differs from this part (channel, gain, pickup, effects), so they can be given as changes from this tone.
Search in English. Check these preferred sites first (fetch their pages directly where useful), then widen to interviews, rig rundowns, magazine articles and forums:
${PREFERRED_SOURCES.map((s) => `- ${s.name} (${s.url}): ${s.use}`).join("\n")}
For every claim, label it confirmed (a source states it), likely (strong indirect evidence, e.g. the player's rig in that era) or guess. When sources disagree, say so. List every source URL you relied on.`;

const ADAPT_PROMPT = `You are a meticulous guitar tone engineer. You get a research report on the ORIGINAL studio tone of a song part and a description of the user's own gear. Work out how to recreate that tone on the user's gear. Your output is an internal report that another step will turn into the final answer, so be thorough and concrete rather than polished.

1. The user's gear. Learn what it can do: the amp's real channels, knobs and voicing; for a modeling amp, processor or amp-sim software, the official model list or manual stating which real amp, pedal, cab and microphone each model is based on. If a verified model reference or a user amp, guitar or pedal profile is provided, it is the source of truth for model, channel, mode and knob names; search the web only for what it doesn't cover. Follow "How the amp is used" strictly: it decides whether the core tone comes from the amp or from the processor. Decide how the pieces work together (e.g. processor into the amp's clean channel or effects return, or the amp's own drive with pedals in front) and say so. Use exact model, channel and knob names as they appear on the gear, and only controls it really has. Use the amp's built-in effects only if they are listed as available. Cover the cab and mic as far as the gear allows; when it can't set something (e.g. mic distance), say how to approximate it.

2. The instrument. Use the user's guitar and pickup profiles when given. Compare the original instrument and pickups with the user's (e.g. Les Paul humbuckers vs. Strat single-coils). Choose the pickup selector position that gets closest, and adjust for the difference in output and frequency response: typically more gain and mids, less treble, a boost or overdrive in front, and a noise gate for single-coil hum when going from humbuckers to single-coils; the reverse when going from single-coils to humbuckers. State each adjustment and why.

3. The user's pedals. For each pedal, say whether to use it, where it goes in the chain and exactly how to set every knob it has (use its profile's control names); if it shouldn't be used, say so.

For each block, also say whether it is the same gear as the original (or a model of it), a close relative, or a substitute; which factory preset, channel memory or amp type to load first, but only if the device reference, profile or a source supports it; and which of the device's controls to leave alone or switch off for this tone, and why. If the original research lists other guitar parts of the song, give for each only the settings that change from the main tone.

Finish with concrete starting settings for every block (0-10 knob values as plain numbers; times with units, synced to the song's tempo where relevant), the guitar's selector position and volume/tone knobs, and playing tips. For every setting, say what it rests on: cited (a device reference, profile, manual or reliable source supports it directly), inferred (worked out from the original tone and how the device works) or check (uncertain; verify by ear). Also give: an honest estimate (0-100) of how close this gear can get to the original and why, what it cannot capture (limitations), and alternative approaches. List every source URL you relied on.`;

const STRUCTURE_ORIGINAL_PROMPT = `You turn a research report on a song's original studio guitar tone into a structured record. Use only what the report supports; keep its confirmed/likely/guess labels and don't invent gear. Put disputed or weakly sourced points in warnings. Write all prose fields in Turkish. Keep gear model, knob and parameter names exactly as they appear on the gear (usually English).`;

const STRUCTURE_ADAPT_PROMPT = `You turn a report on adapting a song's original guitar tone to the user's gear into the final structured answer. Use only what the report supports; keep its cited/inferred/check labels and don't invent model or knob names that aren't in it or in the gear profiles. The match percent is an estimate; never present it as a measurement. Write all prose fields in Turkish. Keep gear model, knob and parameter names exactly as they appear on the device or pedal (usually English).`;

const NO_AMP_PROMPT =
  "No guitar amp: the processor or amp-sim software (e.g. AmpliTube) feeds an audio interface, headphones or studio monitors, so the whole tone (amp, cab/IR with mics, effects) comes from it with cab simulation on.";

function gearLine(label: string, text: string): string[] {
  if (!text) return [`- ${label}: none`];
  const device = matchDevice(text);
  return [`- ${label}: ${text}${device ? ` (known controls: ${device.controls})` : ""}`];
}

function pedalList(req: ToneRequest): string[] {
  return req.rig.pedals
    .split(/\n|,/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Orijinal araştırmanın girdisi: yalnız şarkı ve bölüm (kullanıcının ekipmanından bağımsız) */
function describeSong(req: ToneRequest): string {
  const part = PARTS.find((p) => p.id === req.part)?.label ?? req.part;
  return [
    `Song: ${req.song}`,
    `Artist: ${req.artist || "not given"}`,
    `Instrument: ${req.instrument === "bass" ? "bass guitar" : "electric guitar"}`,
    `Part (user's wording, Turkish): ${part}${req.partDetail ? ` - ${req.partDetail}` : ""}`,
    `Tone type: ${TONE_TYPE_PROMPTS[req.toneType]}`,
  ].join("\n");
}

const TONE_TYPE_PROMPTS: Record<ToneRequest["toneType"], string> = {
  auto: "decide from the recording (clean, edge of breakup or distorted)",
  clean: "the user wants the clean tone of this part",
  distorted: "the user wants the distorted tone of this part",
};

/** Katalogda olmayan ekipman için daha önce "Web'de tanıt" ile kaydedilmiş profiller */
async function webProfiles(req: ToneRequest): Promise<string[]> {
  const unknown = [
    !matchAmp(req.rig.amp) && !matchDevice(req.rig.amp) ? req.rig.amp : "",
    !matchDevice(req.rig.processor) ? req.rig.processor : "",
    !matchGuitar(req.rig.guitar) ? req.rig.guitar : "",
    ...pedalList(req).filter((p) => !matchPedal(p)),
  ].filter((n) => n.trim() && !/^(yok|none|-)$/i.test(n.trim()));
  const profiles = await Promise.all(unknown.map((n) => readGearProfile(n)));
  return profiles.filter((p): p is NonNullable<typeof p> => Boolean(p?.exists)).map(gearProfileText);
}

/** Uyarlamanın girdisi: kullanıcının ekipmanı ve profilleri */
async function describeGear(req: ToneRequest): Promise<string> {
  const pickups = PICKUP_CONFIGS.find((p) => p.id === req.rig.pickups)?.label ?? req.rig.pickups;
  const amp = matchAmp(req.rig.amp);
  const guitar = matchGuitar(req.rig.guitar);
  const pedals = pedalList(req);
  const pedalProfiles = pedals
    .map((p) => matchPedal(p))
    .filter((p, i, all): p is NonNullable<typeof p> => Boolean(p) && all.indexOf(p) === i)
    .map(pedalProfileText);
  const references = [req.rig.processor, req.rig.amp]
    .map((t) => matchDevice(t))
    .map((d) => d && deviceReference(d.id))
    .filter((r, i, all): r is string => Boolean(r) && all.indexOf(r) === i);

  return [
    "User's gear:",
    ...gearLine("Amp", req.rig.amp),
    ...gearLine("Processor / multi-FX / amp-sim software", req.rig.processor),
    `- How the amp is used: ${req.rig.amp ? (AMP_MODES.find((m) => m.id === req.rig.ampMode)?.prompt ?? req.rig.ampMode) : NO_AMP_PROMPT}`,
    ...(req.rig.amp
      ? [`- Amp's built-in effects available: ${req.rig.ampEffects.length ? req.rig.ampEffects.join(", ") : "none listed"}`]
      : []),
    `- ${req.instrument === "bass" ? "Bass" : "Guitar"}: ${req.rig.guitar || "not given"}`,
    `- Pickup configuration: ${pickups}`,
    ...(customPickupsText(req.rig.pickupModels) ? ["- Non-stock pickups:", customPickupsText(req.rig.pickupModels)] : []),
    `- Pedals: ${pedals.length ? pedals.join("; ") : "none"}`,
    ...(amp ? ["", "<user_amp_profile>", ampProfileText(amp), "</user_amp_profile>"] : []),
    ...(guitar ? ["", "<user_guitar_profile>", guitarProfileText(guitar), "</user_guitar_profile>"] : []),
    "",
    "<user_pickups_profile>",
    pickupLayoutText(req.rig.pickups),
    "</user_pickups_profile>",
    ...pedalProfiles.flatMap((p) => ["", "<user_pedal_profile>", p, "</user_pedal_profile>"]),
    ...references.flatMap((r) => ["", "<device_reference>", r, "</device_reference>"]),
    ...(await webProfiles(req)).flatMap((p) => ["", "<user_gear_profile>", p, "</user_gear_profile>"]),
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

interface WebLimits {
  searches: number;
  fetches: number;
}

/** Web araması ve sayfa okuma açıkken bir rapor yazdırır (pause_turn ile devam eder) */
async function researchReport(client: Anthropic, system: string, content: string, limits: WebLimits, emit: Emit) {
  const userMessage: Anthropic.Beta.BetaMessageParam = { role: "user", content };
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
      system,
      tools: [
        { type: "web_search_20260209", name: "web_search", max_uses: limits.searches },
        { type: "web_fetch_20260209", name: "web_fetch", max_uses: limits.fetches },
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

async function structured<T extends z.ZodType>(client: Anthropic, schema: T, system: string, content: string): Promise<z.infer<T>> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: BETAS,
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "refusal") throw new ToneError("Bu istek için ton önerisi üretilemedi.");
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new ToneError("Yanıt eksik geldi, lütfen tekrar dene.");
  }
  return response.parsed_output as z.infer<T>;
}

const sourceList = (sources: Iterable<[string, string]>) =>
  [...sources].map(([url, title]) => `- ${title}: ${url}`).join("\n") || "(none recorded)";

export async function findTone(
  client: Anthropic,
  req: ToneRequest,
  emit: Emit,
  previous?: unknown,
): Promise<{ result: ToneResult; meta: ToneMeta }> {
  const key = researchKey([req.song, req.artist, req.part, req.partDetail, req.instrument, req.toneType]);
  let original = req.fresh ? null : await readResearch(key);
  const cached = original !== null;

  if (original) {
    emit({ type: "status", message: "Bu şarkının orijinal ton araştırması kayıtlı, yeniden kullanılıyor…" });
  } else {
    emit({ type: "status", message: "Orijinal stüdyo ekipmanı araştırılıyor…" });
    const { report, sources } = await researchReport(client, ORIGINAL_PROMPT, describeSong(req), { searches: 12, fetches: 8 }, emit);
    original = { report, sources: [...sources], researchedAt: Date.now() };
  }
  if (!original.structured) {
    emit({ type: "status", message: "Orijinal ton özetleniyor…" });
    original.structured = await structured(
      client,
      OriginalToneSchema,
      STRUCTURE_ORIGINAL_PROMPT,
      `${describeSong(req)}\n\n<research_report>\n${original.report}\n</research_report>\n\n<sources_consulted>\n${sourceList(original.sources)}\n</sources_consulted>`,
    );
    await writeResearch(key, original);
  }
  const meta: ToneMeta = { cached, researchedAt: original.researchedAt };
  emit({ type: "original", original: original.structured, meta });

  emit({
    type: "status",
    message: req.feedback ? "Geri bildirimine göre ayarlar yeniden düzenleniyor…" : "Ton senin ekipmanına uyarlanıyor…",
  });
  const feedback = req.feedback
    ? [
        "",
        "<user_feedback>",
        "The user tried the previous settings on their gear and says (Turkish):",
        req.feedback,
        "Revise the adaptation to address this, keep what worked, and say what you changed and why.",
        "</user_feedback>",
        ...(previous ? ["", "<previous_result>", JSON.stringify(previous).slice(0, 15000), "</previous_result>"] : []),
      ]
    : [];
  const gear = await describeGear(req);
  const originalBlock = `<original_research>\n${original.report}\n</original_research>\n\n<original_summary>\n${JSON.stringify(original.structured)}\n</original_summary>`;
  const adaptation = await researchReport(
    client,
    ADAPT_PROMPT,
    [describeSong(req), "", gear, "", originalBlock, ...feedback].join("\n"),
    { searches: 6, fetches: 4 },
    emit,
  );

  emit({ type: "status", message: "Sonuç hazırlanıyor…" });
  const adapted = await structured(
    client,
    AdaptedToneSchema,
    STRUCTURE_ADAPT_PROMPT,
    [
      describeSong(req),
      "",
      gear,
      "",
      `<original_summary>\n${JSON.stringify(original.structured)}\n</original_summary>`,
      "",
      `<adaptation_report>\n${adaptation.report}\n</adaptation_report>`,
      "",
      `<sources_consulted>\n${sourceList(adaptation.sources)}\n</sources_consulted>`,
    ].join("\n"),
  );
  return { result: mergeTone(original.structured, adapted), meta };
}

const GEAR_PROMPT = `You identify a piece of music gear (guitar amp, bass amp, modeler/multi-FX, amp-sim software, guitar, bass or pedal) from the name a user typed. Search the web for the manufacturer's product page or manual first, then reliable retailers or reviews. Decide whether a real product with this name exists or existed; if the name is ambiguous, pick the most likely product and say so. If no such product exists, say so plainly - never invent one. For a real product report: exact name, what it is, its channels/amp types/modes (or pickup layout for an instrument), every front-panel control and switch as printed on the device, built-in effects, and anything that matters for dialing in tones (effects loop, stereo input, active pickups...). List the source URLs.`;

const STRUCTURE_GEAR_PROMPT = `Turn a gear research report into a structured profile. Use only what the report supports. Write summary and notes in Turkish; keep control and mode names exactly as printed on the device. If the report says no such product exists, set exists to false.`;

/** "Web'de tanıt": katalogda olmayan bir ekipmanı web'de araştırıp profil çıkarır */
export async function identifyGear(client: Anthropic, name: string, kind: GearProfile["kind"]): Promise<GearProfile> {
  const { report, sources } = await researchReport(
    client,
    GEAR_PROMPT,
    `Gear name as typed by the user: ${name}\nThe user entered it as: ${kind}`,
    { searches: 5, fetches: 3 },
    () => {},
  );
  const profile = await structured(
    client,
    GearProfileSchema,
    STRUCTURE_GEAR_PROMPT,
    `Name typed: ${name}\nKind: ${kind}\n\n<research_report>\n${report}\n</research_report>\n\n<sources_consulted>\n${sourceList(sources)}\n</sources_consulted>`,
  );
  return { ...profile, identifiedAt: Date.now() };
}
