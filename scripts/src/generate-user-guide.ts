import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT = path.resolve(
  __dirname,
  "../../artifacts/landonos/public/onboarding/landonos-user-guide.pdf"
);

interface GuideSection {
  title: string;
  module: string;
  intro: string;
  points: string[];
}

const SECTIONS: GuideSection[] = [
  {
    title: "Performance Cockpit",
    module: "Command Center",
    intro:
      "The Performance Cockpit is your daily dashboard. A cluster of circular gauges reads out the health of your research at a glance, with live tiles below for everything in motion.",
    points: [
      "Instrument gauges for source quality, report readiness, research velocity, and human-review risk.",
      "Live tiles for open requests, blocked items, reports in progress, and completed handoffs.",
      "Today's priorities, review alerts, and quick actions to launch the most common tasks.",
    ],
  },
  {
    title: "Research Engine",
    module: "Guided Research Builder",
    intro:
      "Every project fires up here. Scoping the question before involving AI is what keeps the rest of the workflow disciplined.",
    points: [
      "Define the decision the research supports.",
      "List the sources the work requires.",
      "Record what must never be assumed, and flag requests that need human review.",
    ],
  },
  {
    title: "Track Map",
    module: "Research GPS",
    intro:
      "The Track Map guides you through the full workflow, from understanding the question all the way to a clean handoff, with a progress gauge to keep you on the racing line.",
    points: [
      "Pick an active mission and drive through each step in order.",
      "Mark steps Complete, In Progress, or Needs Help.",
      "Your progress keeps the cockpit gauges and counts accurate.",
    ],
  },
  {
    title: "Source Garage",
    module: "Source Vault",
    intro:
      "The Source Garage is where evidence is stored and rated, so trust is never assumed.",
    points: [
      "Official and internal records are treated as trusted.",
      "AI drafts and unknown sources are clearly flagged.",
      "A risk banner warns when a request relies only on unverified sources.",
    ],
  },
  {
    title: "Brief Builder",
    module: "Report Builder",
    intro:
      "The Brief Builder assembles a leadership-ready report and scores how ready it is to share.",
    points: [
      "Capture the objective, executive summary, findings, risks, and recommendation.",
      "Attach the sources that back each finding.",
      "The readiness score warns you when official sources or answers are missing.",
    ],
  },
  {
    title: "Company Brain Sync",
    module: "RoseOS",
    intro:
      "RoseOS is the company brain and your research co-driver. Ask it what is on record, and propose updates that remain drafts until a human approves them.",
    points: [
      "Query the decision log, requirements registry, and automation registry.",
      "Draft proposed updates to core records.",
      "Nothing is recorded automatically — every change requires human review.",
    ],
  },
  {
    title: "Garage Rewards & Driver Training",
    module: "Growth & Rewards",
    intro:
      "As you work, Garage Rewards turns real research skill into points and badges, and Driver Training builds the skills behind them — both tracked on their own gauges.",
    points: [
      "Points and badges reflect genuine research milestones, from Source Finder upward.",
      "Driver Training builds skills in using AI responsibly and verifying sources.",
      "A level gauge and roadmap show how close you are to the next milestone.",
    ],
  },
];

// Brand palette — luxury fast-car cockpit: deep graphite/black, performance red,
// chrome/silver neutrals.
const GRAPHITE = "#0b0d10";
const RED = "#ef4444";
const RED_DEEP = "#b91c1c";
const SILVER = "#cbd1d9";
const STEEL = "#94a3b8";
const SLATE = "#475569";
const INK = "#1f2937";
const LIGHT = "#e2e8f0";
const WHITE = "#ffffff";
const RED_TINT = "#fef2f2";

const COMPLIANCE =
  "Compliance guardrail: AI output is a draft only until it is source-checked and human-reviewed. Company decisions are never recorded automatically.";

