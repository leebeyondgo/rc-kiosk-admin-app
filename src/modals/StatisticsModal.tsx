import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GiftRecord } from "@/types";
import Modal from "@/components/ui/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: GiftRecord[];
}

export default function StatisticsModal({ isOpen, onClose, data }: Props) {
  if (!isOpen) return null;

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
    <Modal onClose={onClose}>
      <h1 className="text-lg font-bold mb-4">기념품 통계</h1>

      {chartData.length === 0 ? (
        <p className="text-center text-gray-400">데이터가 없습니다.</p>
      ) : (
        <>
          {/* Chart */}
          <div className="w-full min-h-[250px] sm:min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#d62828" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="mt-8">
            <h2 className="text-md font-semibold mb-2">기념품별 선택 수</h2>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-sm border min-w-[300px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left px-4 py-2 border">기념품</th>
                    <th className="text-right px-4 py-2 border">선택 수</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map(({ name, count }) => (
                    <tr key={name}>
                      <td className="px-4 py-2 border">{name}</td>
                      <td className="text-right px-4 py-2 border">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 닫기 버튼 */}
      <div className="mt-6 text-right">
        <button
          onClick={onClose}
          className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          닫기
        </button>
      </div>
    </Modal>
  );
}
