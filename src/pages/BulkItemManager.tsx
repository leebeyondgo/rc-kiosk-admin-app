import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import AdminItems from "@/pages/AdminItems";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Location {
  id: string;
  name: string;
}

export default function BulkItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: locs } = await supabase.from("donation_locations").select("*");
      if (locs) setLocations(locs);
    };
    fetchData();
  }, []);

  const handleLocationClick = (loc: Location) => {
    setSelectedLocation(loc);
    setShowModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">헌혈 장소별 기념품 관리</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">헌혈 장소 목록</h3>
          <ul className="space-y-1">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Button
                  variant={selectedLocation?.id === loc.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleLocationClick(loc)}
                >
                  {loc.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {showModal && selectedLocation && (
        <Modal onClose={() => setShowModal(false)}>
            <h3 className="text-lg font-semibold mb-3">
            {selectedLocation.name}의 기념품 관리
            </h3>
            <AdminItems locationId={selectedLocation.id} />
        </Modal>
        )}
    </div>
  );
}