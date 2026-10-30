"use client";

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function EarningsChart({ labels, values, currency }: {
  labels: string[]; values: number[]; currency: string;
}) {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
  return (
    <div className="h-72">
      <Bar
        data={{
          labels,
          datasets: [{
            label: "Earnings",
            data: values,
            backgroundColor: "#f59e0b",
            hoverBackgroundColor: "#2c2a28",
            borderRadius: 10,
            maxBarThickness: 52,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1a1917",
              padding: 12,
              cornerRadius: 10,
              callbacks: { label: (ctx) => ` ${fmt.format(ctx.parsed.y ?? 0)}` },
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: "#64748b", font: { weight: 600 } } },
            y: {
              grid: { color: "#f1efeb" },
              ticks: { color: "#94a3b8", callback: (v) => fmt.format(Number(v)) },
            },
          },
        }}
      />
    </div>
  );
}