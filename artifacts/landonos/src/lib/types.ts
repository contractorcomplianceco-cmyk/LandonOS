export type ResearchType = 'Compliance' | 'Business' | 'Market' | 'Competitor' | 'Client-Account' | 'Internal Operations';
export type Priority = 'Low' | 'Medium' | 'High' | 'Executive';
export type Status = 'Not Started' | 'In Progress' | 'Complete' | 'Needs Help';
export type SourceType = 'Official Source' | 'Internal Company Record' | 'Client-Provided' | 'Competitor' | 'Market-Industry' | 'AI Draft' | 'Unknown';
export type ReportStatus = 'Draft' | 'Needs Sources' | 'Ready for Review' | 'Needs More Research' | 'Reviewed' | 'Approved' | 'Archived';
export type BlockerStatus = 'Open' | 'In Review' | 'Waiting on Landon' | 'Resolved' | 'Archived';
export type HandoffStatus = 'Draft' | 'Ready for Rose' | 'Ready for Carmen' | 'Ready for Gregg' | 'Needs More Research' | 'Approved' | 'Archived';
export type IdeaCategory = 'Opportunity' | 'Risk' | 'Automation' | 'Sales Support' | 'Compliance Support' | 'Client Support' | 'Internal Process';
export type ConvertToType = 'Research Request' | 'Automation Idea' | 'Leadership Question' | 'Company Brain Update Suggestion';
export type CompanyBrainUpdateStatus = 'Suggested' | 'Needs Review' | 'Approved to Record' | 'Recorded' | 'Archived';
export type Level = 'Research Trainee' | 'Source Finder' | 'Brief Builder' | 'Compliance Research Assistant' | 'Business Intelligence Operator' | 'Executive Research Analyst';

export interface ResearchRequest {
  id: string;
  title: string;
  type: ResearchType;
  requester: string;
  reviewer: string;
  priority: Priority;
  dueDate: string;
  whatTryingToFindOut: string;
  decisionSupported: string;
  whatWeKnow: string;
  requiredSources: string;
  whatNotToAssume: string;
  completionCriteria: string;
  requiresHumanReview: boolean;
  notes: string;
  status: 'Open' | 'In Progress' | 'Blocked' | 'Completed' | 'Archived';
  gpsSteps: Record<string, Status>;
}

export interface Source {
  id: string;
  title: string;
  urlOrFileRef: string;
  type: SourceType;
  relatedResearchId: string;
  dateCaptured: string;
  summary: string;
  keyFacts: string;
  confidenceRating: number; // 1-10
  sourceQualityRating: number; // 1-10
  tags: string[];
  notes: string;
}

export interface Report {
  id: string;
  title: string;
  relatedResearchId: string;
  preparedFor: string;
  preparedBy: string;
  date: string;
  objective: string;
  executiveSummary: string;
  keyFindings: string;
  sourceBackedFacts: string;
  risks: string;
  opportunities: string;
  unknowns: string;
  recommendation: string;
  nextSteps: string;
  sourcesReviewed: string[];
  reviewerNotes: string;
  status: ReportStatus;
}

export interface Blocker {
  id: string;
  relatedResearchId: string;
  type: string;
  description: string;
  urgency: Priority;
  whoShouldHelp: string;
  whatTried: string;
  suggestedNextStep: string;
  status: BlockerStatus;
}

export interface Handoff {
  id: string;
  title: string;
  whatResearched: string;
  whyItMatters: string;
  whatFound: string;
  stillUnknown: string;
  recommendedAction: string;
  whoReviews: string;
  affectsCompanyDecision: boolean;
  affectsClientFacing: boolean;
  updateCompanyBrain: boolean;
  sourcesAttached: string[];
  reportAttached: string;
  status: HandoffStatus;
}

export interface Idea {
  id: string;
  title: string;
  category: IdeaCategory;
  description: string;
  whyItMatters: string;
  suggestedNextAction: string;
  convertTo: ConvertToType | null;
}

export interface CompanyBrainUpdate {
  id: string;
  title: string;
  relatedResearchId: string;
  recommendedRecord: string;
  whatChanged: string;
  whyItMatters: string;
  draftUpdateText: string;
  status: CompanyBrainUpdateStatus;
}

export type AnnouncementLevel = 'Info' | 'Important' | 'Critical';
export type AnnouncementCategory =
  | 'Company'
  | 'Policy'
  | 'Compliance'
  | 'Operations'
  | 'Recognition';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  level: AnnouncementLevel;
  author: string;
  date: string; // YYYY-MM-DD
  pinned: boolean;
  active: boolean;
}

export interface AdminState {
  unlocked: boolean;
  passcode: string;
}

export interface ChecklistItem {
  text: string;
  done: boolean;
}

export interface TrainingLesson {
  id: string;
  title: string;
  explanation: string;
  checklist: ChecklistItem[];
  completed: boolean;
  practiceTask: string;
  relatedModule: string;
}

export interface TrainingTrack {
  id: string;
  title: string;
  lessons: TrainingLesson[];
}

export interface RewardSettings {
  completeResearch: number;
  addOfficialSource: number;
  improvePrompt: number;
  raiseBlockerEarly: number;
  completeReport: number;
  completeHandoff: number;
  reportApproved: number;
  suggestBrainUpdate: number;
  completeLesson: number;
}

export interface AppSettings {
  appName: string;
  userName: string;
  userRole: string;
  roleLabels: string[];
  researchTypes: string[];
  sourceTypes: string[];
  rewardSettings: RewardSettings;
}

export interface RewardState {
  level: Level;
  points: number;
  badges: string[];
  recentAchievements: string[];
  suggestedNextSkill: string;
}

export interface AppData {
  requests: ResearchRequest[];
  sources: Source[];
  reports: Report[];
  blockers: Blocker[];
  handoffs: Handoff[];
  ideas: Idea[];
  brainUpdates: CompanyBrainUpdate[];
  training: TrainingTrack[];
  announcements: Announcement[];
  admin: AdminState;
  rewardState: RewardState;
  settings: AppSettings;
}
