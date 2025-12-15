export const resizeImage = (file, maxWidth = 800, format = 'image/webp', quality = 0.75) => {
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
        
      
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
   
        if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF'; 
            ctx.fillRect(0, 0, newWidth, newHeight);
        }

        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        resolve(canvas.toDataURL(format, quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};