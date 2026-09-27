"""Draw the Home Music icon set with Pillow and mirror the PNGs to /public.

Run with: python scripts/draw_ghibli_icons.py
Requires Pillow in the development environment; the web app itself uses only
the generated PNGs and inline SVG symbols.
"""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SCALE = 3
INK = "#4a392d"
WOOD = "#916347"
ROOF = "#d98450"
PARCHMENT = "#f4e4b7"
GOLD = "#dfb965"
GOLD_LIGHT = "#ffdf8d"
LEAF = "#78a36f"
LEAF_LIGHT = "#b2cc83"
GREEN_DARK = "#1b2a1f"


def canvas(size=512, background=None):
    scaled = size * SCALE
    image = Image.new("RGBA", (scaled, scaled), background or (0, 0, 0, 0))
    return image, ImageDraw.Draw(image)


def xy(points):
    return [(round(x * SCALE), round(y * SCALE)) for x, y in points]


def line(draw, points, fill=INK, width=6):
    draw.line(xy(points), fill=fill, width=max(1, round(width * SCALE)), joint="curve")


def polygon(draw, points, fill, outline=INK, width=6):
    draw.polygon(xy(points), fill=fill)
    if outline:
        line(draw, points + [points[0]], outline, width)


def ellipse(draw, box, fill, outline=INK, width=5):
    scaled = tuple(round(value * SCALE) for value in box)
    draw.ellipse(scaled, fill=fill, outline=outline, width=max(1, round(width * SCALE)))


def rounded(draw, box, radius, fill, outline=INK, width=5):
    scaled = tuple(round(value * SCALE) for value in box)
    draw.rounded_rectangle(scaled, radius=round(radius * SCALE), fill=fill,
                           outline=outline, width=max(1, round(width * SCALE)))


def export(image, name, width, height=None):
    height = height or width
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    for folder in (ROOT, PUBLIC):
        folder.mkdir(parents=True, exist_ok=True)
        image.save(folder / name, format="PNG", optimize=True)


def draw_home():
    image, d = canvas()
    # A small ivy cottage, with soft uneven roof lines and a hand-built door.
    polygon(d, [(77, 257), (244, 107), (437, 263), (416, 288), (244, 156), (99, 288)], ROOF, INK, 12)
    rounded(d, (111, 250, 407, 434), 25, PARCHMENT, INK, 11)
    line(d, [(111, 280), (244, 161), (407, 292)], GOLD_LIGHT, 8)
    rounded(d, (196, 321, 326, 436), 58, "#9a7656", INK, 9)
    rounded(d, (211, 339, 311, 434), 46, "#7c9a71", INK, 5)
    ellipse(d, (287, 376, 298, 387), GOLD_LIGHT, None, 0)
    rounded(d, (134, 294, 183, 345), 14, "#a8c2a0", INK, 7)
    line(d, [(159, 298), (159, 340)], GOLD_LIGHT, 5)
    line(d, [(138, 320), (179, 320)], GOLD_LIGHT, 5)
    line(d, [(338, 296), (373, 277), (398, 298)], LEAF, 8)
    line(d, [(133, 274), (117, 251), (122, 231)], LEAF, 7)
    polygon(d, [(113, 249), (95, 234), (97, 215), (116, 229)], LEAF_LIGHT, INK, 4)
    polygon(d, [(383, 289), (397, 267), (418, 262), (408, 283)], LEAF_LIGHT, INK, 4)
    line(d, [(117, 444), (398, 444)], WOOD, 11)
    line(d, [(151, 454), (364, 454)], GOLD, 5)
    image = image.resize((270, 270), Image.Resampling.LANCZOS)
    return image


def draw_search():
    image, d = canvas()
    # A firefly lamp makes the search action instantly recognizable.
    d.arc((144*SCALE, 45*SCALE, 368*SCALE, 278*SCALE), 183, 357,
          fill=INK, width=12*SCALE)
    line(d, [(184, 182), (179, 142), (191, 111), (215, 87)], WOOD, 7)
    line(d, [(328, 182), (333, 142), (321, 111), (297, 87)], WOOD, 7)
    polygon(d, [(142, 194), (179, 171), (331, 171), (370, 194), (352, 219), (160, 219)],
            GOLD, INK, 10)
    line(d, [(154, 197), (358, 197)], GOLD_LIGHT, 5)
    rounded(d, (169, 214, 344, 433), 34, "#d9aa61", INK, 11)
    rounded(d, (191, 237, 322, 410), 24, "#f8d98a", WOOD, 5)
    line(d, [(213, 238), (208, 397)], WOOD, 6)
    line(d, [(301, 238), (306, 397)], WOOD, 6)
    line(d, [(182, 291), (331, 291)], GOLD_LIGHT, 6)
    ellipse(d, (225, 286, 291, 352), "#ffefb5", None, 0)
    ellipse(d, (242, 303, 274, 335), "#ffd166", "#e9a83d", 3)
    line(d, [(258, 270), (258, 252)], GOLD_LIGHT, 6)
    line(d, [(258, 372), (258, 354)], GOLD_LIGHT, 6)
    line(d, [(218, 319), (200, 319)], GOLD_LIGHT, 6)
    line(d, [(316, 319), (298, 319)], GOLD_LIGHT, 6)
    line(d, [(187, 443), (323, 443)], INK, 9)
    line(d, [(208, 457), (301, 457)], LEAF, 6)
    return image.resize((270, 270), Image.Resampling.LANCZOS)


