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
  intro: string;
  points: string[];
}

const SECTIONS: GuideSection[] = [
  {
    title: "Command Center",
    intro:
      "The Command Center is your daily cockpit. It surfaces live counts so you always know where work stands the moment you sign in.",
    points: [
      "Live tiles for open requests, blocked items, reports in progress, and completed handoffs.",
      "Today's priorities and any sources still awaiting human review.",
      "Quick actions to jump straight into the most common tasks.",
    ],
  },
  {
    title: "Research Builder",
    intro:
      "Every project starts here. Scoping the question before involving AI is what keeps the rest of the workflow disciplined.",
    points: [
      "Define the decision the research supports.",
      "List the sources the work requires.",
      "Record what must never be assumed, and flag requests that need human review.",
    ],
  },
  {
    title: "Research GPS",
    intro:
      "The Research GPS guides you through the full ten-step workflow, from understanding the question all the way to a clean handoff.",
    points: [
      "Pick an active mission and move through each step in order.",
      "Mark steps Complete, In Progress, or Needs Help.",
      "Your progress keeps the dashboard counts accurate.",
    ],
  },
  {
    title: "Source Vault",
    intro:
      "The Source Vault is where evidence lives. Every source is captured and rated so trust is never assumed.",
    points: [
      "Official and internal records are treated as trusted.",
      "AI drafts and unknown sources are clearly flagged.",
      "A risk banner warns when a request relies only on unverified sources.",
    ],
  },
  {
    title: "Report Builder",
    intro:
      "The Report Builder assembles a leadership-ready report and scores how ready it is to share.",
    points: [
      "Capture the objective, executive summary, findings, risks, and recommendation.",
      "Attach the sources that back each finding.",
      "The readiness score warns you when official sources or answers are missing.",
    ],
  },
  {
    title: "RoseOS",
    intro:
      "RoseOS is the company brain. Ask it what is on record, and propose updates that remain drafts until a human approves them.",
    points: [
      "Query the decision log, requirements registry, and automation registry.",
      "Draft proposed updates to core records.",
      "Nothing is recorded automatically — every change requires human review.",
    ],
  },
  {
    title: "Growth & Rewards",
    intro:
      "As you work, the Reward Center turns real research skill into points and badges so you can see your career progress.",
    points: [
      "Points and badges reflect genuine research milestones, from Source Finder upward.",
      "The Training Academy builds skills in using AI responsibly and verifying sources.",
      "A roadmap shows what each level represents.",
    ],
  },
];

// Brand palette (matches the app's dark navy / electric blue identity).
const NAVY = "#0f172a";
const DEEP_BLUE = "#1e3a8a";
const ELECTRIC = "#2563eb";
const SKY = "#38bdf8";
const SLATE = "#475569";
const LIGHT = "#e2e8f0";
const WHITE = "#ffffff";

const COMPLIANCE =
  "Compliance guardrail: AI output is a draft only until it is source-checked and human-reviewed. Company decisions are never recorded automatically.";

function drawCover(doc: PDFKit.PDFDocument) {
  const { width, height } = doc.page;
  doc.save();
  doc.rect(0, 0, width, height).fill(NAVY);
  doc.rect(0, 0, width, 6).fill(ELECTRIC);

  // Accent band
  doc.rect(0, height * 0.34, width, 2).fill(DEEP_BLUE);

  doc
    .fillColor(SKY)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text("LANDONOS", 64, height * 0.22, { characterSpacing: 4 });

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(40)
    .text("Research Command Center", 64, height * 0.24 + 18, {
      width: width - 128,
    });

  doc
    .fillColor(LIGHT)
    .font("Helvetica")
    .fontSize(15)
    .text("User Guide", 64, height * 0.34 + 22);

  doc
    .fillColor("#94a3b8")
    .font("Helvetica")
    .fontSize(11)
    .text(
      "An AI-guided research training cockpit that teaches and structures responsible compliance and business research, with human review built in at every step.",
      64,
      height * 0.34 + 52,
      { width: width - 200, lineGap: 4 }
    );

  doc
    .fillColor(SKY)
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

  // Header band
  doc.rect(0, 0, width, 96).fill(NAVY);
  doc.rect(0, 96, width, 3).fill(ELECTRIC);

  doc
    .fillColor(SKY)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(`SECTION ${String(index + 1).padStart(2, "0")}`, left, 34, {
      characterSpacing: 2,
    });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text(section.title, left, 50);

  // Intro
  doc.moveDown(2);
  doc.y = 130;
  doc
    .fillColor(SLATE)
    .font("Helvetica")
    .fontSize(12)
    .text(section.intro, left, 130, { width: contentWidth, lineGap: 5 });

  doc.moveDown(1.2);

  // Key points
  doc
    .fillColor(DEEP_BLUE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("WHAT YOU CAN DO", left, doc.y, { characterSpacing: 1.5 });
  doc.moveDown(0.6);

  for (const point of section.points) {
    const y = doc.y;
    doc
      .save()
      .circle(left + 4, y + 6, 3)
      .fill(ELECTRIC)
      .restore();
    doc
      .fillColor("#1f2937")
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
    .fill("#eff6ff")
    .restore();
  doc
    .save()
    .roundedRect(left, calloutY, 4, calloutHeight, 2)
    .fill(ELECTRIC)
    .restore();
  doc
    .fillColor(DEEP_BLUE)
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
    // Skip footer styling that would collide with the cover (page 0).
    doc
      .fillColor("#94a3b8")
      .font("Helvetica")
      .fontSize(8.5);
    if (i === 0) {
      doc.text("landonos.app", 64, bottom, { lineBreak: false });
    } else {
      doc.text("LandonOS — Research Command Center", 72, bottom, {
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
      Author: "LandonOS Research Command Center",
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
