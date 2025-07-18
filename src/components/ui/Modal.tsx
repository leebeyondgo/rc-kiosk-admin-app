import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// 전역 모달 개수 카운터와 body overflow 보존 변수
let openModals = 0;
let originalBodyOverflow = "";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
  labelledBy?: string;
  /** 최대 너비에 적용할 tailwind 클래스 */
  maxWidthClass?: string;
}

export default function Modal({
  children,
  onClose,
  labelledBy,
  maxWidthClass = "max-w-[95vw] sm:max-w-xl md:max-w-4xl",
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 모달이 처음 열릴 때 body overflow 상태를 보존하고 숨김 처리
    if (openModals === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModals++;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusFirst = () => {
      const first = modalRef.current?.querySelector<HTMLElement>(selector);
      first?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(selector);
        if (!focusable.length) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    focusFirst();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openModals--;
      // 모든 모달이 닫혔을 때만 overflow 복원
      if (openModals === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidthClass} rounded-lg bg-white shadow-lg relative p-6 my-10`} // 상단 마진만 고정
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 우측 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-redCrossWarmGray-400 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-redCrossWarmGray-200 transition"
          aria-label="닫기"
        >
          <X size={20} />
        </button>

        {/* 컨텐츠 */}
        <div className="pb-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
