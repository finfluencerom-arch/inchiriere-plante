# VERDÉ — platforma

Site funcțional pentru VERDÉ, serviciul de închiriere și îngrijire a plantelor pentru afaceri din Oradea. Construit in-house, fără servere și fără costuri de găzduire (rulează pe GitHub Pages).

## Ce poate face un vizitator

- **Plante:** catalog cu 15 specii, filtre (lumină, mărime, răcoare, curent, animale), căutare și fișă detaliată pentru fiecare plantă.
- **Plant Match:** 5 întrebări despre spațiu, apoi plantele potrivite cu procent de potrivire.
- **Selecția:** coș cu plantele alese, cantități și pachetul de abonament (se păstrează în browser).
- **Abonamente:** pachetele Esențial, Sezonier, Premium și întrebări frecvente.
- **Programează evaluarea:** formular cu zi și interval orar, rezumatul selecției și cod de cerere.
- **Plant Passport:** caută o plantă după cod (ex. VRD-0142) sau deschide-o din codul QR.
- **Despre noi:** echipa, felul în care pornim și etapele de creștere.

## Fișiere

| Fișier | Rol |
|---|---|
| `index.html` | Structura tuturor paginilor |
| `css/style.css` | Designul (culori, straturi, animații) |
| `css/fonts.css`, `fonts/` | Fonturile Marcellus și Jost, incluse în proiect |
| `js/data.js` | **Conținutul editabil:** email, plante, pachete, profiluri Plant Passport |
| `js/art.js` | Ilustrațiile plantelor, desenate în browser |
| `js/scene.js` | Fundalul: copaci, ceață, raze, particule, ploaie, sunet |
| `js/room.js` | Animația „Studiu de lumină”: camera desenată ca o planșă de arhitectură |
| `js/app.js` | Funcționalitatea: navigare, catalog, Plant Match, selecție, cereri |

## Înainte de lansare

1. În `js/data.js`, la `VERDE.settings`, pune emailul real (și telefonul, dacă vreți să apară).
2. Opțional: creează un formular gratuit pe [formspree.io](https://formspree.io) și pune adresa lui la `formEndpoint`. Atunci cererile ajung direct pe email, fără ca vizitatorul să-și deschidă aplicația de email.
3. Când stabiliți prețurile, completați `price` la fiecare pachet din `js/data.js`.

## Publicare pe GitHub Pages

1. Pe github.com: **New repository** (ex. `verde`), Public.
2. **Add file → Upload files**, trage tot conținutul acestui folder (inclusiv folderele `css` și `js` și fișierul `.nojekyll`), apoi **Commit changes**.
3. **Settings → Pages**: *Deploy from a branch*, branch `main`, folder `/ (root)`, **Save**.
4. După 1–2 minute: `https://NUMELE-TAU.github.io/verde/`.
