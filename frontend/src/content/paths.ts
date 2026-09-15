/**
 * Helpers for moving between the nested content tree and the flat dotted keys
 * the database stores (`models.series.0.name`).
 */

export type Leaf = { key: string; value: string };

/** Every string leaf in `node`, in declaration order, keyed by its dotted path. */
export function flatten(node: unknown, prefix = ""): Leaf[] {
  if (typeof node === "string") {
    return prefix ? [{ key: prefix, value: node }] : [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => flatten(item, prefix ? `${prefix}.${i}` : String(i)));
  }
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([k, v]) => flatten(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

function clone<T>(value: T): T {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

/**
 * Returns a copy of `tree` with each override applied at its dotted path.
 * Paths that do not exist in the tree are ignored, so a stale key left in the
 * database after a redesign can never break rendering.
 */
export function applyOverrides<T>(tree: T, overrides: Record<string, string>): T {
  const result = clone(tree);

  for (const [path, value] of Object.entries(overrides)) {
    const segments = path.split(".");
    const lastSegment = segments.pop();
    if (!lastSegment) continue;

    let cursor: any = result;
    let reachable = true;
    for (const segment of segments) {
      if (cursor == null || typeof cursor !== "object" || !(segment in cursor)) {
        reachable = false;
        break;
      }
      cursor = cursor[segment];
    }

    // Only overwrite leaves the tree already declares as strings.
    if (reachable && cursor && typeof cursor === "object" && typeof cursor[lastSegment] === "string") {
      cursor[lastSegment] = value;
    }
  }

  return result;
}

/** Turns `series.0.specsTitle` into "Series › 1 › Specs Title" for the admin form. */
export function humanizePath(path: string): string {
  return path
    .split(".")
    .map((segment) => {
      if (/^\d+$/.test(segment)) return `#${Number(segment) + 1}`;
      return segment.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
    })
    .join(" › ");
}

/** Image fields get a URL input plus a preview; everything else is text. */
export function isImageField(key: string, value: string): boolean {
  return /(^|\.)image$/i.test(key) || /Image$/.test(key) || /^https?:\/\//.test(value);
}

/** Long copy gets a textarea rather than a single-line input. */
export function isLongText(value: string): boolean {
  return value.length > 90;
}
