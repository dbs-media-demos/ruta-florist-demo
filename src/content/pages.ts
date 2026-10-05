import type { Localized } from "@/lib/i18n";

type L = Localized<string>;

export const faq: { q: L; a: L }[] = [
  {
    q: { sr: "Do kada mogu da poručim za dostavu danas?", en: "What's the latest I can order for delivery today?" },
    a: { sr: "Do 14:00, od ponedeljka do subote. Posle toga birate sutrašnji termin od 9:00. Nedeljom dostavljamo 9–15h za porudžbine od subote.", en: "By 14:00, Monday to Saturday. After that you pick a slot from 9:00 tomorrow. On Sundays we deliver 9:00–15:00 for orders placed on Saturday." },
  },
  {
    q: { sr: "Kako biram termin dostave?", en: "How do I choose a delivery window?" },
    a: { sr: "Na stranici buketa izaberete datum i jedan od četiri termina: 9–12, 12–15, 15–18 ili 18–21h. Kurir stiže u tom prozoru.", en: "On the bouquet page you pick a date and one of four windows: 9–12, 12–15, 15–18 or 18–21. The courier arrives within that window." },
  },
  {
    q: { sr: "Koliko košta dostava?", en: "How much is delivery?" },
    a: { sr: "Zavisi od zone: Stari grad je besplatan, centralne zone 350–450 RSD, ostale 550–650 RSD. U centralnim zonama dostava je besplatna za porudžbine preko 6.000 RSD.", en: "It depends on the zone: the Old Town is free, central zones 350–450 RSD, outer zones 550–650 RSD. Central zones deliver free on orders over 6,000 RSD." },
  },
  {
    q: { sr: "Šta ako primalac nije kod kuće?", en: "What if the recipient isn't home?" },
    a: { sr: "Kurir zove primaoca, a ako se ne javi, zove vas. Možemo ostaviti cveće komšiji, na recepciji ili doneti ponovo isti dan bez doplate.", en: "The courier calls the recipient, and if there's no answer, calls you. We can leave the flowers with a neighbour or reception, or come back the same day at no extra cost." },
  },
  {
    q: { sr: "Šta znači dostava kao iznenađenje?", en: "What is a surprise delivery?" },
    a: { sr: "Ne zovemo primaoca unapred, samo zvonimo na vrata. Ako niko nije tu, javljamo se vama, ne njima.", en: "We don't call the recipient ahead, we just ring the bell. If nobody's in, we contact you, not them." },
  },
  {
    q: { sr: "Kako se plaća?", en: "How can I pay?" },
    a: { sr: "Karticom (Visa, Mastercard, DinaCard), IPS QR kodom iz m-banking aplikacije ili pouzećem kada ste vi primalac. Naručivanje iz inostranstva radi sa svim stranim karticama.", en: "By card (Visa, Mastercard, DinaCard), by IPS QR code in your mobile banking app, or cash on delivery when you're the recipient. Orders from abroad work with any international card." },
  },
  {
    q: { sr: "Da li je kartica sa porukom besplatna?", en: "Is the card message free?" },
    a: { sr: "Da. Pišemo je rukom, mastilom, na kartici od pamučnog papira, i ušuškamo je u buket.", en: "Yes. We handwrite it in ink on a cotton-paper card and tuck it into the bouquet." },
  },
  {
    q: { sr: "Da li će buket izgledati kao na slici?", en: "Will the bouquet look like the photo?" },
    a: { sr: "Vrlo blizu. Cveće je prirodno pa se nijanse menjaju sa sezonom. Pre polaska vam šaljemo fotografiju vašeg buketa.", en: "Very close. Flowers are natural so shades shift with the season. We send you a photo of your actual bouquet before it leaves." },
  },
  {
    q: { sr: "Šta ako cveće ne potraje?", en: "What if the flowers don't last?" },
    a: { sr: "Garancija svežine je 3 dana. Pošaljite nam fotografiju i šaljemo novo cveće ili vraćamo novac, bez pitanja.", en: "We have a 3-day freshness guarantee. Send us a photo and we'll send new flowers or refund you, no questions asked." },
  },
  {
    q: { sr: "Mogu li da poručim iz inostranstva?", en: "Can I order from abroad?" },
    a: { sr: "Naravno. Engleska verzija sajta prikazuje i okvirnu cenu u evrima, a pola naših porudžbina za 8. mart stiže iz dijaspore.", en: "Of course. The English site also shows an approximate euro price, and half our International Women's Day orders come from the diaspora." },
  },
];

