/* =========================================================
   VERDÉ — conținutul platformei
   Tot ce se schimbă des (plante, pachete, contact) stă aici.
   ========================================================= */

window.VERDE = {};

/* ---------- Setări ---------- */
VERDE.settings = {
  /* Adresa la care ajung cererile. ÎNLOCUIEȘTE înainte de lansare. */
  email: "contact@verde-oradea.ro",
  phone: "",            /* ex. "+40 7xx xxx xxx" — lasă gol dacă nu vrei să apară */
  city: "Oradea",
  /* Opțional: adresa unui formular Formspree (https://formspree.io/f/xxxx).
     Dacă e completată, cererile se trimit automat. Dacă e goală, se deschide emailul vizitatorului. */
  formEndpoint: ""
};

/* ---------- Catalogul de plante ----------
   light:  ce lumină suportă  -> "low" | "medium" | "bright"
   size:   "small" (blat, raft) | "medium" (pardoseală, colț) | "large" (piesă centrală)
   cool:   rezistă la 10–16 °C        drafts: rezistă la curent
   styles: "minimal" | "luxuriant" | "elegant"
   petSafe: netoxică pentru pisici și câini (după lista ASPCA)
   art:    cum e desenată ilustrația (nu modifica dacă nu adaugi un tip nou) */
VERDE.plants = [
  { id: "zz", name: "Zamioculcas", latin: "Zamioculcas zamiifolia", art: "pinnate", pot: "stone",
    light: ["low", "medium", "bright"], size: "medium", cool: false, drafts: true, petSafe: false,
    styles: ["minimal", "elegant"], height: "50–90 cm", water: "la 2–3 săptămâni", temp: "15–26 °C",
    note: "Frunze lucioase, crește lent și rezistă la udări rare. Una dintre cele mai sigure alegeri pentru birouri." },
  { id: "sansevieria", name: "Sansevieria", latin: "Dracaena trifasciata", art: "sword", pot: "cream",
    light: ["low", "medium", "bright"], size: "small", cool: true, drafts: true, petSafe: false,
    styles: ["minimal"], height: "40–80 cm", water: "la 2–4 săptămâni", temp: "12–29 °C",
    note: "Formă verticală, curată. Ocupă puțin loc pe blat sau pe pervaz și suportă aproape orice condiții." },
  { id: "aspidistra", name: "Aspidistra", latin: "Aspidistra elatior", art: "broad", pot: "charcoal",
    light: ["low", "medium"], size: "medium", cool: true, drafts: true, petSafe: true,
    styles: ["minimal", "elegant"], height: "50–80 cm", water: "la 1–2 săptămâni", temp: "7–24 °C",
    note: "Planta potrivită pentru holuri și intrări: suportă frig, curent și colțuri cu lumină slabă." },
  { id: "pothos", name: "Pothos", latin: "Epipremnum aureum", art: "trail", pot: "terracotta",
    light: ["low", "medium"], size: "small", cool: false, drafts: false, petSafe: false,
    styles: ["luxuriant"], height: "cascadă 30–60 cm", water: "săptămânal", temp: "17–29 °C",
    note: "Curgătoare, bună pentru rafturi, bar sau ghivece suspendate. Arată plin repede." },
  { id: "kentia", name: "Palmier Kentia", latin: "Howea forsteriana", art: "palm", pot: "stone",
    light: ["low", "medium"], size: "large", cool: true, drafts: false, petSafe: true,
    styles: ["elegant"], height: "150–220 cm", water: "la 10–14 zile", temp: "12–26 °C",
    note: "Palmierul clasic din lobby-urile de hotel. Tolerează lumina redusă mai bine decât alți palmieri." },
  { id: "monstera", name: "Monstera", latin: "Monstera deliciosa", art: "split", pot: "cream",
    light: ["medium", "bright"], size: "large", cool: false, drafts: false, petSafe: false,
    styles: ["luxuriant"], height: "100–160 cm", water: "la 7–10 zile", temp: "18–27 °C",
    note: "Frunze mari, decupate. Dă imediat un aer tropical unei cafenele sau unei zone lounge." },
  { id: "lyrata", name: "Ficus lyrata", latin: "Ficus lyrata", art: "fiddle", pot: "charcoal",
    light: ["bright"], size: "large", cool: false, drafts: false, petSafe: false,
    styles: ["elegant", "luxuriant"], height: "140–200 cm", water: "la 7–10 zile", temp: "16–26 °C",
    note: "Piesă de impact pentru showroom-uri și recepții luminoase. Are nevoie de un loc stabil, ferit de curent." },
  { id: "spathiphyllum", name: "Spathiphyllum", latin: "Spathiphyllum wallisii", art: "lily", pot: "stone",
    light: ["low", "medium"], size: "medium", cool: false, drafts: false, petSafe: false,
    styles: ["elegant"], height: "50–80 cm", water: "la 5–7 zile", temp: "18–27 °C",
    note: "Înflorește alb de mai multe ori pe an. Potrivit pentru recepții, clinici și saloane." },
  { id: "chamaedorea", name: "Palmier de salon", latin: "Chamaedorea elegans", art: "smallpalm", pot: "terracotta",
    light: ["low", "medium"], size: "medium", cool: false, drafts: false, petSafe: true,
    styles: ["luxuriant", "elegant"], height: "60–100 cm", water: "la 7–10 zile", temp: "16–27 °C",
    note: "Palmier compact, bun pentru colțuri de birou și mese de așteptare." },
  { id: "strelitzia", name: "Strelitzia", latin: "Strelitzia nicolai", art: "paddle", pot: "cream",
    light: ["bright"], size: "large", cool: false, drafts: false, petSafe: false,
    styles: ["luxuriant"], height: "150–220 cm", water: "la 7–10 zile", temp: "18–27 °C",
    note: "Frunze late, înalte, cu efect de grădină tropicală. Cere lumină multă, aproape de vitrine." },
  { id: "olea", name: "Măslin", latin: "Olea europaea", art: "olive", pot: "terracotta",
    light: ["bright"], size: "medium", cool: true, drafts: true, petSafe: true,
    styles: ["minimal", "elegant"], height: "100–160 cm", water: "la 7–10 zile", temp: "5–25 °C",
    note: "Aspect mediteranean, argintiu. Merge doar lângă geamuri foarte luminoase sau în zone semi-exterioare." },
  { id: "rhapis", name: "Palmier evantai", latin: "Rhapis excelsa", art: "fan", pot: "charcoal",
    light: ["low", "medium"], size: "large", cool: true, drafts: true, petSafe: true,
    styles: ["elegant"], height: "120–180 cm", water: "la 7–10 zile", temp: "10–27 °C",
    note: "Palmier dens, rezistent la temperaturi mai scăzute. Bun pentru separarea zonelor." },
  { id: "xanadu", name: "Philodendron Xanadu", latin: "Thaumatophyllum xanadu", art: "lobed", pot: "stone",
    light: ["medium", "bright"], size: "medium", cool: false, drafts: false, petSafe: false,
    styles: ["luxuriant"], height: "50–80 cm", water: "la 7–10 zile", temp: "18–27 °C",
    note: "Formă bogată și compactă, umple bine jardinierele joase." },
  { id: "fragrans", name: "Dracena", latin: "Dracaena fragrans", art: "cane", pot: "cream",
    light: ["medium", "bright"], size: "large", cool: false, drafts: false, petSafe: false,
    styles: ["minimal", "elegant"], height: "120–180 cm", water: "la 10–14 zile", temp: "16–26 °C",
    note: "Trunchi înalt și coroană sus. Adaugă înălțime fără să ocupe mult spațiu pe pardoseală." },
  { id: "schefflera", name: "Schefflera", latin: "Schefflera arboricola", art: "umbrella", pot: "terracotta",
    light: ["medium", "bright"], size: "medium", cool: true, drafts: true, petSafe: false,
    styles: ["luxuriant"], height: "90–150 cm", water: "la 7–10 zile", temp: "12–27 °C",
    note: "Rezistentă și ușor de modelat. Suportă bine variațiile de temperatură." }
];

