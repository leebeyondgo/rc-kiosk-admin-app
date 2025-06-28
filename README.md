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

### 단계별 색상 예시

| 단계 | redCrossRed | redCrossWarmGray | redCrossGray | redCrossGold | redCrossSilver |
|-----|-------------|------------------|--------------|--------------|----------------|
| 50  | #fdeaea | #f5f4f4 | #f5f5f5 | #fff9e2 | #f8f8f8 |
| 100 | #f6c0c0 | #e6e3e2 | #e2e2e2 | #fceebf | #ececec |
| 200 | #f09999 | #d8d4d3 | #cfcfcf | #f8e29c | #dfdfdf |
| 300 | #ea7373 | #c9c0be | #bcbcbc | #f3d679 | #d3d3d3 |
| 400 | #e44c4c | #bbaead | #a9a9a9 | #efcb56 | #c6c6c6 |
| 500 | #d62828 | #9b8f8b | #8c8c8c | #d4af37 | #c0c0c0 |
| 600 | #b52222 | #867a78 | #707070 | #b5932c | #a2a2a2 |
| 700 | #941b1b | #706563 | #565656 | #967822 | #858585 |
| 800 | #741515 | #5b504f | #3d3d3d | #785d17 | #676767 |
| 900 | #530f0f | #453b3a | #222222 | #5a430d | #4a4a4a |

### 주요 클래스 예시

- 버튼: `bg-redCrossRed-600 hover:bg-redCrossRed-700 text-white`
- 테이블 헤더: `bg-redCrossWarmGray-100 text-redCrossWarmGray-800`
- 경고 텍스트: `text-redCrossRed-500`

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

### 색상 체계 확장 안내

`tailwind.config.ts`의 `theme.extend.colors`에 위 표의 각 단계가 모두 정의되어 있습니다. 프로젝트에서는 이러한 사용자 정의 색상만 사용하며, 기본 Tailwind 색상과 혼용하지 않는 것을 원칙으로 합니다.