def draw_library():
    image, d = canvas()
    polygon(d, [(79, 155), (210, 128), (210, 433), (79, 454)], "#839b70", INK, 10)
    polygon(d, [(221, 115), (335, 132), (335, 430), (221, 433)], "#c49a61", INK, 10)
    polygon(d, [(346, 151), (445, 119), (445, 431), (346, 436)], "#8b6550", INK, 10)
    line(d, [(98, 189), (190, 172)], GOLD_LIGHT, 7)
    line(d, [(98, 218), (190, 201)], GOLD_LIGHT, 7)
    line(d, [(239, 179), (314, 190)], GOLD_LIGHT, 7)
    line(d, [(239, 208), (314, 219)], GOLD_LIGHT, 7)
    line(d, [(363, 190), (425, 174)], GOLD_LIGHT, 7)
    line(d, [(363, 220), (425, 204)], GOLD_LIGHT, 7)
    # Little sprout ornaments in the book spines.
    line(d, [(142, 352), (142, 296)], LEAF_LIGHT, 6)
    polygon(d, [(141, 328), (117, 309), (114, 288), (139, 302)], LEAF_LIGHT, INK, 4)
    polygon(d, [(144, 315), (165, 295), (183, 298), (172, 318)], LEAF, INK, 4)
    line(d, [(279, 359), (279, 292)], LEAF, 6)
    polygon(d, [(278, 326), (257, 308), (257, 288), (280, 305)], LEAF_LIGHT, INK, 4)
    polygon(d, [(281, 315), (302, 291), (321, 295), (308, 317)], LEAF, INK, 4)
    line(d, [(358, 449), (458, 442)], WOOD, 10)
    line(d, [(70, 465), (458, 455)], INK, 10)
    line(d, [(91, 477), (438, 468)], GOLD, 5)
    return image.resize((270, 270), Image.Resampling.LANCZOS)


def draw_playlist():
    image, d = canvas()
    line(d, [(203, 386), (203, 120), (411, 75), (411, 342)], INK, 17)
    line(d, [(207, 163), (407, 119)], GOLD, 10)
    line(d, [(207, 217), (407, 172)], GOLD, 9)
    ellipse(d, (97, 348, 246, 451), LEAF, INK, 12)
    ellipse(d, (307, 306, 456, 409), LEAF_LIGHT, INK, 12)
    line(d, [(171, 455), (188, 417), (206, 386)], WOOD, 11)
    line(d, [(381, 413), (398, 376), (412, 342)], WOOD, 11)
    polygon(d, [(174, 437), (126, 412), (117, 380), (163, 396)], LEAF_LIGHT, INK, 6)
    polygon(d, [(388, 395), (431, 358), (457, 367), (434, 402)], LEAF, INK, 6)
    line(d, [(96, 464), (216, 464)], GOLD, 7)
    line(d, [(317, 426), (431, 426)], GOLD, 7)
    return image.resize((270, 270), Image.Resampling.LANCZOS)


def draw_create():
    image, d = canvas()
    # A hand-drawn feather and quill, with small leaves in the vane.
    polygon(d, [(104, 424), (123, 328), (163, 223), (226, 142), (318, 89),
                (405, 73), (397, 151), (359, 239), (296, 315), (215, 376)],
            "#e8d6a5", INK, 11)
    line(d, [(115, 434), (176, 354), (236, 273), (301, 196), (394, 83)], WOOD, 11)
    line(d, [(177, 352), (165, 285), (182, 226)], "#fff0c9", 8)
    line(d, [(235, 274), (248, 215), (280, 159)], "#fff0c9", 8)
    line(d, [(300, 198), (344, 169), (389, 160)], "#fff0c9", 8)
    line(d, [(276, 229), (345, 235), (373, 220)], WOOD, 6)
    line(d, [(232, 282), (294, 298), (329, 286)], WOOD, 6)
    line(d, [(177, 354), (226, 377), (263, 366)], WOOD, 6)
    polygon(d, [(259, 294), (244, 257), (258, 238), (277, 275)], LEAF, INK, 4)
    polygon(d, [(325, 229), (320, 193), (340, 177), (349, 215)], LEAF_LIGHT, INK, 4)
    polygon(d, [(199, 353), (186, 321), (199, 299), (218, 337)], LEAF_LIGHT, INK, 4)
    polygon(d, [(106, 427), (82, 463), (128, 445)], WOOD, INK, 6)
    ellipse(d, (389, 66, 402, 79), GOLD, None, 0)
    return image.resize((270, 270), Image.Resampling.LANCZOS)


