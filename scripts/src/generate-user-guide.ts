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
  steps: string[];
}

const SECTIONS: GuideSection[] = [
  {
    title: "Performance Cockpit",
    module: "Command Center",
    intro:
      "The Performance Cockpit is your daily dashboard and the first screen you see. A cluster of circular gauges reads out the health of your research at a glance, with live tiles below for everything currently in motion. Treat it as your pre-drive instrument check: glance here first, then dive into whatever needs attention.",
    points: [
      "Instrument gauges for source quality, report readiness, research velocity, and human-review risk.",
      "Live tiles for open requests, blocked items, reports in progress, and completed handoffs.",
      "Today's priorities, review alerts, and quick actions that launch the most common tasks.",
    ],
    steps: [
      "Open the Cockpit from the top of the sidebar — it loads automatically when you start a session.",
      "Read the four gauges first: their arcs sweep from healthy to at-risk so you can spot trouble in one look.",
      "Scan the live tiles for anything blocked or awaiting review.",
      "Use a quick action to jump straight into the task that needs you most.",
    ],
  },
  {
    title: "Research Engine",
    module: "Guided Research Builder",
    intro:
      "Every project fires up here. Scoping the question before involving any AI is what keeps the rest of the workflow disciplined — a clear brief now prevents wasted laps later. The Engine walks you through framing the decision, the evidence, and the boundaries before a single source is gathered.",
    points: [
      "Define the precise decision the research is meant to support.",
      "List the sources the work will require up front.",
      "Record what must never be assumed, and flag requests that need human review.",
    ],
    steps: [
      "Start a new project and write, in one sentence, the decision it must support.",
      "List the sources you expect to need before you involve any AI assistance.",
      "Note any assumptions that are off-limits and mark items that require human review.",
      "Save the brief to send it into the Track Map workflow.",
    ],
  },
  {
    title: "Track Map",
    module: "Research GPS",
    intro:
      "The Track Map guides you through the full ten-step workflow, from understanding the question all the way to a clean handoff, with a progress gauge to keep you on the racing line. It is the single source of truth for where each mission stands, so nothing is skipped and nothing stalls silently.",
    points: [
      "Pick an active mission and drive through each step in order.",
      "Mark each step Complete, In Progress, or Needs Help.",
      "Your progress keeps the cockpit gauges and counts accurate in real time.",
    ],
    steps: [
      "Select an active mission to open its ten-step route.",
      "Work each step in order so context carries forward cleanly.",
      "Set every step to In Progress, Complete, or Needs Help as you go.",
      "Watch the progress gauge — it feeds the cockpit counts and keeps your status honest.",
    ],
  },
  {
    title: "Source Garage",
    module: "Source Vault",
    intro:
      "The Source Garage is where evidence is stored and rated, so trust is never assumed. Each source carries a clear label, and the Garage actively warns you when a conclusion is resting on unverified ground. This is the backbone of the compliance guardrail — verified evidence in, defensible reports out.",
    points: [
      "Official and internal records are treated as trusted.",
      "AI drafts and unknown sources are clearly flagged as unverified.",
      "A risk banner warns when a request relies only on unverified sources.",
    ],
    steps: [
      "Add each source and tag it Official, AI Draft, or Unknown.",
      "Confirm an unknown or AI-drafted source against an official record before you rely on it.",
      "Promote a source to trusted only once that check is done.",
      "Clear the risk banner by replacing unverified sources before the report goes out.",
    ],
  },
  {
    title: "Brief Builder",
    module: "Report Builder",
    intro:
      "The Brief Builder assembles a leadership-ready report and scores how ready it is to share. Rather than guessing whether a report is complete, you get an objective readiness score that flags exactly what is still missing — so the work that leaves your hands is already defensible.",
    points: [
      "Capture the objective, executive summary, findings, risks, and recommendation.",
      "Attach the sources that back each finding.",
      "The readiness score warns you when official sources or answers are missing.",
    ],
    steps: [
      "Fill in the objective, executive summary, findings, risks, and recommendation.",
      "Attach a backing source to every finding so each claim is traceable.",
      "Read the readiness score and open each warning it raises.",
      "Resolve every warning before you move the report to handoff.",
    ],
  },
  {
    title: "Company Brain Sync",
    module: "RoseOS",
    intro:
      "RoseOS is the company brain and your research co-driver. Ask it what is on record, and propose updates that stay drafts until a human approves them. It keeps institutional knowledge in one place while making sure nothing changes the official record without a person signing off.",
    points: [
      "Query the decision log, requirements registry, and automation registry.",
      "Draft proposed updates to core records.",
      "Nothing is recorded automatically — every change requires human review.",
    ],
    steps: [
      "Ask RoseOS what is already on record before assuming anything.",
      "Use its answers to fill gaps in your research instead of re-discovering known facts.",
      "Draft a proposed update when you find something the brain should know.",
      "Send the draft for human review — it is recorded only after a person approves it.",
    ],
  },
  {
    title: "Garage Rewards & Driver Training",
    module: "Growth & Rewards",
    intro:
      "As you work, Garage Rewards turns real research skill into points and badges, and Driver Training builds the skills behind them — both tracked on their own gauges. Progress reflects genuine milestones, not busywork, so the rewards always map back to better, safer research.",
    points: [
      "Points and badges reflect genuine research milestones, from Source Finder upward.",
      "Driver Training builds skills in using AI responsibly and verifying sources.",
      "A level gauge and roadmap show how close you are to the next milestone.",
    ],
    steps: [
      "Complete real research milestones to earn points and badges.",
      "Take Driver Training lessons to sharpen verification and responsible-AI habits.",
      "Check the level gauge and roadmap to see exactly what unlocks the next level.",
      "Revisit a lesson any time — reopening one simply removes its points so progress stays honest.",
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
  const left = 64;
  const contentW = width - 128;

  doc.save();
  doc.rect(0, 0, width, height).fill(GRAPHITE);
  // Performance-red top rail.
  doc.rect(0, 0, width, 6).fill(RED);

  // Flow the title block from a measured cursor so nothing overlaps.
  let y = height * 0.27;

  doc
    .fillColor(SILVER)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("LANDONOS", left, y, { characterSpacing: 4 });
  y = doc.y + 12;

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(38)
    .text("Performance Research Cockpit", left, y, {
      width: contentW,
      lineGap: 2,
    });
  y = doc.y + 14;

  doc
    .fillColor(LIGHT)
    .font("Helvetica")
    .fontSize(15)
    .text("User Guide", left, y);
  y = doc.y + 20;

  // Chrome accent rails — placed below the title block, so they can never
  // cut through the words.
  doc.rect(left, y, contentW, 2).fill(RED_DEEP);
  doc.rect(left, y + 4, contentW * 0.45, 1).fill(SILVER);
  y += 22;

  doc
    .fillColor(STEEL)
    .font("Helvetica")
    .fontSize(11)
    .text(
      "An AI-guided research training cockpit that teaches and structures responsible compliance and business research. A luxury instrument cluster reads your work at a glance, with human review built in at every step.",
      left,
      y,
      { width: contentW - 70, lineGap: 4 }
    );

  doc
    .fillColor(RED)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(COMPLIANCE, left, height - 120, { width: contentW, lineGap: 3 });

  doc.restore();
}

function drawGettingStarted(doc: PDFKit.PDFDocument) {
  doc.addPage();
  const { width } = doc.page;
  const left = doc.page.margins.left;
  const contentWidth = width - doc.page.margins.left - doc.page.margins.right;

  doc.rect(0, 0, width, 96).fill(GRAPHITE);
  doc.rect(0, 96, width, 3).fill(RED);

  doc
    .fillColor(RED)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("PRE-FLIGHT", left, 30, { characterSpacing: 2 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("Getting Started", left, 44);
  doc
    .fillColor(STEEL)
    .font("Helvetica")
    .fontSize(10)
    .text("How the cockpit works", left, 74);

  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .fontSize(12)
    .text(
      "LandonOS runs entirely in your browser. There is no separate login server and nothing to install — your work is saved locally and is there when you return. Everything is organized as a set of cockpit instruments, each covering one stage of responsible research.",
      left,
      130,
      { width: contentWidth, lineGap: 5 }
    );

  doc.moveDown(1.2);
  doc
    .fillColor(RED_DEEP)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("HOW TO READ THIS GUIDE", left, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.6);

  const orientation = [
    "Each page that follows covers one instrument: what it is, what you can do with it, and the exact steps to use it.",
    "The cockpit display name is shown first, with the underlying module in the line beneath it.",
    "Prefer to watch instead of read? The app also offers a narrated walkthrough and a guided tour from the help menu.",
  ];
  for (const point of orientation) {
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

  doc.moveDown(0.6);
  drawComplianceCallout(doc, left, contentWidth);
}

function drawComplianceCallout(
  doc: PDFKit.PDFDocument,
  left: number,
  contentWidth: number
) {
  const calloutHeight = 56;
  // If the callout would run off the page, push it to a fresh page first.
  const bottomLimit = doc.page.height - doc.page.margins.bottom;
  if (doc.y + calloutHeight > bottomLimit) doc.addPage();
  const calloutY = doc.y;
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
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .fontSize(12)
    .text(section.intro, left, 130, { width: contentWidth, lineGap: 5 });

  doc.moveDown(1.1);

  // Key points
  doc
    .fillColor(RED_DEEP)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("WHAT YOU CAN DO", left, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.5);

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
    doc.moveDown(0.55);
  }

  // Step-by-step
  doc.moveDown(0.6);
  doc
    .fillColor(RED_DEEP)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("HOW TO USE IT", left, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.5);

  section.steps.forEach((step, i) => {
    const y = doc.y;
    doc
      .save()
      .roundedRect(left, y, 18, 16, 4)
      .fill(RED)
      .restore();
    doc
      .fillColor(WHITE)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(String(i + 1), left, y + 4, { width: 18, align: "center" });
    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(11)
      .text(step, left + 28, y + 1, { width: contentWidth - 28, lineGap: 4 });
    doc.moveDown(0.55);
  });

  // Compliance callout
  doc.moveDown(0.6);
  drawComplianceCallout(doc, left, contentWidth);
}

function addFooters(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    // Writing in the footer zone sits below the page's bottom margin, which
    // makes pdfkit auto-insert a blank page. Zero the margin while we draw.
    const savedBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
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
    doc.page.margins.bottom = savedBottomMargin;
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
  drawGettingStarted(doc);
  SECTIONS.forEach((section, i) => drawSection(doc, section, i));
  addFooters(doc);

  doc.end();

  stream.on("finish", () => {
    console.log(`User guide written to ${OUTPUT}`);
  });
}

main();
