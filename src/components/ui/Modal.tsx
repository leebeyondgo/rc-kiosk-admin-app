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
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-10"
      onClick={onClose} // 배경 클릭 시 닫기
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] rounded-lg bg-white overflow-hidden shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫기 방지
      >
        {/* 닫기 버튼 */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          onClick={onClose}
        >
          ✕
        </button>
        <div className="p-6 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
}