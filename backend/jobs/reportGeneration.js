import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure reports directory exists
const reportsDir = path.join(__dirname, "../reports");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

class PDFReportGenerator {
  constructor() {
    // Soft, pastel color palette
    this.colors = {
      primary: "#3b82f6", // Soft blue
      primaryLight: "#dbeafe", // Very light blue
      success: "#34d399", // Soft green
      successLight: "#d1fae5", // Very light green
      warning: "#fbbf24", // Soft amber
      warningLight: "#fef3c7", // Very light amber
      danger: "#f87171", // Soft red
      dangerLight: "#fee2e2", // Very light red
      gray: "#6b7280", // Medium gray
      lightGray: "#f8fafc", // Very light gray
      darkGray: "#374151", // Dark gray
      white: "#ffffff",
    };
  }

  // Create a new PDF document
  createDocument(landscape = false) {
    return new PDFDocument({
      size: "A4",
      layout: landscape ? "landscape" : "portrait",
      margins: { top: 35, bottom: 35, left: 35, right: 35 },
      bufferPages: true,
    });
  }

  // Draw rounded rectangle
  drawRoundedRect(doc, x, y, width, height, radius = 8) {
    doc.roundedRect(x, y, width, height, radius);
    return doc;
  }

  // Enhanced header with soft styling
  addHeader(doc, title, subtitle, isLandscape = false) {
    const pageWidth = isLandscape ? doc.page.height : doc.page.width;
    const startX = 35;
    const endX = pageWidth - 35;
    const width = endX - startX;

    // Soft background header
    this.drawRoundedRect(doc, startX, 20, width, 75, 8)
      .fillColor(this.colors.primaryLight)
      .fill();

    // Title
    doc
      .fillColor(this.colors.primary)
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(title, startX + 20, 32, {
        width: width - 40,
        align: "left",
      });

    // Subtitle
    if (subtitle) {
      doc
        .fillColor(this.colors.gray)
        .fontSize(10)
        .font("Helvetica")
        .text(subtitle, startX + 20, 60, {
          width: width - 40,
          align: "left",
        });
    }

    doc.y = 105;
  }

  // --- FIXED: Smart footer with margin handling to prevent extra pages ---
  addFootersWithCorrectPageCount(doc, totalPages) {
    const range = doc.bufferedPageRange();

    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);

      // CRITICAL FIX: Temporarily remove margins.
      // This prevents pdfkit from creating a new page when we write at the bottom.
      const oldMargins = { ...doc.page.margins };
      doc.page.margins = { top: 0, bottom: 0, left: 0, right: 0 };

      const pageHeight = doc.page.height;
      const pageWidth = doc.page.width;

      // Soft footer line
      doc
        .strokeColor(this.colors.primaryLight)
        .lineWidth(1)
        .moveTo(35, pageHeight - 40)
        .lineTo(pageWidth - 35, pageHeight - 40)
        .stroke();

      // Footer text - with correct page numbering
      doc
        .fontSize(9)
        .fillColor(this.colors.gray)
        .text(`Page ${i + 1} of ${totalPages}`, 35, pageHeight - 30, {
          align: "left",
          width: 200,
          lineBreak: false,
        });

      doc
        .fontSize(9)
        .fillColor(this.colors.gray)
        .text(
          new Date().toLocaleDateString(),
          pageWidth - 135,
          pageHeight - 30,
          {
            align: "right",
            width: 100,
            lineBreak: false,
          }
        );

