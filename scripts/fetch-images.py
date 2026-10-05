"""Downloads and normalises every photo the site uses into public/images, and writes SOURCES.md.

Run once from the project root: python scripts/fetch-images.py
Product shots all come from one Pexels shoot (Teona Swift, white-wall florist studio) so the
catalogue reads as a single art-directed session. Each is cropped to 4:5 and lightly graded.
"""
import io, os, sys, urllib.request, concurrent.futures as cf, warnings
from PIL import Image, ImageEnhance

warnings.filterwarnings("ignore")
ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
UNSPLASH_LIST = sys.argv[1] if len(sys.argv) > 1 else None

PX = "https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w={w}"
UN = "https://images.unsplash.com/{path}?w={w}&q=85&fm=jpg"

# ---- product shots (Pexels ids) -------------------------------------------------------------
PRODUCTS = {
    "white-morning": [6913829, 6913830, 6913764],
    "carnation-blush": [6912898, 6912895, 6913747],
    "grandmas-garden": [6912900, 6913749, 6913384],
    "sunny-side": [6913053, 6913056, 6913050],
    "meadow": [6913055, 6913757, 6913062],
    "august-at-ada": [6912887, 6913735, 6912870],
    "blue-danube": [6913054, 6913051, 6913065, 6913060],
    "cloud": [6913052, 6913057, 6913151],
    "first-snow": [6912904, 6913763, 6913124],
    "little-gesture": [6913157, 6913147, 6913110],
    "florists-choice": [6913744, 6913743, 6913748],
    "one-red-rose": [6913742, 6912868, 6912865],
    "three-roses": [6912889, 6913737, 6912864],
    "first-date": [6913116, 6913108, 6913109],
    "white-roses-vase": [6913126, 6913122, 6913085],
    "bucket-of-roses": [6913092, 6913091, 6913087],
    "strahinjica-basket": [6913841, 6913175, 6913150],
    "basket-for-mum": [6913752, 6913148, 6913156],
    "blush-basket": [6913174, 6913160, 6913158],
    "long-table": [6913746, 6913736, 6913817],
    "hydrangea-and-rose": [6912850, 6912848, 6912855],
    "summer-terrace": [6913120, 6913111, 6913113],
    "cactus-garden": [6913833, 6912852, 6912853],
    "lucky-bamboo": [6912874, 6913058],
    "green-sprig": [6913145, 6913144, 6913751],
    "propagation-station": [6913067, 6913758, 6913740],
    "eucalyptus-ceramic": [6912888, 6912893, 6913739],
    "hanging-pothos": [6913818, 6913840],
    "golden-wheat": [6912903, 6912901, 6913063],
    "wheat-in-a-vase": [6913738, 6912863, 6912866],
    "sea-lavender": [6913061, 6913750, 6913069],
    "pampas-cloud": [6912842, 13755597],
    "ceramic-vase": [6952059, 7214786],
    "artisan-chocolate": [6167334, 6167339],
    "linen-candle": [6800933, 6801187],
    "pastel-balloons": [3905850, 4684169],
}
PX_CREDIT = {13755597: "Kaboompics", 6952059: "Karolina Grabowska", 7214786: "Karolina Grabowska",
             6167334: "Karolina Grabowska", 6167339: "Karolina Grabowska", 6800933: "Karolina Grabowska",
             6801187: "Karolina Grabowska", 3905850: "Karolina Grabowska", 4684169: "Karolina Grabowska"}

