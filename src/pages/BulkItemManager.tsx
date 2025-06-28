import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import AdminItems from "@/modals/AdminItems";
import GlobalItemManager from "@/pages/GlobalItemManager";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Location {
  id: string;
  name: string;
}

type Tab = "location" | "global";

export default function BulkItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("location");
  const toast = useToast();

  // 동기화 관련 상태
  const [syncMode, setSyncMode] = useState(false);
  const [syncSourceId, setSyncSourceId] = useState<string>("");
  const [syncTargetIds, setSyncTargetIds] = useState<string[]>([]);

  // 기념품 목록을 location_id 기준으로 저장
  const [locationItemMap, setLocationItemMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: locs } = await supabase.from("donation_locations").select("*");
      const { data: items } = await supabase
        .from("location_gift_items")
        .select("location_id, gift_items(name)")
        .order("sort_order");

      if (locs) setLocations(locs);

      // 기념품 이름들을 location_id 기준으로 묶기
      const grouped: Record<string, string[]> = {};
      if (items) {
        for (const item of items) {
          const locId = item.location_id;
          const name = (item as any).gift_items?.name;
          if (!name) continue;
          grouped[locId] = grouped[locId] ? [...grouped[locId], name] : [name];
        }
      }
      setLocationItemMap(grouped);
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

    if (!sourceItems) return toast("기준 장소 기념품 정보를 불러오지 못했습니다.");

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
    if (error) return toast("동기화 실패: " + error.message);

    toast("동기화가 완료되었습니다.");
    setSyncMode(false);
    setSyncSourceId("");
    setSyncTargetIds([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* 탭 버튼 */}
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

      {/* 탭 내용 */}
      {activeTab === "location" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">헌혈 장소 목록</h3>
            <Button variant="soft" onClick={() => setSyncMode(!syncMode)}>
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
                  <div className="text-sm text-warmGray-500">
                    {(locationItemMap[loc.id]?.slice(0, 3) || []).join(", ")}
                    {locationItemMap[loc.id]?.length > 3 &&
                      ` 외 ${locationItemMap[loc.id].length - 3}개`}
                  </div>
                  <Button onClick={() => handleLocationClick(loc)}>관리</Button>
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
