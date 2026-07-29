import fs from "node:fs";
import JSZip from "jszip";

const source = "MOODROBE_발표자료_10장.pptx";
const extension = "temp-extension-slides.pptx";
const output = "MOODROBE_발표자료_확장본_13장.pptx";
const [sourceZip, extensionZip] = await Promise.all([
  JSZip.loadAsync(fs.readFileSync(source)),
  JSZip.loadAsync(fs.readFileSync(extension)),
]);

const slideXml = (slideNumber) => `ppt/slides/slide${slideNumber}.xml`;
const slideRels = (slideNumber) => `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
for (let number = 1; number <= 3; number += 1) {
  const targetNumber = 10 + number;
  const xml = await extensionZip.file(slideXml(number)).async("string");
  // Reuse the source deck's layout and theme; slide content itself remains self-contained.
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`;
  sourceZip.file(slideXml(targetNumber), xml);
  sourceZip.file(slideRels(targetNumber), rels);
}

let presentation = await sourceZip.file("ppt/presentation.xml").async("string");
const existingSlideIds = [...presentation.matchAll(/<p:sldId\b[^>]*\bid="(\d+)"/g)].map((match) => Number(match[1]));
const existingRids = [...presentation.matchAll(/<p:sldId\b[^>]*\br:id="rId(\d+)"/g)].map((match) => Number(match[1]));
const firstSlideId = Math.max(...existingSlideIds) + 1;
const firstRid = Math.max(...existingRids) + 1;
const slideList = [0, 1, 2].map((index) => `<p:sldId id="${firstSlideId + index}" r:id="rId${firstRid + index}"/>`).join("");
presentation = presentation.replace("</p:sldIdLst>", `${slideList}</p:sldIdLst>`);
sourceZip.file("ppt/presentation.xml", presentation);

let presentationRels = await sourceZip.file("ppt/_rels/presentation.xml.rels").async("string");
const slideRelsXml = [0, 1, 2].map((index) => `<Relationship Id="rId${firstRid + index}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${11 + index}.xml"/>`).join("");
presentationRels = presentationRels.replace("</Relationships>", `${slideRelsXml}</Relationships>`);
sourceZip.file("ppt/_rels/presentation.xml.rels", presentationRels);

let types = await sourceZip.file("[Content_Types].xml").async("string");
types = types.replace("</Types>", '<Override PartName="/ppt/slides/slide11.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slides/slide12.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slides/slide13.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>');
sourceZip.file("[Content_Types].xml", types);

fs.writeFileSync(output, await sourceZip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
console.log(`Created ${output}`);
