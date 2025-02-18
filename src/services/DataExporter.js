import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default class DataExporter {
  constructor() {
    this.dateFormat = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  async exportWorkouts(format = "csv") {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/workouts/export", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch workout data");
      }

      const data = await response.json();

      switch (format) {
        case "csv":
          return this.generateCSV(data.workouts, "workouts");
        case "json":
          return this.generateJSON(data.workouts, "workouts");
        case "pdf":
          return this.generatePDF(data.workouts, "workouts");
        case "excel":
          return this.generateExcel(data.workouts, "workouts");
        default:
          throw new Error("Unsupported format");
      }
    } catch (error) {
      console.error("Error exporting workouts:", error);
      throw error;
    }
  }

  generateCSV(data, type) {
    const headers = this.getHeaders(type);
    const rows = this.formatData(data, type);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    this.downloadFile(csv, `${type}_export.csv`, "text/csv");
  }

  generateJSON(data, type) {
    const jsonString = JSON.stringify(data, null, 2);
    this.downloadFile(jsonString, `${type}_export.json`, "application/json");
  }

  async generatePDF(data, type) {
    const doc = new jsPDF();
    const headers = this.getHeaders(type);
    const rows = this.formatData(data, type);

    // Add title
    doc.setFontSize(16);
    doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 22);

    // Add table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    // Add summary if available
    if (data.summary) {
      const summaryY = doc.lastAutoTable.finalY + 10;
      doc.text("Summary", 14, summaryY);
      Object.entries(data.summary).forEach(([key, value], index) => {
        doc.text(`${key}: ${value}`, 14, summaryY + (index + 1) * 7);
      });
    }

    this.downloadFile(
      doc.output("blob"),
      `${type}_export.pdf`,
      "application/pdf"
    );
  }

  generateExcel(data, type) {
    const headers = this.getHeaders(type);
    const rows = this.formatData(data, type);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Add styling
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "3498DB" } },
      alignment: { horizontal: "center" },
    };

    // Apply header styles
    for (let i = 0; i < headers.length; i++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      worksheet[cellRef].s = headerStyle;
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type);

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.downloadFile(
      new Blob([excelBuffer]),
      `${type}_export.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  }

  getHeaders(type) {
    const headers = {
      workouts: [
        "Date",
        "Name",
        "Duration",
        "Exercises",
        "Sets",
        "Reps",
        "Weight",
        "Notes",
      ],
      nutrition: ["Date", "Food", "Calories", "Protein", "Carbs", "Fats"],
      progress: ["Date", "Metric", "Value", "Goal", "Progress"],
    };

    return headers[type] || [];
  }

  formatData(data, type) {
    switch (type) {
      case "workouts":
        return data.map((workout) => [
          this.dateFormat.format(new Date(workout.date)),
          workout.name,
          workout.duration,
          workout.exercises.map((e) => e.name).join(";"),
          workout.exercises.map((e) => e.sets).join(";"),
          workout.exercises.map((e) => e.reps).join(";"),
          workout.exercises.map((e) => e.weight).join(";"),
          workout.notes || "",
        ]);
      default:
        return [];
    }
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Add comparison methods
  async compareData(type, period1, period2) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/compare/${type}?period1=${period1}&period2=${period2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comparison data");
      }

      return await response.json();
    } catch (error) {
      console.error("Error comparing data:", error);
      throw error;
    }
  }
}