export const careTips: { title: L; text: L; image: string }[] = [
  { title: { sr: "Podsecite koso", en: "Trim at an angle" }, text: { sr: "Čim stigne, odsecite 2 cm stabljike pod uglom, oštrim nožem, idealno pod vodom. Ugao povećava površinu kojom cvet pije.", en: "As soon as it arrives, cut 2 cm off each stem at an angle with a sharp knife, ideally under water. The angle increases the surface the flower drinks through." }, image: "/images/studio/cutting-stem.jpg" },
  { title: { sr: "Čista vaza, mlaka voda", en: "Clean vase, lukewarm water" }, text: { sr: "Operite vazu deterdžentom. Sipajte mlaku vodu do pola i dodajte kesicu hrane za cveće iz buketa.", en: "Wash the vase with soap. Fill it halfway with lukewarm water and add the flower food sachet from the bouquet." }, image: "/images/studio/ribbon-vase.jpg" },
  { title: { sr: "Bez listova u vodi", en: "No leaves in the water" }, text: { sr: "Sve listove ispod nivoa vode uklonite. Oni trule i zamute vodu.", en: "Strip every leaf below the waterline. They rot and cloud the water." }, image: "/images/studio/trimming.jpg" },
  { title: { sr: "Dalje od voća i radijatora", en: "Away from fruit and radiators" }, text: { sr: "Voće pušta etilen koji ubrzava venjenje. Toplota i direktno sunce rade isto.", en: "Fruit releases ethylene, which speeds up wilting. Heat and direct sun do the same." }, image: "/images/life/window-sunflowers.jpg" },
  { title: { sr: "Sveža voda na dva dana", en: "Fresh water every two days" }, text: { sr: "Menjajte vodu i ponovo podsecite stabljike za centimetar. Buket će trajati i duplo duže.", en: "Change the water and trim the stems by another centimetre. Your bouquet can last twice as long." }, image: "/images/studio/workbench-eucalyptus.jpg" },
];

export const flowerGuide: { name: L; days: string; tip: L }[] = [
  { name: { sr: "Ruže", en: "Roses" }, days: "7–10", tip: { sr: "Ako glava klone, potopite celu ružu u hladnu vodu na sat vremena.", en: "If a head droops, submerge the whole rose in cold water for an hour." } },
  { name: { sr: "Karanfili", en: "Carnations" }, days: "10–14", tip: { sr: "Najdugovečniji cvet u ateljeu. Seku se iznad čvora.", en: "The longest-lasting flower in the studio. Cut just above a node." } },
  { name: { sr: "Hortenzije", en: "Hydrangeas" }, days: "5–8", tip: { sr: "Piju kroz latice: prskajte ih svako jutro.", en: "They drink through their petals: mist them every morning." } },
  { name: { sr: "Suncokreti", en: "Sunflowers" }, days: "6–10", tip: { sr: "Veliki potrošači vode. Dolivajte svakog dana.", en: "Heavy drinkers. Top up every day." } },
  { name: { sr: "Hrizanteme", en: "Chrysanthemums" }, days: "14–21", tip: { sr: "Izdrže skoro sve, ali ne vole hladan promaju.", en: "They tolerate almost anything except cold draughts." } },
  { name: { sr: "Suvo cveće", en: "Dried flowers" }, days: "∞", tip: { sr: "Bez vode, dalje od vlage. Prašinu oduvajte fenom na hladno.", en: "No water, keep dry. Blow off dust with a hair dryer on cool." } },
];

