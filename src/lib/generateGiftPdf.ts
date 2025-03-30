import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface Options {
  locationName: string;
  title: string;
  footer: string;
  aItems: string[];
  bItems: string[];
  theme: "light" | "dark";
}

export function generateGiftPdf({
  locationName,
  title,
  footer,
  aItems,
  bItems,
  theme,
}: Options) {
  const textColor = theme === "dark" ? "#FFFFFF" : "#000000";
  const bgColor = theme === "dark" ? "#1F2937" : "#FFFFFF";
  const borderColor = theme === "dark" ? "#CCCCCC" : "#333333";

  const docDefinition: any = {
    pageSize: "A4",
    content: [
      { text: title, fontSize: 22, bold: true, alignment: "center", margin: [0, 0, 0, 20] },
      { text: `${locationName} 기념품 목록`, fontSize: 16, alignment: "center", margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ["*", "*"],
          body: [
            [
              { text: "A품목", style: "tableHeader" },
              { text: "B품목", style: "tableHeader" }
            ],
            [
              { text: aItems.join("\n"), style: "itemList" },
              { text: bItems.join("\n"), style: "itemList" }
            ]
          ]
        },
        layout: {
          fillColor: () => bgColor,
          hLineColor: () => borderColor,
          vLineColor: () => borderColor,
        },
        margin: [0, 10, 0, 20],
      },
      { text: footer, fontSize: 12, color: "red", alignment: "center", margin: [0, 30, 0, 0] }
    ],
    styles: {
      tableHeader: {
        fillColor: theme === "dark" ? "#374151" : "#F3F4F6",
        color: textColor,
        bold: true,
        fontSize: 14,
        alignment: "center",
      },
      itemList: {
        color: textColor,
        fontSize: 12,
        margin: [5, 5, 5, 5]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`${locationName}_기념품안내.pdf`);
}
