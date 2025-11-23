// utils/warpTransform.js
import Warp from 'warpjs';

// Mapa przechowująca instancje Warp dla różnych elementów
const warpInstances = new Map();

/**
 * Konwertuje podstawowe kształty SVG (rect, circle, ellipse, polygon) na <path>
 */
const convertShapeToPath = (shape) => {
  let d = "";
  const tagName = shape.tagName.toLowerCase();
  
  if (tagName === 'polygon' || tagName === 'polyline') {
    const pointsStr = shape.getAttribute('points');
    if (!pointsStr) return null;
    
    const coords = pointsStr.trim().split(/[\s,]+/);
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (y === undefined) break;
      d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }
    if (tagName === 'polygon') d += " Z";
    
  } else if (tagName === 'rect') {
    const x = parseFloat(shape.getAttribute('x') || 0);
    const y = parseFloat(shape.getAttribute('y') || 0);
    const w = parseFloat(shape.getAttribute('width') || 0);
    const h = parseFloat(shape.getAttribute('height') || 0);
    d = `M ${x} ${y} L ${x+w} ${y} L ${x+w} ${y+h} L ${x} ${y+h} Z`;
    
  } else if (tagName === 'circle') {
    const cx = parseFloat(shape.getAttribute('cx') || 0);
    const cy = parseFloat(shape.getAttribute('cy') || 0);
    const r = parseFloat(shape.getAttribute('r') || 0);
    d = `M ${cx-r} ${cy} A ${r} ${r} 0 1 0 ${cx+r} ${cy} A ${r} ${r} 0 1 0 ${cx-r} ${cy}`;
    
  } else if (tagName === 'ellipse') {
    const cx = parseFloat(shape.getAttribute('cx') || 0);
    const cy = parseFloat(shape.getAttribute('cy') || 0);
    const rx = parseFloat(shape.getAttribute('rx') || 0);
    const ry = parseFloat(shape.getAttribute('ry') || 0);
    d = `M ${cx-rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx+rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx-rx} ${cy}`;
  }
  
  if (!d) return null;
  
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute('d', d);
  
  // Kopiowanie atrybutów z oryginalnego kształtu
  ['class', 'style', 'fill', 'stroke', 'stroke-width', 'opacity'].forEach(attr => {
    const val = shape.getAttribute(attr);
    if (val) path.setAttribute(attr, val);
  });
  
  return path;
};

/**
 * Inicjalizuje Warp.js dla danego elementu
 */
const initWarp = (svgContainer, targetSelector) => {
  if (!svgContainer) return null;
  
  const elementToBend = svgContainer.querySelector(targetSelector);
  if (!elementToBend) {
    console.warn(`Nie znaleziono elementu: ${targetSelector}`);
    return null;
  }
  
  // Konwersja kształtów na ścieżki
  const shapes = elementToBend.querySelectorAll('polygon, polyline, rect, circle, ellipse');
  shapes.forEach(shape => {
    const path = convertShapeToPath(shape);
    if (path) {
      shape.parentNode.replaceChild(path, shape);
    }
  });
  
  const warp = new Warp(elementToBend);
  warp.interpolate(4); 
  return warp;
};

/**
 * Aplikuje efekt zakrzywienia (paraboliczne zgięcie) na element SVG
 */
export const bendIt = (svgContainer, targetSelector, centerX = 297, bendStrength = -0.00012) => {
  const key = targetSelector;
  
  if (!warpInstances.has(key)) {
    const instance = initWarp(svgContainer, targetSelector);
    if (!instance) return;
    warpInstances.set(key, instance);
  }
  
  const warp = warpInstances.get(key);
  warp.transform(([x, y]) => {
    const dist = x - centerX;
    const bendOffset = bendStrength * Math.pow(dist, 2);
    return [x, y + bendOffset];
  });
};

/**
 * Resetuje instancję Warp dla danego selektora
 */
export const resetWarp = (targetSelector) => {
  warpInstances.delete(targetSelector);
};

/**
 * Resetuje wszystkie instancje Warp
 */
export const resetAllWarps = () => {
  warpInstances.clear();
};