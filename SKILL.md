---
name: research-report-hwpx
description: Use when creating a Korean research report from PPT, images, Markdown, text, PDF, spreadsheet, or other research materials and filling `researchform.hwpx`/`.hwpx`; synthesize evidence into a reviewable Markdown draft, create tables when supported by source data, populate a copied HWPX form, reflow it through Hancom Office, and save the final file using the researcher name.
---

# Research Report HWPX Delivery

Create a Korean research report from the supplied research materials, produce a reviewable Markdown draft, then generate a visually correct HWPX form. This skill applies to `researchform.hwpx` and other HWPX research-report templates.

## Non-Negotiable Delivery Rules

- Preserve every input file. Never overwrite the form template, source material, or a prior completed report.
- Use supported source facts only. Do not fabricate authors, affiliations, measurements, dates, statistics, tables, quotations, URLs, citations, or research findings.
- Mark missing essential facts as `[확인 필요]` in the Markdown draft and report them to the user. Do not hide uncertainty by guessing.
- The deliverables are both a reviewable `.md` draft and a final reflowed `.hwpx` document.
- Name the final HWPX with the researcher name: `<연구자이름>.hwpx`. Use a filesystem-safe name: replace `\ / : * ? " < > |` and control characters with `_`, trim whitespace and trailing dots, and fall back to `연구자_미상.hwpx` if the name is unknown. Never overwrite an existing file with that name; append `_2`, `_3`, and so on.

## Available Template: `researchform.hwpx`

The supplied template is HWPX (a ZIP package of UTF-8 XML). It has these exact placeholder fields in `Contents/section0.xml`:

| Placeholder | Report field |
| --- | --- |
| `{{보고서제목}}` | report title |
| `{{연구자학교}}` | researcher school/affiliation |
| `{{연구자이름}}` | researcher name |
| `{{서론내용}}` | I. introduction |
| `{{탐구과정내용}}` | II. research process |
| `{{탐구결과내용}}` | III. research results |
| `{{결론내용}}` | IV. conclusion |
| `{{소감내용}}` | V. reflection |
| `{{제언내용}}` | VI. suggestions |
| `{{참고문헌내용}}` | VII. references |

Keep fixed text such as `부산정보영재교육원`, `지도교사`, and the template labels unless the user asks to change it.

## End-to-End Procedure

### 1. Inventory and Classify Sources

1. List all supplied files, including nested directories. Identify the template separately from source materials and prior outputs.
2. Classify each source before reading it:

| Source type | Required extraction approach |
| --- | --- |
| `.md`, `.txt`, `.csv`, `.json` | Read directly with UTF-8 detection; preserve the source filename for citations. |
| `.pptx` | Read slide text, notes, tables, chart labels, and source links from the OOXML ZIP/XML parts. Use images only to confirm visual context, not to invent data. |
| `.ppt` | Use installed PowerPoint Automation or a trusted converter for extraction; if neither exists, report the limitation. |
| `.docx`, `.xlsx` | Read paragraphs/tables or sheets/cells with an OOXML-capable parser; preserve tabular values and headers. |
| `.pdf` | Extract text first; inspect rendered pages when text extraction is incomplete, scanned, diagram-heavy, or table-heavy. OCR output must be treated as uncertain until checked against the page image. |
| Images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.tiff`) | Inspect visually; use OCR only to aid transcription. Verify numbers, axes, units, labels, and table cells visually before treating them as facts. |
| `.hwpx` | Inspect ZIP entries and `Contents/section*.xml` `hp:t` text. Use Hancom Office only for visual verification or reflow. |
| `.hwp` | Extract through Hancom HWP Automation when installed; do not binary-edit it. |

3. Create an evidence ledger in the draft: each key claim, number, observation, and table row must point to an input filename and a location such as page, slide, worksheet/cell range, table number, or paragraph.
4. Identify contradictions, missing variables, and unsupported conclusions before drafting. Prefer the primary measurement or original document over a summary slide.

### 2. Write the Reviewable Markdown Draft First

Create `<연구자이름>_연구보고서.md` with the same collision-safe naming policy as the HWPX output. Write it before editing the form so the user can review facts and structure independently of Hancom layout.

Use this exact Markdown outline:

```markdown
# <보고서 제목>

- 연구자: <이름>
- 소속: <학교 또는 기관>
- 지도교사: <알려진 경우에만 기재>
- 작성 상태: 초안 | 검토 완료

## I. 서론
<문제 상황, 연구 목적, 연구 질문, 범위>

## II. 탐구 과정
<자료 수집, 실험/분석 절차, 대상, 기간, 도구, 통제/한계>

## III. 탐구 결과
<검증 가능한 결과와 해석>

## IV. 결론
<연구 질문에 대한 답, 의미, 한계>

## V. 소감
<연구자가 제공한 성찰만 사용; 없으면 [확인 필요]>

## VI. 제언
<근거에 맞는 실행 가능한 후속 제안>

## VII. 참고문헌
<실제로 사용한 자료만 완전하게 기재>

