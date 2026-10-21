// src/utils/inlineStyles.js

// 👇 Dodaj parametr forceFill (domyślnie true)
export const inlineStyles = (sourceElement, forceFill = true) => {
    if (!sourceElement) return null;
  
    const clonedSvg = sourceElement.cloneNode(true);
    const sourceElements = sourceElement.querySelectorAll('*');
    const clonedElements = clonedSvg.querySelectorAll('*');
  
    clonedElements.forEach((el, i) => {
      const srcEl = sourceElements[i];
      if (!srcEl) return;
      
      const computed = window.getComputedStyle(srcEl);
      
      const properties = [
        'stroke', 'stroke-width', 
        'font-size', 'font-weight', 'font-family',
        'clip-path', 'transform', 
        'opacity', 'visibility'
      ];
  
      if (forceFill) {
        properties.push('fill');
      }
  
      properties.forEach(prop => {
        const val = computed.getPropertyValue(prop);
        
        if (val && val !== 'none' && val !== 'auto' && val !== '0px') {
          el.style[prop] = val;
        }
        
        // Specjalne traktowanie atrybutów (tylko jeśli forceFill włączone dla fill)
        if (forceFill && prop === 'fill' && val !== 'none') {
          el.setAttribute('fill', val.replace(/url\(["']?(#[^"')]+)["']?\)/, 'url($1)'));
        }
        if (prop === 'stroke' && val !== 'none') {
            el.setAttribute('stroke', val); 
        }
      });
    });
  
    return clonedSvg;
  };