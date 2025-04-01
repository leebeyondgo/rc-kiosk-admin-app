// components/StatisticsModal.tsx
import { Dialog } from "@headlessui/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GiftRecord } from "@/types";
import { Fragment } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: GiftRecord[];
}

export default function StatisticsModal({ isOpen, onClose, data }: Props) {
  const itemCount: Record<string, number> = {};

  data.forEach((record) => {
    record.items.forEach((item) => {
      itemCount[item] = (itemCount[item] || 0) + 1;
    });
  });

  const chartData = Object.entries(itemCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <Dialog open={isOpen} onClose={onClose} as={Fragment}>
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl">
          <Dialog.Title className="text-lg font-bold mb-4">기념품 통계</Dialog.Title>
          {chartData.length === 0 ? (
            <p className="text-center text-gray-400">데이터가 없습니다.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#d62828" />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="mt-6 text-right">
            <button onClick={onClose} className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
              닫기
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
