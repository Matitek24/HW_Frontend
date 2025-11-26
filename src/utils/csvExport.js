export const exportProjectsToCSV = (projects, filename = null) => {
    if (!projects || projects.length === 0) {
      alert("Brak danych do eksportu.");
      return;
    }
  
    // 1. Nagłówki kolumn
    const headers = [
      "ID", "Data", "Klient", "Email", "Telefon", 
      "Firma", "Ilosc", "Status", "Uwagi"
    ];
  
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
  
    // 2. Dane wierszy
    projects.forEach(p => {
      const safe = (text) => {
        if (text === null || text === undefined) return '""';
        const stringText = text.toString();
        if (stringText.includes(',') || stringText.includes('"') || stringText.includes('\n')) {
          return `"${stringText.replace(/"/g, '""')}"`;
        }
        return stringText;
      };
  
      const row = [
        p.id,
        safe(p.createdAt),
        safe(p.client.name),
        safe(p.client.email),
        safe(p.client.phone),
        safe(p.client.company),
        p.order.quantity,
        safe(p.status),
        safe(p.order.notes)
      ].join(",");
      
      csvContent += row + "\n";
    });
  
    // 3. Tworzenie i pobieranie pliku
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    // Domyślna nazwa pliku z datą
    const defaultFilename = `zamowienia_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", filename || defaultFilename);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };