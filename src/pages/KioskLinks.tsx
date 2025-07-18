import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QRCode from "qrcode.react";
import { Download } from "lucide-react";


interface Location {
  id: string;
  name: string;
}

export default function KioskLinks() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("donation_locations").select("*");
      setLocations(data || []);
    };
    fetchLocations();
  }, []);

  const getKioskUrl = (locationId: string) =>
    `https://leebeyondgo.github.io/rc-kiosk-app/#/location/${locationId}`;

  const handleQRDownload = (locationId: string) => {
    const canvas = document.getElementById(`qr-download-${locationId}`) as HTMLCanvasElement;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `kiosk_qr_${locationId}.png`;
    downloadLink.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-4">
        <label htmlFor="location-search" className="sr-only">
          검색
        </label>
        <Input
          id="location-search"
          placeholder="장소 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {locations
          .filter((loc) =>
            loc.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((loc) => (
          <div
            key={loc.id}
            className="p-4 border rounded shadow bg-white flex flex-col items-center justify-between"
          >
            <h3 className="font-semibold text-center mb-2">{loc.name}</h3>

            {/* 화면용 (적당한 크기) */}
            <QRCode
              id={`qr-${loc.id}`}
              value={getKioskUrl(loc.id)}
              size={150}
              includeMargin={true}
              aria-label={`키오스크 ${loc.name} 페이지 QR`}
            />

            {/* 다운로드용 고해상도 QR코드 (숨김 처리) */}
            <div className="hidden">
              <QRCode
                id={`qr-download-${loc.id}`}
                value={getKioskUrl(loc.id)}
                size={1024}  // 고해상도 설정 (1024px 권장)
                includeMargin={true}
                aria-label={`키오스크 ${loc.name} 페이지 QR 다운로드용`}
              />
            </div>

            <div className="mt-3 space-y-2 w-full">
              <Button
                className="w-full"
                onClick={() => window.open(getKioskUrl(loc.id), "_blank")}
              >
                페이지 열기
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleQRDownload(loc.id)}
              >
                <Download size={16} className="mr-2" />
                QR 다운로드
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