# ---- studio / editorial from the same Pexels shoot ------------------------------------------
STUDIO = {
    "florist-basket-floor": 6913843, "workbench-eucalyptus": 6913826, "florist-vase": 6913748,
    "making-bouquet": 6913744, "arranging": 6913743, "roses-in-progress": 6913732,
    "florist-table": 6912878, "cutting-branch": 6912877, "wrapping": 6912875,
    "tying-sunflowers": 6912876, "tying-ribbon": 6913154, "ribbon-bow": 6913142,
    "ribbon-vase": 6913141, "cutting-stem": 6913140, "trimming": 6913094, "tools": 6912880,
    "workspace": 6913733, "studio-table": 6913824, "florist-vase-2": 6912881,
    "flower-wall-florist": 6913176, "flower-wall-making": 6913171, "flower-wall": 6913844,
    "flower-wall-2": 6913372, "flower-wall-wide": 6913376, "petals": 6913395,
    "petals-cloth": 6913391, "petals-macro": 6913842, "arrangement-window": 6913736,
    "sunflower-table": 6913817, "big-vase": 6913746, "eucalyptus-armful": 6913741,
    "rose-red-hand": 6913742, "hydrangea-hand": 6913761,
}
# raw stems taped on the white wall, used for the bouquet builder cut-outs
STEMS = [6913162, 6913164, 6913166, 6913172, 6913169, 6913844, 6913372, 6913376, 6913378,
         6913384, 6913373, 6913179, 6913845, 6913745, 6913761, 6913742, 6912896, 6913065]

# ---- Unsplash lifestyle (label -> local name) -----------------------------------------------
UNSPLASH = {
    "city4": "city/dorcol-street", "city5": "city/green-street", "city7": "city/sidewalk",
    "city11": "city/facades", "city19": "city/facade-corner", "city20": "city/corner-building",
    "city21": "city/facade-ornament", "city37": "city/saint-sava", "city40": "city/river-bridge",
    "city44": "city/kalemegdan-park", "city46": "city/kalemegdan-sunset", "city47": "city/fortress-dusk",
    "city64": "city/dusk-blossom",
    "deliv1": "delivery/bike-door", "deliv2": "delivery/yellow-bike", "deliv9": "delivery/bike-basket",
    "deliv11": "delivery/white-bike", "deliv12": "delivery/bike-street", "deliv15": "delivery/hand-bouquet",
    "deliv20": "delivery/tulips-paper", "deliv23": "delivery/flower-box", "deliv32": "delivery/door-wreath",
    "deliv33": "delivery/door-sunflowers", "deliv42": "delivery/arched-door", "deliv60": "delivery/cargo-bike",
    "deliv62": "delivery/cargo-bike-street", "deliv65": "delivery/cargo-bike-2",
    "interior3": "life/living-peonies", "interior7": "life/living-table", "interior8": "life/terrace",
    "interior16": "life/chair-branches", "interior21": "life/window-sunflowers", "interior23": "life/tulips-table",
    "interior26": "life/office-lilies", "interior27": "life/lilies-window", "interior30": "life/bookshop-vase",
    "interior34": "life/desk-flowers", "interior41": "life/cafe-sprig", "interior44": "life/restaurant-table",
    "interior45": "life/restaurant-dark", "interior47": "life/event-table",
    "wed0": "events/long-table", "wed2": "events/tent-dinner", "wed4": "events/bud-vases",
    "wed6": "events/garden-centrepiece", "wed8": "events/rustic-centrepiece", "wed12": "events/gypsophila-runner",
    "wed14": "events/bride-peach", "wed16": "events/bridal-bouquet", "wed24": "events/bride-violet",
    "wed25": "events/bride-white", "wed30": "events/arch-build", "wed33": "events/arch-couple",
    "wed42": "events/pavilion", "wed43": "events/moody-table",
    "calm6": "calm/lilies-vase", "calm15": "calm/white-dahlias", "calm17": "calm/white-daisies",
    "calm18": "calm/daisy-stem", "calm27": "calm/white-alstroemeria",
    "occ3": "occasions/pink-carnations", "occ15": "occasions/baby", "occ17": "occasions/baby-headband",
    "occ32": "occasions/couple", "occ33": "occasions/gift-smile", "occ44": "occasions/heart-hands",
    "occ48": "occasions/birthday-bunch", "occ51": "occasions/pink-roses", "occ52": "occasions/thank-you-card",
    "macro1": "macro/dahlia-glow", "macro5": "macro/pink-petals", "macro6": "macro/blush-petal",
    "macro16": "macro/peony", "macro35": "macro/white-alstroemeria",
}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    return urllib.request.urlopen(req, timeout=60).read()


