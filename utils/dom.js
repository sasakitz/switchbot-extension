const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const HTML_TAGS = new Set(['div', 'span', 'button', 'input']);
const SVG_TAGS = new Set(['svg', 'path', 'circle', 'rect']);
const HTML_ATTRIBUTES = new Set([
  'class', 'title', 'role', 'draggable', 'disabled', 'type', 'min', 'max', 'value',
  'aria-hidden', 'aria-label', 'aria-pressed', 'data-filter', 'data-device-id',
  'data-id', 'data-type', 'data-cmd', 'data-mode', 'data-order-action',
]);
const SVG_ATTRIBUTES = new Set([
  'width', 'height', 'viewBox', 'd', 'x', 'y', 'cx', 'cy', 'r', 'rx',
  'opacity', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'aria-hidden',
]);
const STYLE_PROPERTIES = new Set([
  '--card-accent', '--icon-bg', '--icon-color', 'display', 'width', 'height',
  'border-radius', 'background', 'border',
]);
const SAFE_COLOR = /^(?:none|white|currentColor|#[\da-f]{3,8}|rgba?\([\d.,\s]+\))$/i;
const SAFE_STYLE = /^(?:inline-block|[\d.]+px|[\d.]+%|(?:1px solid )?(?:#[\da-f]{3,8}|rgba?\([\d.,\s]+\)))$/i;

// Parse only our local templates in an inert document, then recreate a small
// allowlist of elements. Never insert parsed nodes or allow URLs/event handlers.
export function createSafeFragment(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const fragment = document.createDocumentFragment();
  function appendSafe(parent, source) {
    if (source.nodeType === 3) {
      parent.appendChild(document.createTextNode(source.textContent));
      return;
    }
    if (source.nodeType !== 1) return;
    const svg = source.namespaceURI === SVG_NAMESPACE;
    if (!svg && source.namespaceURI !== HTML_NAMESPACE) return;
    if (!(svg ? SVG_TAGS : HTML_TAGS).has(source.localName)) return;
    const target = svg
      ? document.createElementNS(SVG_NAMESPACE, source.localName)
      : document.createElement(source.localName);
    for (const attribute of source.attributes) {
      const { name, value } = attribute;
      if ((svg ? SVG_ATTRIBUTES : HTML_ATTRIBUTES).has(name)) {
        target.setAttribute(name, value);
      } else if (svg && ['fill', 'stroke'].includes(name) && SAFE_COLOR.test(value)) {
        target.setAttribute(name, value);
      } else if (!svg && name === 'style') {
        for (let index = 0; index < source.style.length; index++) {
          const property = source.style.item(index);
          const cssValue = source.style.getPropertyValue(property).trim();
          if (STYLE_PROPERTIES.has(property) && SAFE_STYLE.test(cssValue)) {
            target.style.setProperty(property, cssValue);
          }
        }
      }
    }
    for (const child of source.childNodes) appendSafe(target, child);
    parent.appendChild(target);
  }
  for (const child of parsed.body.childNodes) appendSafe(fragment, child);
  return fragment;
}
