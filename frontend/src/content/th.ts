/**
 * Shipped Thai copy, as a sparse overlay on top of `defaultContent`.
 *
 * This covers the chrome that wraps every page — navigation, footer, the
 * language toggle itself — so the site has a working Thai side against an
 * empty database. Page body copy is not here: that is authored in the admin
 * panel, which writes it to the database as `<path>.th`.
 *
 * A path missing from this map falls back to the English default rather than
 * rendering blank, so an untranslated field is merely untranslated.
 *
 * Paths address leaves in `defaultContent`; anything that no longer exists
 * there is ignored, exactly like a stale row in the database.
 */
export const thaiDefaults: Record<string, string> = {
  "common.brand.languageSwitchLabel": "เปลี่ยนภาษา",

  "common.nav.about": "เกี่ยวกับเรา",
  "common.nav.models": "รุ่นกีตาร์",
  "common.nav.available": "กีตาร์พร้อมส่ง",
  "common.nav.order": "สั่งทำพิเศษ",
  "common.nav.gallery": "แกลเลอรี",
  "common.nav.events": "กิจกรรม",
  "common.nav.contact": "ติดต่อเรา",

  "common.footer.links.0.label": "กระบวนการของช่างทำกีตาร์",
  "common.footer.links.1.label": "การคัดเลือกไม้โทนวูด",
  "common.footer.links.2.label": "คู่มือการดูแลรักษา",
  "common.footer.links.3.label": "นโยบายความเป็นส่วนตัว",
  "common.footer.copyright": "© 2024 Bocusto Guitars สงวนลิขสิทธิ์ · งานคราฟต์ด้วยความประณีต",
  "common.footer.topLabel": "กลับขึ้นด้านบน"
};