def grade(im):
    # gentle shared grade: a touch warmer and softer contrast so mixed sources sit together
    r, g, b = im.split()
    r = r.point(lambda v: min(255, int(v * 1.02 + 2)))
    b = b.point(lambda v: int(v * 0.985))
    im = Image.merge("RGB", (r, g, b))
    return ImageEnhance.Contrast(im).enhance(0.97)


def crop_ratio(im, ratio, top_bias=0.35):
    w, h = im.size
    if w / h > ratio:
        nw = int(h * ratio)
        x = (w - nw) // 2
        return im.crop((x, 0, x + nw, h))
    nh = int(w / ratio)
    y = int((h - nh) * top_bias)
    return im.crop((0, y, w, y + nh))


def save(im, path, max_w, q=82):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(path, "JPEG", quality=q, optimize=True, progressive=True)


sources = []


def product_job(slug, i, pid):
    im = Image.open(io.BytesIO(get(PX.format(id=pid, w=1600)))).convert("RGB")
    im = grade(crop_ratio(im, 4 / 5))
    save(im, os.path.join(ROOT, "products", f"{slug}-{i + 1}.jpg"), 1400)
    return (f"products/{slug}-{i + 1}.jpg", f"https://www.pexels.com/photo/{pid}/", PX_CREDIT.get(pid, "Teona Swift"))


def studio_job(name, pid):
    im = grade(Image.open(io.BytesIO(get(PX.format(id=pid, w=2000)))).convert("RGB"))
    save(im, os.path.join(ROOT, "studio", f"{name}.jpg"), 2000)
    return (f"studio/{name}.jpg", f"https://www.pexels.com/photo/{pid}/", "Teona Swift")


def stem_job(pid):
    raw = get(PX.format(id=pid, w=2400))
    p = os.path.join(os.path.dirname(__file__), "..", ".stems", f"{pid}.jpg")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "wb").write(raw)
    return (f"builder (source) {pid}", f"https://www.pexels.com/photo/{pid}/", "Teona Swift")


def unsplash_job(label, name, path, user, uid):
    im = grade(Image.open(io.BytesIO(get(UN.format(path=path, w=2200)))).convert("RGB"))
    save(im, os.path.join(ROOT, f"{name}.jpg"), 2200)
    return (f"{name}.jpg", f"https://unsplash.com/photos/{uid}", user)


def main():
    jobs = []
    un = {}
    if UNSPLASH_LIST:
        for line in open(UNSPLASH_LIST, encoding="utf-8"):
            p = line.strip().split("|")
            if len(p) == 4:
                un[p[0]] = (p[2], p[3], p[1])
    with cf.ThreadPoolExecutor(10) as ex:
        for slug, ids in PRODUCTS.items():
            for i, pid in enumerate(ids):
                jobs.append(ex.submit(product_job, slug, i, pid))
        for name, pid in STUDIO.items():
            jobs.append(ex.submit(studio_job, name, pid))
        for pid in STEMS:
            jobs.append(ex.submit(stem_job, pid))
        for label, name in UNSPLASH.items():
            if label in un:
                path, user, uid = un[label]
                jobs.append(ex.submit(unsplash_job, label, name, path, user, uid))
        for j in jobs:
            try:
                sources.append(j.result())
            except Exception as e:  # keep going, report at the end
                print("FAILED", e)
    sources.sort()
    with open(os.path.join(ROOT, "SOURCES.md"), "w", encoding="utf-8") as f:
        f.write("# Image sources\n\nAll photos are free-licence (Pexels / Unsplash), downloaded, cropped and lightly graded.\n\n")
        f.write("| File | Source | Photographer |\n|---|---|---|\n")
        for file, url, who in sources:
            f.write(f"| {file} | {url} | {who} |\n")
    print("done", len(sources))


if __name__ == "__main__":
    main()