      // Restore margins
      doc.page.margins = oldMargins;
    }
  }

  // Modern section title with accent
  addSectionTitle(doc, title, checkPageBreak = true) {
    if (checkPageBreak && doc.y > 720) {
      doc.addPage();
      doc.y = 35;
    }

    // Left accent bar
    doc.fillColor(this.colors.primary).rect(35, doc.y, 4, 20).fill();

    doc
      .fillColor(this.colors.darkGray)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(title, 45, doc.y + 2)
      .moveDown(0.6);
  }

  // Enhanced key-value with soft styling
  addKeyValue(doc, key, value, options = {}) {
    const { color = this.colors.darkGray, bold = false, indent = 0 } = options;

    if (doc.y > 750) {
      doc.addPage();
      doc.y = 35;
    }

    doc
      .fillColor(this.colors.gray)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(key + ":", 35 + indent, doc.y, { continued: true, width: 140 })
      .fillColor(color)
      .font(bold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .text(" " + (value || "N/A"), { width: 350 })
      .moveDown(0.3);
  }

  // Modern table with soft styling and rounded appearance
  addTable(doc, headers, rows, columnWidths, options = {}) {
    const { startX = 35, headerColor = this.colors.primary } = options;
    let startY = doc.y;

    if (startY > 700) {
      doc.addPage();
      startY = 35;
      doc.y = startY;
    }

    const rowHeight = 28;
    const headerHeight = 32;
    const tableWidth = columnWidths.reduce((a, b) => a + b, 0);

    // Draw header with rounded top corners
    this.drawRoundedRect(doc, startX, startY, tableWidth, headerHeight, 6)
      .fillColor(headerColor)
      .fill();

    // Header text
    doc.fillColor(this.colors.white).fontSize(9).font("Helvetica-Bold");
    let currentX = startX;
    headers.forEach((header, i) => {
      doc.text(header, currentX + 8, startY + 10, {
        width: columnWidths[i] - 16,
        align: "left",
      });
      currentX += columnWidths[i];
    });

    let currentY = startY + headerHeight;

    // Draw rows
    rows.forEach((row, rowIndex) => {
      // Check page break
      if (currentY > doc.page.height - 80) {
        doc.addPage();
        currentY = 35;

        // Redraw header on new page
        this.drawRoundedRect(doc, startX, currentY, tableWidth, headerHeight, 6)
          .fillColor(headerColor)
          .fill();

        doc.fillColor(this.colors.white).fontSize(9).font("Helvetica-Bold");
        let headerX = startX;
        headers.forEach((header, i) => {
          doc.text(header, headerX + 8, currentY + 10, {
            width: columnWidths[i] - 16,
            align: "left",
          });
          headerX += columnWidths[i];
        });
        currentY += headerHeight;
      }

      // Alternate row colors - soft
      const fillColor =
        rowIndex % 2 === 0 ? this.colors.white : this.colors.lightGray;

      doc
        .fillColor(fillColor)
        .rect(startX, currentY, tableWidth, rowHeight)
        .fill();

      // Subtle row separator
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(0.5)
        .moveTo(startX, currentY + rowHeight)
        .lineTo(startX + tableWidth, currentY + rowHeight)
        .stroke();

      // Row text
      doc.fillColor(this.colors.darkGray).fontSize(8).font("Helvetica");
      currentX = startX;
      row.forEach((cell, cellIndex) => {
        doc.text(String(cell || ""), currentX + 8, currentY + 9, {
          width: columnWidths[cellIndex] - 16,
          align: "left",
        });
        currentX += columnWidths[cellIndex];
      });

      currentY += rowHeight;
    });

    // Rounded bottom border
    doc
      .strokeColor(this.colors.primaryLight)
      .lineWidth(1.5)
      .moveTo(startX, currentY)
      .lineTo(startX + tableWidth, currentY)
      .stroke();

    doc.y = currentY + 15;
  }

  // Enhanced metrics cards with soft colors and rounded corners
  addMetricsCards(doc, metrics, columns = 4) {
    const pageWidth = doc.page.width;
    const margins = 35;
    const availableWidth = pageWidth - 2 * margins;
    const spacing = 12;
    const cardWidth = (availableWidth - spacing * (columns - 1)) / columns;
    const cardHeight = 75;
    let x = margins;
    let y = doc.y;

    metrics.forEach((metric, index) => {
      if (index > 0 && index % columns === 0) {
        y += cardHeight + spacing + 5;
        x = margins;

        if (y > doc.page.height - 120) {
          doc.addPage();
          y = 35;
        }
      }

      // Soft background card with rounded corners and border
      this.drawRoundedRect(doc, x, y, cardWidth, cardHeight, 8)
        .lineWidth(1.5)
        .strokeColor(this.colors.primaryLight)
        .fillAndStroke(this.colors.white, this.colors.primaryLight);

      // Colored top accent bar
      this.drawRoundedRect(doc, x, y, cardWidth, 4, 2)
        .fillColor(metric.color || this.colors.primary)
        .fill();

      // Metric label
      doc
        .fillColor(this.colors.gray)
        .fontSize(8)
        .font("Helvetica")
        .text(metric.label, x + 10, y + 12, {
          width: cardWidth - 20,
          align: "center",
        });

      // Metric value
      doc
        .fillColor(metric.color || this.colors.primary)
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(metric.value, x + 10, y + 32, {
          width: cardWidth - 20,
          align: "center",
        });

      // Metric unit
      if (metric.unit) {
        doc
          .fillColor(this.colors.gray)
          .fontSize(7)
          .font("Helvetica")
          .text(metric.unit, x + 10, y + 58, {
            width: cardWidth - 20,
            align: "center",
          });
      }

      x += cardWidth + spacing;
    });

    doc.y = y + cardHeight + 20;
  }

  // --- FIXED: Safe Bar Chart (prevents NaN/Crash) ---
  drawBarChart(doc, data, options = {}) {
    const { title = "Chart", width = 450, height = 160, startX = 50 } = options;

    // 1. Calculate Max Value Safely
    let derivedMax = Math.max(...data.map((d) => Number(d.value) || 0));
    if (derivedMax === 0) derivedMax = 1; // Prevent division by zero

    // Allow options to override
    const maxValue = options.maxValue || derivedMax;

    if (doc.y > 650) {
      doc.addPage();
      doc.y = 35;
    }

    const startY = doc.y;

    // Chart title
    doc
      .fillColor(this.colors.darkGray)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(title, startX, startY);

    const chartStartY = startY + 25;

    // Safety check for empty data
    const barWidth = data.length > 0 ? (width - 40) / data.length : 0;
    const maxBarHeight = height - 30;

    // Draw bars
    data.forEach((item, index) => {
      // 2. Safely calculate values
      const val = Number(item.value) || 0;
      const barHeight = (val / maxValue) * maxBarHeight;

      const x = startX + index * barWidth + 5;
      const y = chartStartY + maxBarHeight - barHeight;

      // 3. Only draw if valid
      if (!isNaN(x) && !isNaN(y) && !isNaN(barWidth) && !isNaN(barHeight)) {
        // Soft bar with rounded top
        this.drawRoundedRect(doc, x, y, barWidth - 10, barHeight, 3)
          .fillColor(item.color || this.colors.primary)
          .fill();

        // Value on top
        doc
          .fillColor(this.colors.darkGray)
          .fontSize(7)
          .font("Helvetica-Bold")
          .text(String(val), x, y - 12, {
            width: barWidth - 10,
            align: "center",
          });

        // Label
        doc
          .fillColor(this.colors.gray)
          .fontSize(6)
          .font("Helvetica")
          .text(item.label || "", x, chartStartY + maxBarHeight + 5, {
            width: barWidth - 10,
            align: "center",
          });
      }
    });

    doc.y = chartStartY + height + 15;
  }

  // Pie chart visualization (for page 1)
  drawPieChart(doc, data, options = {}) {
    const { title = "Chart", radius = 60, startX = 250, startY = 50 } = options;

    if (doc.y > 650) {
      doc.addPage();
      doc.y = 35;
    }

    const chartY = doc.y;

    // Chart title
    doc
      .fillColor(this.colors.darkGray)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(title, startX - 60, chartY);

    const centerX = startX + 60;
    const centerY = chartY + 80;
    let currentAngle = 0;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * (Math.PI * 2);

      // Draw slice
      doc
        .fillColor(item.color || this.colors.primary)
        .moveTo(centerX, centerY)
        .arc(
          centerX,
          centerY,
          radius,
          currentAngle,
          currentAngle + sliceAngle,
          false
        )
        .lineTo(centerX, centerY)
        .fill();

      // Legend
      const legendY = chartY + 50 + index * 20;
      doc
        .fillColor(item.color || this.colors.primary)
        .rect(startX - 60, legendY, 12, 12)
        .fill();

      doc
        .fillColor(this.colors.darkGray)
        .fontSize(9)
        .font("Helvetica")
        .text(`${item.label}: ${item.value}`, startX - 35, legendY + 1);

      currentAngle += sliceAngle;
    });

    doc.y = chartY + 180;
  }

  // Equipment card with soft styling
  addEquipmentCard(doc, eq, index) {
    if (doc.y > 680) {
      doc.addPage();
      doc.y = 35;
    }

    const cardY = doc.y;
    const cardHeight = 120;
    const pageWidth = doc.page.width;

    const healthScore = eq.currentStatus?.healthScore || 0;
    const accentColor =
      healthScore > 70
        ? this.colors.success
        : healthScore > 40
        ? this.colors.warning
        : this.colors.danger;

    // Card background with rounded corners and border
    this.drawRoundedRect(doc, 35, cardY, pageWidth - 70, cardHeight, 8)
      .lineWidth(1)
      .strokeColor(this.colors.primaryLight)
      .fillAndStroke(this.colors.lightGray, this.colors.primaryLight);

    // Left colored accent
    doc.fillColor(accentColor).rect(35, cardY, 4, cardHeight).fill();

    // Equipment name and ID
    doc
      .fillColor(this.colors.darkGray)
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`${index}. ${eq.equipment.name}`, 50, cardY + 10, { width: 320 });

    doc
      .fillColor(this.colors.gray)
      .fontSize(8)
      .font("Helvetica")
      .text(`ID: ${eq.equipment.equipmentId}`, 50, cardY + 25);

    // Two column layout
    const col1X = 50;
    const col2X = 310;
    let detailY = cardY + 42;

    // Column 1
    doc.fontSize(8).font("Helvetica-Bold").fillColor(this.colors.gray);
    doc.text("Department:", col1X, detailY);
    doc.font("Helvetica").fillColor(this.colors.darkGray).fontSize(8);
    doc.text(eq.equipment.department, col1X + 70, detailY);

    detailY += 12;
    doc.font("Helvetica-Bold").fillColor(this.colors.gray).fontSize(8);
    doc.text("Location:", col1X, detailY);
    doc.font("Helvetica").fillColor(this.colors.darkGray).fontSize(8);
    doc.text(eq.equipment.location, col1X + 70, detailY);

    detailY += 12;
    doc.font("Helvetica-Bold").fillColor(this.colors.gray).fontSize(8);
    doc.text("Usage:", col1X, detailY);
    doc.font("Helvetica").fillColor(this.colors.darkGray).fontSize(8);
    doc.text(
      `${eq.usageMetrics.totalUsageHours.toFixed(1)} hrs`,
      col1X + 70,
      detailY
    );

    // Column 2
    detailY = cardY + 42;
    doc.font("Helvetica-Bold").fillColor(this.colors.gray).fontSize(8);
    doc.text("Health:", col2X, detailY);
    doc.font("Helvetica-Bold").fillColor(accentColor).fontSize(8);
    doc.text(`${healthScore}%`, col2X + 60, detailY);

    detailY += 12;
    doc.font("Helvetica-Bold").fillColor(this.colors.gray).fontSize(8);
    doc.text("Status:", col2X, detailY);
    doc.font("Helvetica").fillColor(this.colors.darkGray).fontSize(8);
    doc.text(eq.currentStatus?.status || "N/A", col2X + 60, detailY);

    detailY += 12;
    doc.font("Helvetica-Bold").fillColor(this.colors.gray).fontSize(8);
    doc.text("Utilization:", col2X, detailY);
    doc.font("Helvetica").fillColor(this.colors.darkGray).fontSize(8);
    doc.text(
      `${eq.usageMetrics.avgUtilization.toFixed(1)}%`,
      col2X + 60,
      detailY
    );

    doc.y = cardY + cardHeight + 12;
  }

  // --- UPDATED: Daily Report with Wide Department Graph ---
  async generateDailyReport(data) {
    const doc = this.createDocument();
    const fileName = `daily-report-${
      new Date().toISOString().split("T")[0]
    }-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // PAGE 1 - Header and Summary
    this.addHeader(
      doc,
      "Daily Equipment Report",
      `${data.period.start.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`
    );

    // Summary Section
    this.addSectionTitle(doc, "Daily Overview");

    const summaryMetrics = [
      {
        label: "Total Equipment",
        value: data.summary.totalEquipment,
        color: this.colors.primary,
      },
      {
        label: "Avg Health Score",
        value: data.summary.avgHealthScore.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
      {
        label: "Total Alerts",
        value: data.summary.totalAlerts,
        color: this.colors.warning,
      },
      {
        label: "Critical Alerts",
        value: data.summary.criticalAlerts,
        color: this.colors.danger,
      },
    ];

    this.addMetricsCards(doc, summaryMetrics, 4);

    const operationalMetrics = [
      {
        label: "Downtime",
        value: data.summary.totalDowntime.toFixed(1),
        unit: "hrs",
        color: this.colors.danger,
      },
      {
        label: "Energy Consumed",
        value: data.summary.totalEnergyConsumed.toFixed(1),
        unit: "kWh",
        color: this.colors.primary,
      },
      {
        label: "Avg Utilization",
        value: data.summary.avgUtilization.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
    ];

    this.addMetricsCards(doc, operationalMetrics, 3);

    // GRAPH 1: Equipment Status
    this.addSectionTitle(doc, "Equipment Status");

    const statusData = Object.entries(data.summary.equipmentByStatus).map(
      ([status, count]) => ({
        label: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color:
          status === "active"
            ? this.colors.success
            : status === "maintenance"
            ? this.colors.warning
            : this.colors.danger,
      })
    );

    if (statusData.length > 0) {
      this.drawBarChart(doc, statusData, {
        title: "Operational Status Breakdown",
        width: 450,
        height: 130,
      });
    }

    // GRAPH 2: Wide Department Health Analysis (replaces Pie Chart)
    const deptStats = {};
    data.equipmentDetails.forEach((eq) => {
      const rawDept = eq.equipment.department || "Unknown";
      const deptName = rawDept
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (!deptStats[deptName]) {
        deptStats[deptName] = { totalScore: 0, count: 0 };
      }
      deptStats[deptName].totalScore += eq.currentStatus?.healthScore || 0;
      deptStats[deptName].count += 1;
    });

    const deptChartData = Object.entries(deptStats).map(([dept, stats]) => {
      const avgScore = Math.round(stats.totalScore / stats.count);
      return {
        label: dept,
        value: avgScore,
        color:
          avgScore > 70
            ? this.colors.success
            : avgScore > 40
            ? this.colors.warning
            : this.colors.danger,
      };
    });

    if (deptChartData.length > 0) {
      this.addSectionTitle(doc, "Department Health Overview", false);
      this.drawBarChart(doc, deptChartData, {
        title: "Average Health Score by Department",
        width: 520,
        height: 140,
        startX: 35,
        maxValue: 100,
      });
    }

    // PAGE 2 - Equipment Details
    doc.addPage();
    this.addHeader(
      doc,
      "Daily Equipment Report",
      `Equipment Details - ${data.period.start.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })}`
    );

    this.addSectionTitle(doc, "Top Equipment Details");

    const topEquipment = data.equipmentDetails.slice(0, 5);
    topEquipment.forEach((eq, index) => {
      this.addEquipmentCard(doc, eq, index + 1);
    });

    // PAGE 3 - Report Info
    doc.addPage();
    this.addSectionTitle(doc, "Report Generated By", false);

    const infoY = doc.y + 10;
    this.drawRoundedRect(doc, 35, infoY, doc.page.width - 70, 80, 8)
      .lineWidth(1.5)
      .strokeColor(this.colors.primary)
      .fillAndStroke(this.colors.primaryLight, this.colors.primary);

    doc
      .fillColor(this.colors.gray)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Generated By:", 50, infoY + 15);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.name, 150, infoY + 15);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Email:", 50, infoY + 35);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.email, 150, infoY + 35);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Date:", 50, infoY + 55);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedAt.toLocaleString(), 150, infoY + 55);

    // Add footers
    const totalPages = doc.bufferedPageRange().count;
    this.addFootersWithCorrectPageCount(doc, totalPages);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(`/reports/${fileName}`));
      stream.on("error", reject);
    });
  }

  // --- FIXED: Weekly Report (Stable Promise & Clean Footers) ---
  async generateWeeklyReport(data) {
    const doc = this.createDocument();
    const fileName = `weekly-report-${
      new Date().toISOString().split("T")[0]
    }-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // --- PAGE 1: Header and Summary ---
    this.addHeader(
      doc,
      "Weekly Equipment Report",
      `${data.period.start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${data.period.end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
    );

    // Summary Section
    this.addSectionTitle(doc, "Weekly Summary");

    const summaryMetrics = [
      {
        label: "Total Equipment",
        value: data.summary.totalEquipment,
        color: this.colors.primary,
      },
      {
        label: "Avg Health Score",
        value: data.summary.avgHealthScore.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
      {
        label: "Total Alerts",
        value: data.summary.totalAlerts,
        color: this.colors.warning,
      },
      {
        label: "Maintenance",
        value: data.summary.totalMaintenanceActivities,
        color: this.colors.primary,
      },
    ];

    this.addMetricsCards(doc, summaryMetrics, 4);

    const costMetrics = [
      {
        label: "Maintenance Cost",
        value: `$${data.summary.totalMaintenanceCost.toFixed(0)}`,
        color: this.colors.danger,
      },
      {
        label: "Energy Consumed",
        value: data.summary.totalEnergyConsumed.toFixed(1),
        unit: "kWh",
        color: this.colors.primary,
      },
      {
        label: "Usage Hours",
        value: data.summary.totalUsageHours.toFixed(1),
        unit: "hrs",
        color: this.colors.success,
      },
    ];

    this.addMetricsCards(doc, costMetrics, 3);

    // --- PAGE 2: Equipment Performance (Landscape) ---
    doc.addPage({ layout: "landscape", margin: 35 });
    this.addHeader(doc, "Equipment Performance", null, true);

    const headers = [
      "Equipment",
      "Health",
      "Utilization",
      "Alerts",
      "Maintenance",
    ];
    const columnWidths = [280, 90, 110, 80, 100];
    const rows = data.equipmentDetails
      .slice(0, 12)
      .map((eq) => [
        eq.equipment.name.substring(0, 35),
        `${eq.currentStatus?.healthScore || 0}%`,
        `${eq.usageMetrics.avgUtilization.toFixed(1)}%`,
        eq.alertMetrics.totalAlerts,
        eq.maintenanceMetrics.totalMaintenance,
      ]);

    this.addTable(doc, headers, rows, columnWidths);

    // --- PAGE 3: Maintenance Analysis (Portrait) ---
    doc.addPage({ layout: "portrait", margin: 35 });
    this.addHeader(doc, "Maintenance Analysis", null, false);

    this.addSectionTitle(doc, "Maintenance Activities");

    const maintenanceData = data.equipmentDetails.reduce((acc, eq) => {
      Object.entries(eq.maintenanceMetrics.maintenanceByType).forEach(
        ([type, count]) => {
          if (count > 0) acc[type] = (acc[type] || 0) + count;
        }
      );
      return acc;
    }, {});

    const maintenanceChartData = Object.entries(maintenanceData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([type, count]) => ({
        label: type.substring(0, 12),
        value: count,
        color: this.colors.primary,
      }));

    if (maintenanceChartData.length > 0) {
      this.drawBarChart(doc, maintenanceChartData, {
        title: "Maintenance Distribution",
        width: 450,
        height: 150,
      });
    } else {
      doc
        .fontSize(10)
        .fillColor(this.colors.gray)
        .text("No maintenance activities recorded for this period.", {
          align: "left",
        });
      doc.moveDown(2);
    }

    // Cost card logic
    if (doc.y > 650) {
      doc.addPage();
      doc.y = 35;
    }

    this.addSectionTitle(doc, "Cost Summary", false);

    const costY = doc.y;
    this.drawRoundedRect(doc, 35, costY, doc.page.width - 70, 60, 8)
      .lineWidth(2)
      .strokeColor(this.colors.danger)
      .fillAndStroke(this.colors.dangerLight, this.colors.danger);

    doc
      .fillColor(this.colors.danger)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Total Maintenance Cost", 55, costY + 12);

    doc
      .fontSize(22)
      .text(`$${data.summary.totalMaintenanceCost.toFixed(2)}`, 55, costY + 28);

    doc.y = costY + 65;

    // --- Final Info Section ---
    if (doc.y > 680) doc.addPage();

    this.addSectionTitle(doc, "Report Information", false);

    const infoY = doc.y + 10;
    this.drawRoundedRect(doc, 35, infoY, doc.page.width - 70, 80, 8)
      .lineWidth(1.5)
      .strokeColor(this.colors.primary)
      .fillAndStroke(this.colors.primaryLight, this.colors.primary);

    doc
      .fillColor(this.colors.gray)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Generated By:", 50, infoY + 15);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.name, 150, infoY + 15);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Email:", 50, infoY + 35);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.email, 150, infoY + 35);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Date:", 50, infoY + 55);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedAt.toLocaleString(), 150, infoY + 55);

    // --- Add Footers correctly at the end ---
    const totalPages = doc.bufferedPageRange().count;
    this.addFootersWithCorrectPageCount(doc, totalPages);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(`/reports/${fileName}`);
      });
      stream.on("error", reject);
    });
  }

  // Generate Monthly Report PDF
  async generateMonthlyReport(data) {
    const doc = this.createDocument();
    const fileName = `monthly-report-${
      new Date().toISOString().split("T")[0]
    }-${Date.now()}.pdf`;
    const filePath = path.join(reportsDir, fileName);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // PAGE 1 - Header
    this.addHeader(
      doc,
      "Monthly Equipment Report",
      data.period.start.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    );

    // Executive Summary
    this.addSectionTitle(doc, "Executive Summary");

    const summaryMetrics = [
      {
        label: "Total Equipment",
        value: data.summary.totalEquipment,
        color: this.colors.primary,
      },
      {
        label: "Avg Health Score",
        value: data.summary.avgHealthScore.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
      {
        label: "Total Alerts",
        value: data.summary.totalAlerts,
        color: this.colors.warning,
      },
      {
        label: "Maintenance Cost",
        value: `$${data.summary.totalMaintenanceCost.toFixed(0)}`,
        color: this.colors.danger,
      },
    ];

    this.addMetricsCards(doc, summaryMetrics, 4);

    const operationalMetrics = [
      {
        label: "Energy",
        value: data.summary.totalEnergyConsumed.toFixed(1),
        unit: "kWh",
        color: this.colors.primary,
      },
      {
        label: "Avg Utilization",
        value: data.summary.avgUtilization.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
      {
        label: "Avg Efficiency",
        value: data.summary.avgEfficiency.toFixed(1),
        unit: "%",
        color: this.colors.success,
      },
      {
        label: "Total Downtime",
        value: data.summary.totalDowntime.toFixed(1),
        unit: "hrs",
        color: this.colors.danger,
      },
    ];

    this.addMetricsCards(doc, operationalMetrics, 4);

    // PAGE 2 - Top Performers
    doc.addPage();
    this.addHeader(doc, "Performance Analysis", null, false);

    this.addSectionTitle(doc, "Top Performing Equipment");

    data.summary.topPerformingEquipment.slice(0, 5).forEach((eq, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 35;
      }

      const perfY = doc.y;
      this.drawRoundedRect(doc, 35, perfY, doc.page.width - 70, 35, 6)
        .lineWidth(1)
        .strokeColor(this.colors.success)
        .fillAndStroke(this.colors.successLight, this.colors.success);

      doc
        .fillColor(this.colors.darkGray)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${eq.name}`, 50, perfY + 12, {
          width: doc.page.width - 140,
        });

      doc
        .fillColor(this.colors.success)
        .font("Helvetica-Bold")
        .text(`${eq.healthScore}%`, doc.page.width - 100, perfY + 12);

      doc.y += 38;
    });

    // Bottom Performers
    this.addSectionTitle(doc, "Equipment Requiring Attention");

    data.summary.bottomPerformingEquipment.slice(0, 5).forEach((eq, index) => {
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 35;
      }

      const perfY = doc.y;
      this.drawRoundedRect(doc, 35, perfY, doc.page.width - 70, 35, 6)
        .lineWidth(1)
        .strokeColor(this.colors.danger)
        .fillAndStroke(this.colors.dangerLight, this.colors.danger);

      doc
        .fillColor(this.colors.darkGray)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${eq.name}`, 50, perfY + 12, {
          width: doc.page.width - 140,
        });

      doc
        .fillColor(this.colors.danger)
        .font("Helvetica-Bold")
        .text(`${eq.healthScore}%`, doc.page.width - 100, perfY + 12);

      doc.y += 38;
    });

    // PAGE 3 - Detailed Analysis - Landscape
    doc.addPage({ layout: "landscape", margin: 35 });
    this.addHeader(doc, "Detailed Equipment Analysis", null, true);

    const headers = [
      "Equipment",
      "Health",
      "Utilization",
      "Efficiency",
      "Alerts",
      "Maintenance",
    ];
    const columnWidths = [240, 80, 100, 90, 80, 110];
    const rows = data.equipmentDetails
      .slice(0, 18)
      .map((eq) => [
        eq.equipment.name.substring(0, 28),
        `${eq.currentStatus?.healthScore || 0}%`,
        `${eq.usageMetrics.avgUtilization.toFixed(1)}%`,
        `${eq.usageMetrics.avgEfficiency.toFixed(1)}%`,
        eq.alertMetrics.totalAlerts,
        eq.maintenanceMetrics.totalMaintenance,
      ]);

    this.addTable(doc, headers, rows, columnWidths);

    // PAGE 4 - Cost Analysis - Portrait
    doc.addPage();
    this.addHeader(doc, "Financial Analysis", null, false);

    this.addSectionTitle(doc, "Cost Overview");

    const costCards = [
      {
        label: "Total Cost",
        value: `$${data.summary.totalMaintenanceCost.toFixed(2)}`,
        color: this.colors.danger,
      },
      {
        label: "Avg/Equipment",
        value: `$${(
          data.summary.totalMaintenanceCost / data.summary.totalEquipment
        ).toFixed(2)}`,
        color: this.colors.primary,
      },
      {
        label: "Total Activities",
        value: data.summary.totalMaintenanceActivities,
        color: this.colors.warning,
      },
    ];

    this.addMetricsCards(doc, costCards, 3);

    // Maintenance breakdown
    this.addSectionTitle(doc, "Maintenance Distribution");

    const maintenanceData = data.equipmentDetails.reduce((acc, eq) => {
      Object.entries(eq.maintenanceMetrics.maintenanceByType).forEach(
        ([type, count]) => {
          acc[type] = (acc[type] || 0) + count;
        }
      );
      return acc;
    }, {});

    const maintenanceChartData = Object.entries(maintenanceData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([type, count]) => ({
        label: type.substring(0, 12),
        value: count,
        color: this.colors.primary,
      }));

    if (maintenanceChartData.length > 0) {
      this.drawBarChart(doc, maintenanceChartData, {
        title: "Maintenance by Type",
        width: 450,
        height: 150,
      });
    }

    // Energy Analysis
    this.addSectionTitle(doc, "Energy Analysis");

    const energyCards = [
      {
        label: "Total Energy",
        value: data.summary.totalEnergyConsumed.toFixed(2),
        unit: "kWh",
        color: this.colors.primary,
      },
      {
        label: "Avg/Equipment",
        value: (
          data.summary.totalEnergyConsumed / data.summary.totalEquipment
        ).toFixed(2),
        unit: "kWh",
        color: this.colors.success,
      },
    ];

    this.addMetricsCards(doc, energyCards, 2);

    // PAGE 5 - Recommendations
    doc.addPage();
    this.addSectionTitle(doc, "Recommendations");

    const recommendations = [
      {
        title: "Preventive Maintenance",
        desc: "Schedule maintenance for equipment below 70%",
        priority: "High",
      },
      {
        title: "Energy Efficiency",
        desc: "Review high energy consumers for optimization",
        priority: "Medium",
      },
      {
        title: "Cost Optimization",
        desc: "Analyze maintenance spending patterns",
        priority: "High",
      },
    ];

    recommendations.forEach((rec, index) => {
      if (doc.y > 680) {
        doc.addPage();
        doc.y = 35;
      }

      const priorityColor =
        rec.priority === "High"
          ? this.colors.danger
          : rec.priority === "Medium"
          ? this.colors.warning
          : this.colors.success;

      const recY = doc.y;
      this.drawRoundedRect(doc, 35, recY, doc.page.width - 70, 55, 8)
        .lineWidth(2)
        .strokeColor(priorityColor)
        .fillAndStroke(this.colors.lightGray, priorityColor);

      doc
        .fillColor(this.colors.darkGray)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${rec.title}`, 50, recY + 10);

      doc
        .fillColor(this.colors.gray)
        .fontSize(8)
        .font("Helvetica")
        .text(rec.desc, 50, recY + 28, { width: doc.page.width - 140 });

      doc
        .fillColor(priorityColor)
        .fontSize(8)
        .font("Helvetica-Bold")
        .text(rec.priority, doc.page.width - 80, recY + 10);

      doc.y = recY + 60;
    });

    // Report Info
    this.addSectionTitle(doc, "Report Information", false);

    const infoY = doc.y + 10;
    this.drawRoundedRect(doc, 35, infoY, doc.page.width - 70, 80, 8)
      .lineWidth(1.5)
      .strokeColor(this.colors.primary)
      .fillAndStroke(this.colors.primaryLight, this.colors.primary);

    doc
      .fillColor(this.colors.gray)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Generated By:", 50, infoY + 15);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.name, 150, infoY + 15);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Email:", 50, infoY + 35);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedBy.email, 150, infoY + 35);

    doc
      .fillColor(this.colors.gray)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text("Date:", 50, infoY + 55);
    doc
      .fillColor(this.colors.darkGray)
      .font("Helvetica")
      .text(data.generatedAt.toLocaleString(), 150, infoY + 55);

    const totalPages = doc.bufferedPageRange().count;
    this.addFootersWithCorrectPageCount(doc, totalPages);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("finish", () => {
        resolve(`/reports/${fileName}`);
      });
      stream.on("error", reject);
    });
  }
}

const generator = new PDFReportGenerator();

export async function generatePDFReport(data, reportType) {
  try {
    switch (reportType) {
      case "daily":
        return await generator.generateDailyReport(data);
      case "weekly":
        return await generator.generateWeeklyReport(data);
      case "monthly":
        return await generator.generateMonthlyReport(data);
      default:
        throw new Error("Unsupported report type");
    }
  } catch (error) {
    console.error("Error generating PDF report:", error);
    throw error;
  }
}