/* ---------- Pachete de abonament ----------
   Prețuri orientative din planul de afaceri; oferta finală se face după evaluarea gratuită. */
VERDE.packages = [
  { id: "ingrijire", name: "Îngrijire", price: "120–180", unit: "lei / lună",
    tagline: "Ai deja plante? Le ținem noi în viață.",
    features: ["Vizite de întreținere la plantele tale", "Udare, curățare, rotire, sfaturi", "Plant Passport pentru fiecare plantă", "Înlocuirile se plătesc separat"] },
  { id: "mic", name: "Mic", price: "150–180", unit: "lei / lună",
    tagline: "Pentru o recepție sau un colț verde.",
    features: ["3–4 plante de la noi, în ghivece decorative", "O vizită de întreținere pe lună", "Înlocuirea plantelor care nu mai arată bine", "Plant Passport pentru fiecare plantă"] },
  { id: "standard", name: "Standard", price: "300–350", unit: "lei / lună", featured: true,
    tagline: "Cel mai ales pachet: spațiul arată verde tot anul.",
    features: ["Aproximativ 8 plante alese pentru spațiul tău", "Două vizite pe lună", "Înlocuire gratuită în cel mult 3 zile lucrătoare", "Plant Passport și raport după vizită"] },
  { id: "premium", name: "Premium", price: "de la 450", unit: "lei / lună",
    tagline: "Pentru spații unde imaginea contează mult.",
    features: ["Plante mari și amenajare pe identitatea brandului", "Rotații de sezon de 4 ori pe an", "Intervenție prioritară", "Plante pentru un eveniment pe an incluse"] }
];

