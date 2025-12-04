// src/utils/imageUtils.js
export const resizeImage = (file, maxWidth = 200) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const ratio = img.height / img.width;
          const newWidth = maxWidth;
          const newHeight = maxWidth * ratio;
          
          const canvas = document.createElement('canvas');
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Zwracamy jako Base64 PNG (zachowuje przezroczystość)
          resolve(canvas.toDataURL('image/png', 0.8));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };