import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
}

interface Props {
  locationName: string;
  aItems: GiftItem[];
  bItems: GiftItem[];
  onClose: () => void;
}

export default function GiftPdfGeneratorModal({
  locationName,
  aItems,
  bItems,
  onClose,
}: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("헌혈자 기념품 안내");
  const [footer, setFooter] = useState("기념품 유효기간을 꼭 확인하세요!");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [fontSize, setFontSize] = useState<number>(16);

  const handleDownload = () => {
    if (!previewRef.current) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `${locationName}_기념품안내.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(previewRef.current)
      .save();
  };

  const renderItems = (items: GiftItem[]) => (
    <div className="grid grid-cols-2 gap-4 mt-2">
      {items.map((item) => (
        <div key={item.id} className="flex flex-col items-center text-center">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-32 h-24 object-contain border rounded mb-1 bg-white"
            />
          )}
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">기념품 안내문 생성</h2>

        <input
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="타이틀"
        />

        <input
          className="border p-2 rounded w-full"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="하단 문구"
        />

        <div className="flex gap-4 items-center">
          <label className="flex items-center gap-1">
            <input
              type="radio"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />
            라이트
          </label>
          <label className="flex items-center gap-1">
            <input
              type="radio"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            다크
          </label>
        </div>

        <div>
          <label className="block font-medium text-sm mb-1">폰트 크기: {fontSize}px</label>
          <input
            type="range"
            min={12}
            max={24}
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 미리보기 영역 */}
        <div
          ref={previewRef}
          className={`w-[210mm] h-[297mm] mx-auto border shadow bg-${
            theme === "light" ? "white" : "gray-900"
          } text-${theme === "light" ? "black" : "white"} px-8 py-6`}
          style={{ fontSize }}
        >
          <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
          <h2 className="text-lg font-semibold mt-6">A 품목</h2>
          {renderItems(aItems)}
          <h2 className="text-lg font-semibold mt-8">B 품목</h2>
          {renderItems(bItems)}
          <p className="mt-12 text-center text-sm opacity-80">{footer}</p>
        </div>

        <Button className="mt-4" onClick={handleDownload}>
          PDF 다운로드
        </Button>
      </div>
    </Modal>
  );
}