## 근거 추적표
| 보고서 내용 | 근거 파일 | 위치 | 확인 상태 |
| --- | --- | --- | --- |
```

Writing requirements:

- Use Korean when the materials and form are Korean. Keep formal research-report prose concise, factual, and readable.
- Separate observation, analysis, and interpretation. State limitations near the claim they qualify.
- Use actual units, sample sizes, dates, methods, and uncertainty when the sources provide them.
- Cite sources in the reference section and connect core claims to the evidence ledger. A filename alone is not a substitute for a reference when bibliographic metadata exists.
- Do not claim causal effects from a correlation-only source. Do not turn a hypothesis, projection, or example value into a result.

### 3. Create Tables Only From Verified Data

Add a Markdown table when it improves comparison or readability and every cell is traceable to a source. Suitable uses include experiment conditions, survey results, before/after measurements, category comparisons, schedules, and source summaries.

```markdown
| 조건 | 측정값 | 단위 | 근거 |
| --- | ---: | --- | --- |
| A 조건 | 12.4 | 점 | `실험결과.xlsx`, Sheet1!B4 |
```

Rules:

- Preserve original headers, units, rounding, footnotes, and missing-value notation where possible.
- Mark an inferred or calculated value with its calculation method and source cells. Never fill missing cells with plausible values.
- Keep tables narrow enough for the form. If a source table is too wide, summarize only the decision-relevant columns and state that it is an excerpt.
- For `researchform.hwpx`, the current placeholders are text-only. Put concise Markdown-table text in the report field only if it remains readable. For an actual formatted HWPX table, insert an `hp:tbl` structure only after inspecting a known-good table in the template or a Hancom-generated HWPX sample; otherwise, keep the table in the Markdown draft and provide a concise prose summary in the HWPX.

### 4. Review Before Form Population

Before generating the HWPX, verify all of the following:

1. The researcher name and affiliation are known or explicitly marked `[확인 필요]`.
2. Every number and claim in the Markdown draft has a source location in the evidence ledger.
3. The conclusion answers the stated research question without exceeding the evidence.
4. Every cited reference is present in the materials or has verifiable metadata.
5. Tables contain no invented rows, values, units, or captions.
6. The user has an opportunity to review the Markdown draft if facts are incomplete, sensitive, or consequential.

### 5. Populate a Copy of the HWPX

Use Python 3.11+ and the standard library for direct HWPX package editing:

- `zipfile`: copy and rewrite the HWPX package.
- `xml.etree.ElementTree`: inspect and update XML safely.
- `pathlib`, `tempfile`, `shutil`, and `re`: safe paths, temporary output, copying, and placeholder detection.
- XML-library text assignment or `xml.sax.saxutils.escape` for a raw-text replacement path. Never pre-escape text and then assign it through ElementTree, or characters will be double-escaped.

Do not use `python-docx`, `openpyxl`, PDF libraries, `pyhwp`, H2Orestart, or LibreOffice as the HWPX writer. They do not provide reliable HWPX round-trip editing. `pyhwp` is extraction-oriented; H2Orestart imports to LibreOffice and saves ODT.

Implementation rules:

1. Copy `researchform.hwpx` to a temporary working file; never write inside the original archive.
2. Inspect every `Contents/section*.xml` part and replace only exact intended placeholders in `hp:t` text nodes.
3. Preserve all non-content ZIP entries, images, styles, table structure, metadata, and untouched XML. Do not pretty-print or normalize untouched XML.
4. If a placeholder spans adjacent text runs, reconstruct only the affected contiguous text, replace it, and retain its run/paragraph properties.
5. Use normal prose sentences and paragraphs. Do not insert fake manual line breaks merely to force wrapping.

### 6. Mandatory Hancom Reflow

Direct XML editing changes text length but does not calculate HWPX layout. `hp:linesegarray` contains cached line positions. If it is stale or missing, the document can show all content on one line until the user presses Enter. The output is not complete until Hancom Office recalculates it.

On this Windows environment, Hancom Office 2024 and `HWPFrame.HwpObject` are available through 32-bit COM. Run the Automation host with:

```powershell
C:\Windows\SysWOW64\WindowsPowerShell\v1.0\powershell.exe
```

Use `HWPFrame.HwpObject` to:

1. Register `FilePathCheckDLL` / `FilePathCheckerModule`.
2. Open the edited temporary HWPX using format `HWPX`.
3. Save it as the final `<연구자이름>.hwpx`, also with format `HWPX`.
4. Quit the COM object even if an error occurs.

This open-and-save operation is mandatory: it recalculates line segments, text wrapping, pages, and table layout. Do not delete `hp:linesegarray` as a workaround; that merely transfers the repair work to the user.

For legacy `.hwp` editing, use the same Hancom COM Automation via a `pywin32>=306` environment that matches Hancom Office bitness. Do not use byte replacement, `zipfile`, or ElementTree on binary HWP.

### 7. Validate the Deliverables

Validate the Markdown draft:

- File exists, uses UTF-8, has every required heading, and includes the evidence ledger.
- It has no unresolved placeholders except intentional `[확인 필요]` markers that are listed in the completion report.
- All tables are traceable to their sources.

Validate the final HWPX after Hancom reflow:

1. The archive opens and retains all expected original ZIP entry paths.
2. Every XML entry parses as UTF-8 XML.
3. All requested placeholders are replaced and no `{{...}}` tokens remain.
4. The researcher name, title, and all seven report sections are present.
5. Each populated narrative paragraph has Hancom-generated `hp:linesegarray` with multiple line segments when its content spans multiple lines; this confirms reflow instead of a one-line cached layout.
6. Open the final file in Hancom Office for a visual check of page breaks, wrapping, tables, images, and text overflow. If visual inspection cannot run, say so explicitly rather than claiming visual verification.

## Completion Report

Report these items concisely:

- Markdown draft path and final HWPX path.
- Researcher name used for the filename.
- Sources processed and any sources that could not be read.
- Tables created or omitted, with the reason.
- Any `[확인 필요]` markers, unresolved evidence, or required user decisions.
- Structural-validation and Hancom visual/reflow-validation results separately.

## Sources and Implementation Position

- Hancom official file-format information: https://www.hancom.com/etc/hwpDownload.do
- H2Orestart releases: https://github.com/ebandal/H2Orestart/releases — import/conversion aid, not an HWPX writer.
- pyhwp: https://github.com/mete0r/pyhwp — HWP v5 parser/processor, not the final document-editing path.
