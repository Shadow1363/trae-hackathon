"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type BarDatum = { label: string; value: number; color?: string };

export default function AgeVisionChart({
  title,
  data,
}: {
  title: string;
  data: BarDatum[];
}) {
  const labels = data.map((d) => d.label);
  const colors = data.map(
    (d, i) => d.color ?? ["#2563eb", "#f59e0b", "#16a34a", "#ef4444"][i % 4],
  );
  const values = data.map((d) => Math.round(d.value));
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (v: string | number) => `${v}%` },
      },
      x: { grid: { display: false } },
    },
  } as const;
  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };
  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-bold text-zinc-900 mb-3">{title}</h3>
      <Bar options={options} data={chartData} />
    </div>
  );
}