def draw_brand():
    image, d = canvas()
    # Tree-root home, music flag, lantern-like window and Kodama leaves.
    polygon(d, [(112, 282), (163, 266), (217, 287), (280, 268), (344, 280),
                (399, 310), (386, 328), (330, 307), (278, 300), (218, 319),
                (163, 300), (117, 309)], "#916347", INK, 9)
    polygon(d, [(165, 279), (165, 190), (256, 112), (352, 194), (352, 280)],
            PARCHMENT, INK, 10)
    polygon(d, [(143, 198), (251, 101), (370, 202), (350, 214), (256, 133), (164, 213)], ROOF, INK, 9)
    line(d, [(158, 199), (253, 108), (363, 200)], GOLD_LIGHT, 5)
    rounded(d, (218, 220, 290, 285), 32, "#78956a", INK, 7)
    ellipse(d, (188, 206, 214, 232), "#ffd166", WOOD, 5)
    line(d, [(198, 209), (198, 229)], GOLD_LIGHT, 3)
    line(d, [(189, 219), (213, 219)], GOLD_LIGHT, 3)
    # Little music staff / pennant above the chimney.
    line(d, [(326, 186), (326, 104), (328, 76)], INK, 8)
    polygon(d, [(329, 81), (399, 68), (383, 126), (328, 137)], "#a9c982", INK, 6)
    line(d, [(344, 95), (366, 90)], "#617c50", 4)
    ellipse(d, (365, 91, 375, 102), "#77573e", None, 0)
    ellipse(d, (381, 102, 391, 113), "#77573e", None, 0)
    line(d, [(374, 96), (374, 69)], "#77573e", 4)
    line(d, [(390, 107), (390, 79)], "#77573e", 4)
    # Tree trunk and roots.
    polygon(d, [(216, 309), (294, 309), (278, 377), (307, 421), (278, 411),
                (254, 447), (246, 398), (214, 430), (228, 375)], "#ad8056", INK, 8)
    line(d, [(252, 321), (245, 376), (258, 410)], "#d7b379", 6)
    # Surrounding leaves and fireflies.
    polygon(d, [(129, 268), (97, 254), (91, 225), (123, 239)], LEAF_LIGHT, INK, 5)
    polygon(d, [(374, 271), (395, 240), (426, 235), (415, 265)], LEAF, INK, 5)
    polygon(d, [(179, 328), (148, 320), (139, 294), (173, 302)], LEAF, INK, 5)
    polygon(d, [(346, 330), (373, 304), (403, 309), (383, 335)], LEAF_LIGHT, INK, 5)
    ellipse(d, (412, 177, 426, 191), "#ffd166", None, 0)
    ellipse(d, (123, 171, 133, 181), "#f4d69a", None, 0)
    return image


def app_icon():
    image, d = canvas(background=GREEN_DARK)
    # A calm forest tile keeps Android launchers and iOS home screens consistent.
    rounded(d, (16, 16, 496, 496), 104, GREEN_DARK, "#54724d", 5)
    mark = draw_brand()
    mark = mark.resize((round(512 * 1.08 * SCALE), round(512 * 1.08 * SCALE)), Image.Resampling.LANCZOS)
    offset = ((image.width - mark.width) // 2, (image.height - mark.height) // 2)
    image.alpha_composite(mark, offset)
    return image


def main():
    icons = {
        "icon-home.png": draw_home(),
        "icon-search.png": draw_search(),
        "icon-library.png": draw_library(),
        "icon-playlists.png": draw_playlist(),
        "icon-create.png": draw_create(),
    }
    for name, image in icons.items():
        export(image, name, 270)

    brand = draw_brand()
    export(brand, "icon-home-music.png", 1024)
    for name, size in (("favicon-32x32.png", 32), ("favicon.png", 64),
                       ("icon.png", 180), ("apple-touch-icon.png", 180),
                       ("icon-192.png", 192), ("icon-512.png", 512)):
        export(app_icon(), name, size)


if __name__ == "__main__":
    main()
