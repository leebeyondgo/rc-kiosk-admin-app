import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl rounded-lg bg-white shadow-lg relative p-6 my-10" // 상단 마진만 고정
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 우측 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-redCrossWarmGray-400 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-redCrossWarmGray-200 transition"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 컨텐츠 */}
        <div className="pb-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
