export default class ProgressChart {
  constructor(container, data, options = {}) {
    this.container = container;
    this.data = data;
    this.options = {
      width: options.width || 600,
      height: options.height || 300,
      margin: options.margin || { top: 20, right: 30, bottom: 30, left: 40 },
      type: options.type || "line", // line, bar, or pie
      colors: options.colors || ["#3498db", "#2ecc71", "#e74c3c", "#f1c40f"],
    };
    this.render();
  }

  render() {
    this.container.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = this.options.width;
    canvas.height = this.options.height;
    this.container.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    switch (this.options.type) {
      case "line":
        this.drawLineChart(ctx);
        break;
      case "bar":
        this.drawBarChart(ctx);
        break;
      case "pie":
        this.drawPieChart(ctx);
        break;
    }

    this.drawLegend(ctx);
  }

  drawLineChart(ctx) {
    const { width, height, margin } = this.options;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Calculate scales
    const xScale = chartWidth / (this.data.labels.length - 1);
    const yScale =
      chartHeight /
      (Math.max(...this.data.datasets.map((d) => Math.max(...d.data))) || 1);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Draw data lines
    this.data.datasets.forEach((dataset, i) => {
      ctx.beginPath();
      ctx.strokeStyle = this.options.colors[i % this.options.colors.length];
      ctx.lineWidth = 2;

      dataset.data.forEach((value, j) => {
        const x = margin.left + j * xScale;
        const y = height - margin.bottom - value * yScale;

        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    });

    // Draw labels
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    this.data.labels.forEach((label, i) => {
      const x = margin.left + i * xScale;
      ctx.fillText(label, x - 20, height - margin.bottom + 20);
    });
  }

  drawBarChart(ctx) {
    const { width, height, margin } = this.options;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const barWidth =
      chartWidth / this.data.labels.length / this.data.datasets.length;
    const maxValue = Math.max(
      ...this.data.datasets.map((d) => Math.max(...d.data))
    );
    const yScale = chartHeight / maxValue;

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();

    // Draw bars
    this.data.datasets.forEach((dataset, datasetIndex) => {
      ctx.fillStyle =
        this.options.colors[datasetIndex % this.options.colors.length];

      dataset.data.forEach((value, index) => {
        const x =
          margin.left +
          index * barWidth * this.data.datasets.length +
          datasetIndex * barWidth;
        const y = height - margin.bottom - value * yScale;
        const barHeight = value * yScale;

        ctx.fillRect(x, y, barWidth - 2, barHeight);
      });
    });

    // Draw labels
    ctx.fillStyle = "#666";
    ctx.font = "12px Arial";
    this.data.labels.forEach((label, i) => {
      const x = margin.left + i * barWidth * this.data.datasets.length;
      ctx.fillText(label, x, height - margin.bottom + 20);
    });
  }

  drawPieChart(ctx) {
    const { width, height } = this.options;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;

    let total = this.data.datasets[0].data.reduce((a, b) => a + b, 0);
    let startAngle = 0;

    this.data.datasets[0].data.forEach((value, i) => {
      const sliceAngle = (2 * Math.PI * value) / total;

      ctx.beginPath();
      ctx.fillStyle = this.options.colors[i % this.options.colors.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw labels
      const labelAngle = startAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.fillText(
        `${this.data.labels[i]} (${Math.round((value / total) * 100)}%)`,
        labelX - 20,
        labelY
      );

      startAngle += sliceAngle;
    });
  }

  drawLegend(ctx) {
    const { width, margin } = this.options;
    let legendX = width - margin.right + 10;
    let legendY = margin.top;

    this.data.datasets.forEach((dataset, i) => {
      ctx.fillStyle = this.options.colors[i % this.options.colors.length];
      ctx.fillRect(legendX, legendY, 15, 15);

      ctx.fillStyle = "#666";
      ctx.font = "12px Arial";
      ctx.fillText(dataset.label, legendX + 20, legendY + 12);

      legendY += 25;
    });
  }

  update(newData) {
    this.data = newData;
    this.render();
  }
}
