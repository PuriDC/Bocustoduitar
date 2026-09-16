import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders `children` inside an iframe of a fixed CSS width.
 *
 * An iframe is what makes a responsive preview honest: CSS media queries
 * resolve against the iframe's own viewport, so a 414px frame really does get
 * the site's mobile layout. Rendering the same markup in a scaled <div> would
 * keep matching the outer browser width and show the desktop layout squeezed
 * into a narrow box.
 *
 * React still owns the tree — it is portalled into the iframe's body — so the
 * preview keeps updating live as the editor types.
 */
export default function PreviewFrame({
  width,
  viewportHeight,
  scale,
  children,
  onHeightChange
}: {
  width: number;
  /** Device height that `100vh` should mean inside the frame. */
  viewportHeight: number;
  scale: number;
  children: ReactNode;
  onHeightChange: (height: number) => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(viewportHeight);

  // Copy the host page's stylesheets in, then hand React the iframe body.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const attach = () => {
      const doc = frame.contentDocument;
      if (!doc) return;

      doc.documentElement.className = document.documentElement.className;
      doc.head.querySelectorAll("[data-preview-style]").forEach((n) => n.remove());
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-preview-style", "");
        doc.head.appendChild(clone);
      });

      doc.body.style.margin = "0";
      setBody(doc.body);
    };

    attach();
    frame.addEventListener("load", attach);
    return () => frame.removeEventListener("load", attach);
  }, []);

  /**
   * The frame is as tall as its content so the surrounding panel scrolls the
   * whole page. That makes `100vh` follow the content height, which feeds back
   * into any full-height section and runs away, so pin the viewport units to a
   * fixed device height instead.
   */
  useEffect(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc || !body) return;

    let style = doc.getElementById("preview-viewport-units") as HTMLStyleElement | null;
    if (!style) {
      style = doc.createElement("style");
      style.id = "preview-viewport-units";
      doc.head.appendChild(style);
    }
    style.textContent = `
      .min-h-screen { min-height: ${viewportHeight}px !important; }
      .h-screen { height: ${viewportHeight}px !important; }
    `;
  }, [body, viewportHeight]);

  // Track the rendered height so the frame never scrolls internally.
  useEffect(() => {
    if (!body) return;
    const measure = () => {
      const next = Math.max(body.scrollHeight, viewportHeight);
      setHeight(next);
      onHeightChange(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    // Images settle after layout; re-measure once they are in.
    const images = Array.from(body.querySelectorAll("img"));
    images.forEach((img) => img.addEventListener("load", measure));
    return () => {
      observer.disconnect();
      images.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [body, viewportHeight, onHeightChange, children]);

  return (
    <iframe
      ref={frameRef}
      title="ตัวอย่างหน้าเว็บ"
      tabIndex={-1}
      scrolling="no"
      className="border-0 block pointer-events-none"
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: "top left"
      }}
    >
      {body && createPortal(children, body)}
    </iframe>
  );
}
