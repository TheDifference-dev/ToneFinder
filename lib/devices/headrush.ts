// HeadRush model adları ve taklit ettikleri gerçek ekipmanlar.
// Kaynaklar:
// - RobyRocks "HeadRush Models List" (firmware 2.1.1, 12.10.2019)
// - HeadRush Pedalboard firmware release notes v2.3.1–v2.7 (inMusic)
// - HeadRush Core User Guide v1.0 (cab block parametreleri)
// - headrushfx.com ürün sayfaları ve firmware duyuruları (2.4, 2.5 eklemeleri)
// HeadRush Core, Prime, Flex Prime, Pedalboard, Gigboard ve MX5 aynı HeadRush
// model kütüphanesini paylaşır; Core/Prime ayrıca ReValver modellerini içerir.

export const HEADRUSH_REFERENCE = `HEADRUSH MODEL REFERENCE (model name on device = real gear it is based on; entries marked (likely) are inferred from the model name, the rest come from published lists)

AMPS
59 TWEED BASS = Fender '59 Bassman | 59 TWEED DELUXE = Fender Tweed Deluxe | 59 DELUXE GAIN MOD = Fender Tweed Deluxe (gain mod) | 59 TWEED PRINCE = Fender '59 Princeton
64 BLACK LUX NORM = Fender Deluxe Reverb (Normal) | 64 BLACK LUX VIB = Fender Deluxe Reverb (Vibrato) | 64 BLACK VIB = Fender Vibroverb
65 BLACK MINI = Fender Champ | 65 BLACK PRINCE = Fender Princeton | 65 BLACK PRINCE REV = Fender Princeton Reverb | 65 BLACK SR = Fender Super Reverb (blackface)
67 BLACK DUO = Fender Twin Reverb (blackface) | 67 BLACK SHIMMER = Fender Dual Showman
66 AC HI BOOST = Vox AC30 Top Boost | 66 AC HI BOOST MOD = Vox AC30 Top Boost (mod)
66 FLIP BASS = Ampeg Portaflex B-15N | BLUE LINE BASS = Ampeg SVT | 69 BLUE LINE SCOOP = Ampeg SVT (scooped)
65 J45 = Marshall JTM45 | 67 PLEXIGLAS VARI = Marshall Super Lead Plexi (variac mod) | 68 PLEXI EL84 MOD = Marshall Super Lead Plexi (tube mod)
68 PLEXIGLAS 100W = Marshall Super Lead Plexi 100W | 68 PLEXIGLAS 50W = Marshall Super Lead Plexi 50W
82 LEAD 800 100W = Marshall JCM800 100W | 82 LEAD 800 50W = Marshall JCM800 50W | 82 LEAD 800 BASS MOD = Marshall JCM800 (bass mod) | 82 LEAD 800 BRIGHT = Marshall JCM800 (bright) | 82 LEAD 800 TS MOD = Marshall JCM800 with Tube Screamer mod
M-2 LEAD = Mesa/Boogie Mark IIC+ (drive) | 85 M-2 LEAD CAP MOD = Mesa/Boogie Mark IIC+ (coupling cap mod)
92 TREADPLATE MODERN / RAW / VINTAGE = Mesa/Boogie Dual Rectifier (Modern / Raw / Vintage)
93 MS30 = Matchless 30W (source lists "Matchless MS30"; DC-30 style, likely)
99 PV51 II CLEAN / CRUNCH / LEAD = Peavey 5150 II (clean / crunch / lead)
RB-01B GREEN / BLUE / RED = Bogner Ecstasy 101B (green / blue / red channel)
SL-100 CLEAN / CRUNCH / DRIVE = Soldano SLO-100 | 89 SL-100 EXT RANGE = Soldano SLO-100 (extended)
'05 TANGERINE 30 CH1 / CH2 = Orange 30-watt two-channel head (likely), channel 1 / 2
11 EPB II CLEAN / CRUNCH / LO-LEAD / HI-LEAD = ENGL Powerball II (2011), its four channels
84 J-120H = Roland JC-120 (head) | 83 400R = Gallien-Krueger 800RB (bass) | 17 TRACE ELLIOT ELF = Trace Elliot ELF (bass)

CABS (Cab Type)
1X8 CUSTOM = Fender Champ | 1X12 BLACK PANEL LUX = Fender Deluxe Reverb (Jensen P12N) | 1X12 TWEED LUX = Fender Tweed Deluxe (Jensen P12Q)
1X15 OPEN BACK = Ampeg Reverberocket (Jensen C15N) | 2X12 AC BLUE = Vox AC30 (Celestion Alnico Blue) | 2X12 BLACK PANEL DUO = Fender Twin Reverb (Jensen C12N)
2X12 B30 = Bogner 2x12 (Celestion V30) | 2X12 SILVER CONE = Roland JC-120 | 4X10 TWEED BASS = Fender '59 Bassman (Jensen P10Q) | 4X10 BLACK SR = Fender Super Reverb (CTS Alnico)
4X12 CLASSIC 30W = Marshall 1960AV (Celestion V30) | 4X12 65W = Marshall 4x12 (Celestion G12-65) | 4X12 GREEN 25W = Marshall 1960A (Celestion G12H Greenback) | 4X12 GREEN 20W = Marshall 4x12 (Celestion G12M Greenback)
8X10 BLUE LINE = Ampeg SVT 8x10

CAB MICS (Mic Type)
DYN 7 = Shure SM7 | DYN 57 = Shure SM57 | DYN 409 = Sennheiser MD409 | DYN 421 = Sennheiser MD421 | DYN 20 = Electro-Voice RE20 | DYN 12 = AKG D112
COND 67 = Neumann U67 | COND 87 = Neumann U87 | COND 414 = AKG C414 XLS | RIBBON 121 = Royer R-121

CAB BLOCK PARAMETERS (HeadRush Core user guide): Cab Type, Mic Type, Break Up, On-Axis (On = center of the speaker, brighter / Off = angled off-center, darker), Out Gain, Amp Gain.
There is NO mic distance parameter. Approximate the original mic distance with On/Off-Axis, Break Up, an EQ block after the cab, or an IR. Dual cabs (2X Cab) and dual IRs (2X IR) are available to blend two mics.

HEADRUSH IRs (IR block)
60S412V = Marshall 1960AV (Celestion V30) | 60S412A = Marshall 1960A (Celestion T75) | TREAD412 / TREAD212 = Mesa Rectifier 4x12 / 2x12 (V30)
TANGERINE412 = Orange PPC412 (V30) | TANERINE212OB = Orange PPC212 open back (V30) | FAWN212 = Vox AC30 (Alnico Blue) | TWIN212OB = Fender Twin Reverb open back (Jensen C12K)
JR112 = Fender Blues Junior | WHITEMOON112C / 112OB = Blackstar HT112 closed / open back | BLACKLINE810 = Ampeg SVT 8x10 | BIRCH115 / BIRCH410 = Orange OBC115 / OBC410 | MKBASS212 = Markbass 2x12

DRIVE / DISTORTION / FUZZ
WHITE BOOST = Xotic RC Booster | GREEN JRC-OD = Ibanez TS808 Tube Screamer | S1 DRIVE = Boss SD-1 | K DRIVE = Klon Centaur | ANXIETY OD (V2) = Fulltone OCD
D250 DRIVE = DOD Overdrive Preamp 250 | BLACK OP = ProCo RAT | D1 DIST = Boss DS-1 | MX DIST = MXR Distortion+ (likely) | DC DISTORT = Avid Eleven Rack custom distortion
TRI FUZZ = Electro-Harmonix Big Muff Pi | ROUND FUZZ = Dunlop Fuzz Face | OCT FUZZ = Dunlop JHC-01 Octavio | B DIST 7000 = bass preamp/distortion | 8-BIT CRUSH = original

DYNAMICS / EQ
GREY COMP = Ross Compressor | DYN111 COMP = Avid Dynamics III compressor | SIDE COMP = Avid Dynamics compressor | GATE = Rocktron Hush style gate | NOISE FILTER = original noise gate
GRAPHIC EQ, PARA EQ, BASS EQ, TEN FREQ EQ = EQ blocks | AUTO SWELL = Digitech Crescendo style | ACOUSTIC PRE = acoustic preamp | HOLD = freeze/hold

MODULATION
CHORUS = Boss CE-1 (chorus) | VIBRATO = Boss CE-1 (vibrato) | DIM CHORUS = Roland Dimension-style chorus (likely) | MULTICHORUS = Avid AIR Multi-Chorus
FLANGER = TC Electronic Thunderstorm style | AIR FLANGER, AIR VIBRATO, AIR FILTER = Pro Tools AIR plug-ins
VIBE PHASER = Shin-ei Uni-Vibe | ORANGE PHASER = MXR Phase 90 | TRON PHASER = Mu-Tron Phasor II | STONE PHASER = EHX Small Stone
ROTARY = rotary speaker | TREMOLO = Boss TR-2 style | OCTAVE PEDAL = Boss OC-2 | TRON FILTER / ENV FILTER = Mu-Tron III envelope filter
RING MOD = Moog ring modulator style | DROP TUNE = Digitech Drop style | SMART HARM = intelligent harmonizer | DETUNE, OCTAVES UP, ACOUST SIM

REVERB / DELAY
TAPE ECHO = Maestro Echoplex EP-3 | BBD DELAY = EHX Deluxe Memory Man | DYN DELAY = AIR Dynamic Delay | AIR DELAY = AIR Delay
REV DELAY = Boss DD-5 reverse style | PIT DELAY = Boss PS-3 pitch delay style | RESO DELAY | STEREO DOUBLER
SPRING REVERB = Fender spring reverb | AIR REVERB | ELEVEN REVERB = Avid Reverb One | AMBI VERB | SHIMMER | PARTY VERB

EXPRESSION
VOLUME = Ernie Ball volume | SHINE WAH = Vox V846 | BLACK WAH = Dunlop Cry Baby | MORE WAH = Morley wah | WHITE BASS WAH
WHAM = Digitech Whammy | HARM = Whammy harmony mode | CHORD WHAM = Whammy polyphonic | TIME WARP = Digitech Space Station warp | FEED BACK = feedbacker | PANNER

REVALVER LIBRARY (Core / Prime only, in addition to the above)
Amps include: Peavey 6505, Peavey 6505+, Peavey Triple XXX II, Peavey 3120, Peavey Classic 30, Peavey Masterpiece 50, Peavey Sensation 20, GK400RB (Gallien-Krueger 400RB), Budda Superdrive II, Budda Superdrive V20, BluesMaker, Basic 100, ACM 900, ACT Combo, ANGEL PB II, Demon, Flathill, Fox AC30, Hangar 18, J120H, Redhot AD30TC, plus ReValver versions of the HeadRush amps.
For ReValver models other than the Peavey and GK ones, verify what they are based on by searching before relying on them. Core also loads Neural Amp Modeler (NAM) captures and its own clones, and ships Choptones IRs.

The model names above may be shortened on screen; newer firmware may add models not listed here.`;
