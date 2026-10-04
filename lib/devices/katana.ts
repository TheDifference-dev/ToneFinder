// Boss Katana Gen 3 (ve büyük ölçüde MkII) referansı.
// Kaynak: "Using BOSS TONE STUDIO for KATANA Gen3" (Roland, BTS_KTN3_SP_eng02_W.pdf) —
// efekt tipleri, modellediği pedallar ve parametre aralıkları.

export const KATANA_REFERENCE = `BOSS KATANA GEN 3 REFERENCE (from the BOSS TONE STUDIO for KATANA Gen3 parameter guide)

AMP SECTION (front panel): AMP TYPE = ACOUSTIC, CLEAN, PUSHED (Gen 3 only), CRUNCH, LEAD, BROWN, each with a VARIATION switch (MkII has no PUSHED).
Panel knobs are 0-10: GAIN, VOLUME, BASS, MIDDLE, TREBLE, plus BOOSTER/MOD, DELAY/FX and REVERB effect knobs. PRESENCE is set in BOSS TONE STUDIO (-50 to +50).
The amp types are BOSS's own voices, not licensed copies. Common reading (not official): CLEAN = clean solid-state/Fender-style, CRUNCH = British crunch, LEAD = high-gain lead, BROWN = high-gain "brown sound" (EVH style), PUSHED = between clean and crunch.

BOOSTER types (DRIVE 0-120, TONE -50 to +50, EFFECT LEVEL, DIRECT MIX in Tone Studio):
CLEAN BOOST, TREBLE BOOST, MID BOOST (good before the amp for solos), CRUNCH OD, BLUES DRIVE = BOSS BD-2, OVERDRIVE = BOSS OD-1, NATURAL OD, WARM OD,
TURBO OD = BOSS OD-2, T-SCREAM = Ibanez TS-808, DISTORTION, FAT DS, DST+ = MXR Distortion+, GUV DS = Marshall Guv'nor, RAT = ProCo RAT,
METAL ZONE = BOSS MT-2, METAL DS, '60S FUZZ = Fuzz Face, MUFF FUZZ = Electro-Harmonix Big Muff Pi, OCT FUZZ, HM-2 = BOSS HM-2, METAL CORE = BOSS ML-2, CENTA OD = Klon Centaur.

MOD/FX types: CHORUS, FLANGER, PHASER, UNI-V = Uni-Vibe, TREMOLO, VIBRATO, ROTARY, RING MOD, SLOW GEAR, SLICER,
COMP (BOSS COMP = BOSS CS-3, D-COMP = MXR Dyna Comp), LIMITER (RACK 160D = dbx 160X), T.WAH, AUTO WAH, PEDAL WAH (CRY WAH = Dunlop Cry Baby, VO WAH = Vox wah),
GRAPHIC EQ, PARAMETRIC EQ, GUITAR SIM, AC.GUITAR SIM, AC.PROCESSOR, WAVE SYNTH, OCTAVE, HEAVY OCTAVE, PITCH SHIFTER, HARMONIST, HUMANIZER,
PHASER 90E = MXR EVH-90 Phase 90, FLANGER117E = MXR EVH-117 Flanger, WAH 95E = Dunlop EVH-95 wah, DC-30 = Roland DC-30 chorus echo, PEDAL BEND.

DELAY / DELAY 2 types: DIGITAL, PAN, STEREO, ANALOG, TAPE ECHO, REVERSE, MODULATE, SDE-3000 = Roland SDE-3000.
Delay parameters: DELAY TIME 1-2000 ms, FEEDBACK 0-100, HIGH CUT 630 Hz-12.5 kHz/FLAT, EFFECT LEVEL 0-120, DIRECT MIX 0-100.

REVERB types: PLATE, ROOM, HALL, SPRING, MODULATE.
Other blocks: PEDAL FX (wah, pedal bend), EQ (PARAMETRIC EQ, GE-10 = BOSS GE-10 graphic EQ, placeable before or after the amp), NS (noise suppressor: THRESHOLD, RELEASE).
Cab / mic: the Katana has no cab or mic model selection; LINE OUT AIR FEEL (REC = distant mic, LIVE = close mic, BLEND, CUSTOM mic type/position) only affects the line/phones/USB output.

When giving settings, give the front-panel knob positions (0-10) and, for anything only reachable in BOSS TONE STUDIO, the Tone Studio value with its own range.`;