/* ---------- Pachete pentru evenimente ---------- */
VERDE.eventPackages = [
  { id: "accent", name: "Accent", price: "300 lei", unit: "pe eveniment",
    tagline: "Câteva plante mari care schimbă atmosfera.",
    features: ["10 plante mari în ghivece decorative", "Le ridici din depozitul nostru din Oradea", "Le aduci înapoi a doua zi"] },
  { id: "decor", name: "Decor", price: "1.100–1.200 lei", unit: "pe eveniment", featured: true,
    tagline: "Cel mai ales pentru nunți și botezuri.",
    features: ["Aproximativ 25 de plante", "Livrare, montaj și demontaj incluse", "Aranjare la intrare, ceremonie, mese și zona foto"] },
  { id: "premium-ev", name: "Premium", price: "de la 2.000 lei", unit: "pe eveniment",
    tagline: "Pentru conferințe, lansări și nunți mari.",
    features: ["50+ plante", "Green Set: panou verde, arcadă, zonă foto", "Propunere de decor după pozele locației"] },
  { id: "partener", name: "Partener sală", price: "900 lei", unit: "pe lună",
    tagline: "Pentru sălile de evenimente.",
    features: ["Plante permanente în sală, îngrijite de noi", "Până la 2 schimbări de decor pe lună", "Prioritate la evenimentele din sezon"] }
];

/* ---------- Echipa ----------
   Completați numele când sunt stabilite; până atunci apar doar rolurile. */
VERDE.team = [
  { name: "", role: "Coordonare și vânzări", text: "Discuțiile cu firmele, ofertele și parteneriatele cu sălile de evenimente." },
  { name: "", role: "Plante și operațiuni", text: "Alegerea speciilor, instalarea, vizitele și depozitul." },
  { name: "", role: "Marketing și comunicare", text: "Brandul, TikTok, Instagram și materialele de prezentare." },
  { name: "", role: "Platformă", text: "Site-ul, Plant Match și Plant Passport." },
  { name: "", role: "Financiar", text: "Bugetul, facturile și indicatorii." }
];

/* ---------- Plant Passport (profiluri demonstrative) ---------- */
VERDE.passports = {
  "VRD-0142": {
    plant: "kentia", status: "ok", statusLabel: "Sănătoasă",
    location: "Cafenea (client demo) — lângă vitrină", pot: "Ceramică mată, Ø 34 cm", height: "165 cm",
    installed: "2026-03-12", lastVisit: "2026-10-28", nextVisit: "2026-11-11",
    tips: ["Udare când primii 3 cm de sol sunt uscați", "Lumină indirectă, fără soare direct după-amiaza", "Vârfuri maronii la frunze înseamnă aer prea uscat"],
    history: [
      ["2026-10-28", "Vizită de întreținere: udare, curățare frunze, rotire ghiveci 90°"],
      ["2026-10-14", "Vizită de întreținere: udare"],
      ["2026-09-02", "Mutată de pe terasă în interior pentru sezonul rece"],
      ["2026-03-12", "Livrată și amplasată. Profil creat"]
    ]
  },
  "VRD-0087": {
    plant: "zz", status: "watch", statusLabel: "În observare",
    location: "Birou (client demo) — recepție", pot: "Ghiveci alb, Ø 24 cm", height: "70 cm",
    installed: "2026-05-20", lastVisit: "2026-10-30", nextVisit: "2026-11-13",
    tips: ["Solul trebuie să se usuce complet între udări", "Crește mai repede în lumină indirectă", "Frunzele galbene semnalează udare prea deasă"],
    history: [
      ["2026-10-30", "Două frunze îngălbenite. Udarea a fost rărită, revenim peste două săptămâni"],
      ["2026-09-18", "Vizită de întreținere: udare, curățare frunze"],
      ["2026-05-20", "Livrată și amplasată. Profil creat"]
    ]
  },
  "VRD-0215": {
    plant: "monstera", status: "rotate", statusLabel: "Programată pentru rotație",
    location: "Showroom (client demo) — zona lounge", pot: "Coș împletit, Ø 30 cm", height: "120 cm",
    installed: "2026-04-02", lastVisit: "2026-10-22", nextVisit: "2026-11-05",
    tips: ["Udare săptămânală vara, la 10 zile iarna", "Lumină indirectă, luminoasă", "Frunzele mici, fără decupaje, cer mai multă lumină"],
    history: [
      ["2026-10-22", "Clientul a cerut o compoziție nouă pentru iarnă. Rotație programată"],
      ["2026-08-11", "Vizită de întreținere: tutore nou, curățare"],
      ["2026-04-02", "Livrată și amplasată. Profil creat"]
    ]
  }
};