export const timeline: { year: string; title: L; text: L; image: string }[] = [
  { year: "2019", title: { sr: "Prvi sto", en: "The first table" }, text: { sr: "Ana i Mila otvaraju mali pult u Strahinjića bana, sa jednom hladnjačom i biciklom.", en: "Ana and Mila open a small counter on Strahinjića bana with one cold room and a bicycle." }, image: "/images/studio/studio-table.jpg" },
  { year: "2020", title: { sr: "Dostava danas", en: "Same-day delivery" }, text: { sr: "U godini zatvorenih vrata, Ruta počinje da dostavlja istog dana širom Beograda.", en: "In a year of closed doors, Ruta starts same-day delivery across Belgrade." }, image: "/images/delivery/cargo-bike.jpg" },
  { year: "2022", title: { sr: "Venčanja", en: "Weddings" }, text: { sr: "Prvo veliko venčanje na Adi, 40 stolova u breskvi i beloj.", en: "Our first big wedding at Ada: 40 tables in peach and white." }, image: "/images/events/long-table.jpg" },
  { year: "2024", title: { sr: "Pretplate", en: "Subscriptions" }, text: { sr: "Kancelarije i restorani dobijaju sveže cveće svakog ponedeljka.", en: "Offices and restaurants get fresh flowers every Monday." }, image: "/images/life/office-lilies.jpg" },
  { year: "2026", title: { sr: "Atelje na mreži", en: "The studio online" }, text: { sr: "Poručivanje za 60 sekundi, sa terminom izabranim unapred, na srpskom i engleskom.", en: "Ordering in 60 seconds with the window chosen up front, in Serbian and English." }, image: "/images/studio/flower-wall-wide.jpg" },
];

export const team: { name: string; role: L; image: string }[] = [
  { name: "Ana P.", role: { sr: "Osnivačica, floristkinja", en: "Founder, florist" }, image: "/images/studio/florist-vase.jpg" },
  { name: "Mila R.", role: { sr: "Venčanja i događaji", en: "Weddings & events" }, image: "/images/studio/flower-wall-florist.jpg" },
  { name: "Jovana S.", role: { sr: "Buketi i pretplate", en: "Bouquets & subscriptions" }, image: "/images/studio/tying-ribbon.jpg" },
  { name: "Luka D.", role: { sr: "Dostava, na dva točka", en: "Delivery, on two wheels" }, image: "/images/delivery/cargo-bike-street.jpg" },
];

export const weddingServices: { title: L; text: L; price: L }[] = [
  { title: { sr: "Bidermajer i rever", en: "Bridal bouquet & buttonholes" }, text: { sr: "Bidermajer po meri, cvet za rever mladoženje i kumova, cvetni venčić.", en: "A made-to-measure bridal bouquet, buttonholes for the groom and best men, a flower crown." }, price: { sr: "od 9.000 RSD", en: "from 9,000 RSD" } },
  { title: { sr: "Stolovi i sala", en: "Tables & venue" }, text: { sr: "Niski aranžmani za stolove, dugi stolni 'tekući' aranžmani, sveće i vaze.", en: "Low table arrangements, long runner arrangements, candles and vases." }, price: { sr: "od 3.500 RSD po stolu", en: "from 3,500 RSD per table" } },
  { title: { sr: "Lukovi i instalacije", en: "Arches & installations" }, text: { sr: "Cvetni lukovi za ceremoniju, viseće instalacije i zidovi od cveća.", en: "Ceremony arches, hanging installations and flower walls." }, price: { sr: "od 45.000 RSD", en: "from 45,000 RSD" } },
  { title: { sr: "Korporativni događaji", en: "Corporate events" }, text: { sr: "Otvaranja, konferencije, lansiranja i večere za partnere.", en: "Openings, conferences, launches and partner dinners." }, price: { sr: "po ponudi", en: "on quote" } },
];

