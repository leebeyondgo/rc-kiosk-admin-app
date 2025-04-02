import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  useEffect(() => {
    // 스크롤 막기
    document.body.style.overflow = "hidden";
    return () => {
      // 스크롤 다시 허용
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white max-h-[85vh] overflow-y-auto rounded-lg w-full max-w-3xl p-6 shadow-lg relative my-4 sm:my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 (더 큼직하고 명확하게) */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
