// Export table data to CSV
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle commas and quotes in values
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Print report
export function printReport(elementId) {
  const printContent = document.getElementById(elementId);
  if (!printContent) return;

  const windowPrint = window.open("", "", "width=800,height=600");
  windowPrint.document.write("<html><head><title>Print Report</title>");
  windowPrint.document.write(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      h1 { color: #333; }
      .summary { margin: 20px 0; }
      .summary-item { margin: 5px 0; }
    </style>
  `);
  windowPrint.document.write("</head><body>");
  windowPrint.document.write(printContent.innerHTML);
  windowPrint.document.write("</body></html>");
  windowPrint.document.close();
  windowPrint.focus();
  windowPrint.print();
  windowPrint.close();
}
