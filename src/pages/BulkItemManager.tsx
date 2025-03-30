import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import AdminItems from "@/modals/AdminItems";
import GlobalItemManager from "@/pages/GlobalItemManager";
import GiftPdfGeneratorModal from "@/modals/GiftPdfGeneratorModal";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Location {
  id: string;
  name: string;
}

interface LocationGiftItem {
  id: string;
  location_id: string;
  gift_item_id: string;
  sort_order: number;
  allow_multiple: boolean;
  visible: boolean;
  category: "A" | "B";
}

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}

type Tab = "location" | "global";

export default function BulkItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("location");

  // 동기화 상태
  const [syncMode, setSyncMode] = useState(false);
  const [syncSourceId, setSyncSourceId] = useState<string>("");
  const [syncTargetIds, setSyncTargetIds] = useState<string[]>([]);

  // PDF 모달 상태
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfLocation, setPdfLocation] = useState<Location | null>(null);
  const [pdfItems, setPdfItems] = useState<{ a: GiftItem[]; b: GiftItem[] }>({ a: [], b: [] });

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("donation_locations").select("*");
      if (data) setLocations(data);
    };
    fetchData();
  }, []);

  const handleLocationClick = (loc: Location) => {
    setSelectedLocation(loc);
    setShowModal(true);
  };

  const handleSync = async () => {
    if (!syncSourceId || syncTargetIds.length === 0) return;

    const { data: sourceItems } = await supabase
      .from("location_gift_items")
      .select("*")
      .eq("location_id", syncSourceId);

    if (!sourceItems) return alert("기준 장소 기념품 정보를 불러오지 못했습니다.");

    await supabase.from("location_gift_items")
      .delete()
      .in("location_id", syncTargetIds);

    const payload = syncTargetIds.flatMap((targetId) =>
      sourceItems.map(({ id, ...rest }) => ({
        ...rest,
        location_id: targetId,
      }))
    );

    const { error } = await supabase.from("location_gift_items").insert(payload);
    if (error) return alert("동기화 실패: " + error.message);

    alert("동기화가 완료되었습니다.");
    setSyncMode(false);
    setSyncSourceId("");
    setSyncTargetIds([]);
  };

  const handlePdfClick = async (loc: Location) => {
    const { data: locItems } = await supabase
      .from("location_gift_items")
      .select("*")
      .eq("location_id", loc.id);

    const { data: giftItems } = await supabase.from("gift_items").select("*");

    if (!locItems || !giftItems) return;

    const aItems = locItems
      .filter((i) => i.category === "A")
      .map((li) => giftItems.find((g) => g.id === li.gift_item_id))
      .filter(Boolean) as GiftItem[];

    const bItems = locItems
      .filter((i) => i.category === "B")
      .map((li) => giftItems.find((g) => g.id === li.gift_item_id))
      .filter(Boolean) as GiftItem[];

    setPdfItems({ a: aItems, b: bItems });
    setPdfLocation(loc);
    setPdfModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">기념품 관리</h2>

      <div className="flex border-b mb-4 space-x-2">
        <Button
          variant={activeTab === "location" ? "default" : "ghost"}
          onClick={() => setActiveTab("location")}
        >
          장소별 기념품 관리
        </Button>
        <Button
          variant={activeTab === "global" ? "default" : "ghost"}
          onClick={() => setActiveTab("global")}
        >
          기념품 항목 추가
        </Button>
      </div>

      {activeTab === "location" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">헌혈 장소 목록</h3>
            <Button variant="outline" onClick={() => setSyncMode(!syncMode)}>
              {syncMode ? "동기화 모드 종료" : "동기화 모드"}
            </Button>
          </div>

          {syncMode ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="font-semibold">기준 장소</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={syncSourceId}
                  onChange={(e) => setSyncSourceId(e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold">복사 대상</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {locations
                    .filter((l) => l.id !== syncSourceId)
                    .map((loc) => (
                      <label key={loc.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={syncTargetIds.includes(loc.id)}
                          onChange={() =>
                            setSyncTargetIds((prev) =>
                              prev.includes(loc.id)
                                ? prev.filter((id) => id !== loc.id)
                                : [...prev, loc.id]
                            )
                          }
                        />
                        {loc.name}
                      </label>
                    ))}
                </div>
              </div>
              <Button onClick={handleSync}>동기화 실행</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="border rounded p-4 shadow flex flex-col gap-2">
                  <h4 className="font-semibold text-lg">{loc.name}</h4>
                  <Button onClick={() => handleLocationClick(loc)}>관리</Button>
                  <Button variant="outline" onClick={() => handlePdfClick(loc)}>📄 안내문 생성</Button>
                </div>
              ))}
            </div>
          )}

          {showModal && selectedLocation && (
            <Modal onClose={() => setShowModal(false)}>
              <h3 className="text-lg font-semibold mb-3">
                {selectedLocation.name}의 기념품 관리
              </h3>
              <AdminItems locationId={selectedLocation.id} />
            </Modal>
          )}

          {pdfModalOpen && pdfLocation && (
            <GiftPdfGeneratorModal
              locationName={pdfLocation.name}
              aItems={pdfItems.a}
              bItems={pdfItems.b}
              onClose={() => setPdfModalOpen(false)}
            />
          )}
        </>
      )}

      {activeTab === "global" && (
        <div className="mt-4">
          <GlobalItemManager />
        </div>
      )}
    </div>
  );
}
