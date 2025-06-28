# RC Kiosk Admin App

관리자가 기념품 키오스크를 관리할 수 있도록 돕는 웹 애플리케이션입니다. React와 Tailwind CSS, Vite를 사용하여 작성되었습니다.

## 개발 서버 실행 방법

```bash
npm install
npm run dev
```

서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

## 빌드

```bash
npm run build
```

생성된 정적 파일은 `dist/` 폴더에 위치합니다.

## Red Cross Color Palette

아래는 대한적십자사 시각 아이덴티티에서 사용하는 주요 팬톤(Pantone) 색상과 각 HEX 값입니다. Tailwind CSS의 색상 확장에 추가되어 있으며, 필요에 따라 밝기나 어둡기를 조절하여 사용합니다.

| Pantone 색상      | HEX 값   | 활용 가이드 |
| ------------------|---------|-------------|
| Red Cross Red     | #d62828 | 강조 버튼이나 주요 포인트 컬러로 사용하며, 더 밝거나 어두운 변형이 필요할 때 `opacity` 또는 `darken/brighten` 유틸리티를 사용합니다. |
| Red Cross Warm Gray | #9b8f8b | 배경이나 텍스트 보조 색으로 사용하며, `bg-opacity`를 활용해 다양한 톤을 적용할 수 있습니다. |
| Red Cross Gray    | #8c8c8c | 아이콘이나 비활성 요소 등에 사용하며, 필요하면 Tailwind의 `brightness` 또는 `contrast` 유틸리티를 통해 조정합니다. |
| Red Cross Gold    | #d4af37 | 강조용 아이콘이나 특별한 요소에 사용합니다. 밝은 톤을 원할 경우 `opacity-80` 등을 적용합니다. |
| Red Cross Silver  | #c0c0c0 | 테두리나 배경 등에 사용하며, `opacity`를 조절해 밝기를 변경할 수 있습니다. |

### 예시

```tsx
// 버튼 컴포넌트 예시
import React from "react";

export default function ExampleButton() {
  return (
    <button className="px-4 py-2 rounded text-white bg-redCrossRed hover:bg-redCrossRed/80">
      저장하기
    </button>
  );
}
```

위 예시는 `redCrossRed` 컬러를 배경으로 사용하고, hover 시 약간 투명도를 줘서 음영을 표현하는 방법을 보여줍니다.