function drawCover(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  doc.save();
  doc.rect(0, 0, width, height).fill(GRAPHITE);
  // Performance-red top rail.
  doc.rect(0, 0, width, 6).fill(RED);

  // Chrome accent band.
  doc.rect(0, height * 0.34, width, 2).fill(RED_DEEP);
  doc.rect(0, height * 0.34 + 3, width * 0.45, 1).fill(SILVER);

  doc
    .fillColor(SILVER)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("LANDONOS", 64, height * 0.22, { characterSpacing: 4 });

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(40)
    .text("Performance Research Cockpit", 64, height * 0.24 + 18, {
      width: width - 128,
    });

  doc
    .fillColor(LIGHT)
    .font("Helvetica")
    .fontSize(15)
    .text("User Guide", 64, height * 0.34 + 22);

  doc
    .fillColor(STEEL)
    .font("Helvetica")
    .fontSize(11)
    .text(
      "An AI-guided research training cockpit that teaches and structures responsible compliance and business research. A luxury instrument cluster reads your work at a glance, with human review built in at every step.",
      64,
      height * 0.34 + 52,
      { width: width - 200, lineGap: 4 }
    );

  doc
    .fillColor(RED)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(COMPLIANCE, 64, height - 120, { width: width - 128, lineGap: 3 });

  doc.restore();
}

function drawSection(
  doc: PDFKit.PDFDocument,
  section: GuideSection,
  index: number
) {
  doc.addPage();
  const { width } = doc.page;
  const left = doc.page.margins.left;
  const contentWidth = width - doc.page.margins.left - doc.page.margins.right;

  // Header band — graphite with a red underline rail.
  doc.rect(0, 0, width, 96).fill(GRAPHITE);
  doc.rect(0, 96, width, 3).fill(RED);

  doc
    .fillColor(RED)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(`INSTRUMENT ${String(index + 1).padStart(2, "0")}`, left, 30, {
      characterSpacing: 2,
    });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(section.title, left, 44);
  doc
    .fillColor(STEEL)
    .font("Helvetica")
    .fontSize(10)
    .text(section.module, left, 74);

  // Intro
  doc.y = 130;
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .fontSize(12)
    .text(section.intro, left, 130, { width: contentWidth, lineGap: 5 });

  doc.moveDown(1.2);

  // Key points
  doc
    .fillColor(RED_DEEP)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("WHAT YOU CAN DO", left, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.6);

  for (const point of section.points) {
    const y = doc.y;
    doc
      .save()
      .circle(left + 4, y + 6, 3)
      .fill(RED)
      .restore();
    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(11)
      .text(point, left + 18, y, { width: contentWidth - 18, lineGap: 4 });
    doc.moveDown(0.7);
  }

  // Compliance callout
  doc.moveDown(0.6);
  const calloutY = doc.y;
  const calloutHeight = 56;
  doc
    .save()
    .roundedRect(left, calloutY, contentWidth, calloutHeight, 6)
    .fill(RED_TINT)
    .restore();
  doc
    .save()
    .roundedRect(left, calloutY, 4, calloutHeight, 2)
    .fill(RED)
    .restore();
  doc
    .fillColor(RED_DEEP)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("HUMAN REVIEW REQUIRED", left + 16, calloutY + 12, {
      characterSpacing: 1,
    });
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .fontSize(9.5)
    .text(COMPLIANCE, left + 16, calloutY + 26, {
      width: contentWidth - 32,
      lineGap: 2,
    });
}

function addFooters(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    const { width, height } = doc.page;
    const bottom = height - 40;
    doc
      .fillColor(i === 0 ? STEEL : "#94a3b8")
      .font("Helvetica")
      .fontSize(8.5);
    if (i === 0) {
      doc.text("landonos.app", 64, bottom, { lineBreak: false });
    } else {
      doc.text("LandonOS — Performance Research Cockpit", 72, bottom, {
        lineBreak: false,
      });
      doc.text(`Page ${i + 1} of ${range.count}`, width - 150, bottom, {
        width: 78,
        align: "right",
        lineBreak: false,
      });
    }
  }
}

function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 72, bottom: 64, left: 64, right: 64 },
    bufferPages: true,
    info: {
      Title: "LandonOS User Guide",
      Author: "LandonOS Performance Research Cockpit",
      Subject: "Onboarding user guide",
    },
  });

  const stream = fs.createWriteStream(OUTPUT);
  doc.pipe(stream);

  drawCover(doc);
  SECTIONS.forEach((section, i) => drawSection(doc, section, i));
  addFooters(doc);

  doc.end();

  stream.on("finish", () => {
    console.log(`User guide written to ${OUTPUT}`);
  });
}

main();
