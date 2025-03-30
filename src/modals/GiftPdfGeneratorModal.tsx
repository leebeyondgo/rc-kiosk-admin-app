import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

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

export default function GiftPosterGeneratorModal({
  locationName,
  aItems,
  bItems,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [title, setTitle] = useState("헌혈자 기념품 안내 포스터");
  const [footer, setFooter] = useState("기념품 유효기간을 꼭 확인하세요!");

  const drawPoster = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#d60000";
    ctx.fillRect(0, 0, canvas.width, 80);
    ctx.fillStyle = "white";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, canvas.width / 2, 50);

    ctx.fillStyle = "black";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("A 품목", 50, 120);

    let x = 50;
    let y = 140;
    for (const item of aItems) {
      if (item.image_url) {
        const img = await loadImage(item.image_url);
        ctx.drawImage(img, x, y, 100, 70);
      }
      ctx.font = "14px sans-serif";
      ctx.fillText(item.name, x, y + 85);
      x += 130;
      if (x + 100 > canvas.width) {
        x = 50;
        y += 120;
      }
    }

    y += 120;
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("B 품목", 50, y);
    y += 20;
    x = 50;

    for (const item of bItems) {
      if (item.image_url) {
        const img = await loadImage(item.image_url);
        ctx.drawImage(img, x, y, 100, 70);
      }
      ctx.font = "14px sans-serif";
      ctx.fillText(item.name, x, y + 85);
      x += 130;
      if (x + 100 > canvas.width) {
        x = 50;
        y += 120;
      }
    }

    ctx.font = "italic 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(footer, canvas.width / 2, canvas.height - 30);
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    await drawPoster();
    const canvas = canvasRef.current;
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "JPEG", 0, 0);
    pdf.save(`${locationName}_기념품포스터.pdf`);
  };

  useEffect(() => {
    drawPoster();
  }, [aItems, bItems, title, footer]);

  return (
    <Modal onClose={onClose}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">기념품 안내 포스터</h2>
        <input
          className="border p-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="포스터 타이틀"
        />
        <input
          className="border p-2 rounded w-full"
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="하단 문구"
        />
        <canvas
          ref={canvasRef}
          width={595}
          height={842}
          className="w-full border shadow"
        />
        <Button onClick={handleDownload}>PDF 다운로드</Button>
      </div>
    </Modal>
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
