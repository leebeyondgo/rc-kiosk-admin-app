import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode.react";
import { Download } from "lucide-react";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Location {
  id: string;
  name: string;
}

export default function KioskLinks() {
  const [locations, setLocations] = useState<Location[]>([]);

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
    const canvas = document.getElementById(`qr-${locationId}`) as HTMLCanvasElement;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `kiosk_qr_${locationId}.png`;
    downloadLink.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="p-4 border rounded shadow bg-white flex flex-col items-center justify-between"
          >
            <h3 className="font-semibold text-center mb-2">{loc.name}</h3>

            <QRCode
              id={`qr-${loc.id}`}
              value={getKioskUrl(loc.id)}
              size={150}
              includeMargin={true}
            />
            <div className="hidden">
              <QRCode
                id={`qr-download-${loc.id}`}
                value={getKioskUrl(loc.id)}
                size={512}  // 고해상도 설정 (1024px 권장)
                includeMargin={true}
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