export const businessPerks: { title: L; text: L }[] = [
  { title: { sr: "Nedeljna recepcija", en: "Weekly reception flowers" }, text: { sr: "Svakog ponedeljka u 9 novi aranžman. Stari odnosimo.", en: "A new arrangement every Monday at 9. We take the old one away." } },
  { title: { sr: "Poklon klijentima", en: "Client gifts" }, text: { sr: "Pošaljite buket u ime firme jednim e-mailom, sa vašom karticom i logotipom.", en: "Send a bouquet on the company's behalf with one email, with your card and logo." } },
  { title: { sr: "Račun na firmu", en: "Company invoicing" }, text: { sr: "Mesečni zbirni račun, PIB na računu, plaćanje virmanom.", en: "One monthly invoice with your tax ID, paid by bank transfer." } },
  { title: { sr: "Restorani i hoteli", en: "Restaurants & hotels" }, text: { sr: "Male vaze za stolove dva puta nedeljno, dogovor po sezoni.", en: "Small table vases twice a week, planned by season." } },
];

export const legal = {
  privacy: {
    sr: [
      ["Ko smo", "Ruta cvetni atelje (fiktivni brend, demo sajt koji je izradio Scale by Noon). Ovaj sajt ne prikuplja niti šalje lične podatke."],
      ["Koje podatke bismo obrađivali", "Na pravom sajtu: ime, kontakt i adresu pošiljaoca i primaoca, radi isporuke porudžbine. Podaci o kartici idu direktno banci i nikada ne prolaze kroz naš server."],
      ["Lokalno skladištenje", "Korpa, lista želja i nedavno gledano čuvaju se samo u vašem pregledaču (localStorage). Možete ih obrisati brisanjem podataka sajta."],
      ["Kolačići", "Demo ne koristi kolačiće za praćenje niti analitiku."],
      ["Vaša prava", "Pravo na uvid, ispravku i brisanje podataka u skladu sa Zakonom o zaštiti podataka o ličnosti. Kontakt: zdravo@ruta-cvece.rs (demo)."],
    ],
    en: [
      ["Who we are", "Ruta flower studio (a fictional brand; a demo site built by Scale by Noon). This site does not collect or send personal data."],
      ["What we would process", "On a live site: the sender's and recipient's name, contact details and address, to deliver the order. Card details go straight to the bank and never pass through our server."],
      ["Local storage", "Your bag, wishlist and recently viewed items are stored only in your browser (localStorage). Clear site data to remove them."],
      ["Cookies", "The demo uses no tracking or analytics cookies."],
      ["Your rights", "You can access, correct and delete your data under Serbia's Personal Data Protection Law. Contact: zdravo@ruta-cvece.rs (demo)."],
    ],
  },
  terms: {
    sr: [
      ["Porudžbine", "Porudžbine primljene do 14:00 (pon–sub) isporučujemo istog dana u izabranom terminu. Ovo je demo: porudžbine se ne izvršavaju."],
      ["Cene", "Sve cene su u dinarima sa uračunatim PDV-om. Cena u evrima na engleskoj verziji je informativna."],
      ["Zamena cveća", "Ako neko cveće nije dostupno, menjamo ga sličnim iste ili veće vrednosti, uz zadržavanje palete."],
      ["Dostava", "Ako primalac nije dostupan, kontaktiramo pošiljaoca. Ponovna dostava istog dana je besplatna."],
      ["Reklamacije", "Garancija svežine 3 dana. Reklamaciju sa fotografijom pošaljite e-mailom; rešavamo je u roku od 24h."],
      ["Odustanak", "Sveže cveće je kvarljiva roba, pa pravo na odustanak ne važi nakon isporuke. Porudžbinu možete otkazati do 2 sata pre termina."],
    ],
    en: [
      ["Orders", "Orders received by 14:00 (Mon–Sat) are delivered the same day in the chosen window. This is a demo: orders are not fulfilled."],
      ["Prices", "All prices are in Serbian dinars including VAT. The euro price on the English site is approximate."],
      ["Substitutions", "If a flower is unavailable we substitute something similar of equal or higher value, keeping the palette."],
      ["Delivery", "If the recipient is unavailable we contact the sender. Same-day redelivery is free."],
      ["Complaints", "3-day freshness guarantee. Email a photo and we resolve it within 24 hours."],
      ["Cancellation", "Fresh flowers are perishable, so withdrawal does not apply after delivery. You can cancel up to 2 hours before the window."],
    ],
  },
};
