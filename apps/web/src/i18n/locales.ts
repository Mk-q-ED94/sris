import type { PageKey } from "../components/AppShell";

export type LangCode = "zh" | "en" | "ja";

export interface Locale {
  htmlLang: string;
  dateLocale: string;
  metaTitle: string;
  brand: { name: string; subtitle: string };
  search: string;
  searchPlaceholder: string;
  searchEmpty: string;
  searchHint: string;
  searchFilterAll: string;
  searchFilterUniversity: string;
  searchFilterProgram: string;
  searchFilterProfessor: string;
  searchFilterLab: string;
  searchFilterPaper: string;
  searchFilterResource: string;
  searchFilterTask: string;
  asiaShanghai: string;
  privateMode: string;
  logout: string;
  authActive: string;
  authRequired: string;
  loading: string;
  notSet: string;
  refresh: string;
  retry: string;
  reenterToken: string;
  dashboardLoadFailed: string;
  noPapersTitle: string;
  noPapersHelper: string;
  noTasksTitle: string;
  noTasksHelper: string;
  reviewClearedTitle: string;
  reviewClearedHelper: string;
  unknownAuthors: string;
  cockpitChip: string;
  heroTitle: string;
  heroBody: string;
  hero: { pending: string; tasks90d: string; completion: string; pendingHelper: string; tasksHelper: string; completionHelper: string };
  panels: { recentPapers: [string, string]; timeline: [string, string]; review: [string, string]; status: [string, string] };
  carouselTagline: string;
  carouselTitle: string;
  carouselHint: string;
  metrics: Record<MetricKey, string>;
  priorities: Record<"high" | "medium" | "low", string>;
  taskStatuses: Record<"todo" | "doing" | "done", string>;
  status: { db: string; arxiv: string; ai: string; cron: string; connected: string; checking: string; aiReserved: string; cronSchedule: string; pendingFmt: (n: number) => string };
  nav: Record<PageKey, string>;
  pages: Record<PageKey, { title: string; description: string }>;
  placeholderNote: string;
  university: {
    backToOverview: string;
    featured: string;
    location: string;
    focus: string;
    notesTitle: string;
    notesBody: string;
    officialSite: string;
    imageSource: string;
  };
  tokenGate: {
    chip: string;
    title: string;
    body: string;
    formTitle: string;
    formBody: string;
    fieldLabel: string;
    placeholder: string;
    submit: string;
  };
  timeline: {
    title: string;
    description: string;
    windowMonths: (n: number) => string;
    prev: string;
    next: string;
    today: string;
    noTasks: string;
    legend: string;
    legendHigh: string;
    legendMedium: string;
    legendDone: string;
    newTask: string;
    titleLabel: string;
    deadlineLabel: string;
    priorityLabel: string;
    taskTypeLabel: string;
    notesLabel: string;
    save: string;
    cancel: string;
    delete: string;
    deleteConfirm: string;
  };
  resourceDetail: {
    back: string;
    urlOnly: string;
    reFetch: string;
    fetching: string;
    snapshotAt: string;
    edit: string;
    save: string;
    cancel: string;
    linkedEntities: string;
    contentSection: string;
    excerptSection: string;
    metadataSection: string;
    noExcerpt: string;
    summarize: string;
    summarizing: string;
    summaryPreview: string;
    applySummary: string;
    statusLabel: string;
    statusUnverified: string;
    statusVerified: string;
    statusStale: string;
    statusCoreEvidence: string;
    markingStatus: string;
  };
  sources: {
    title: string;
    description: string;
    icalTitle: string;
    icalBody: string;
    icalAction: string;
    icalCopied: string;
    captureTitle: string;
    captureBody: string;
    captureHint: string;
    captureCopy: string;
    captureCopied: string;
    arxivTitle: string;
    arxivBody: string;
    sourceNameLabel: string;
    sourceTypeLabel: string;
    universityLabel: string;
    confidenceLabel: string;
    checkFrequencyLabel: string;
    keywordsLabel: string;
    enabledLabel: string;
    lastRunLabel: string;
    newSource: string;
    editSource: string;
    deleteSource: string;
    sourceTypes: Record<string, string>;
    staleWarning: string;
    neverRun: string;
    staleSourcesTitle: string;
    staleSourcesBody: string;
    patrolNeverChecked: string;
    patrolOk: string;
    patrolChanged: string;
    patrolFailed: string;
    patrolStale: string;
    checkNow: string;
    runPatrol: string;
    patrolling: string;
    lastChecked: string;
    lastChanged: string;
  };
  capture: {
    title: string;
    body: string;
    urlLabel: string;
    titleLabel: string;
    notesLabel: string;
    submit: string;
    success: string;
    cancel: string;
    classificationLabel: string;
    classifiedTypes: Record<string, string>;
    resourceTypeLabel: string;
    universityLabel: string;
    programLabel: string;
    confidenceLabel: string;
    relevanceNoteLabel: string;
    domainLabel: string;
    excerptLabel: string;
    excerptPlaceholder: string;
  };
  professors: {
    title: string;
    description: string;
    university: string;
    researchKeywords: string;
    email: string;
    website: string;
    noResults: string;
    noResultsHelper: string;
    matchReason: string;
    matchButton: string;
    matching: string;
    matchAll: string;
    matchAllDone: string;
  };
  labs: {
    title: string;
    description: string;
    university: string;
    director: string;
    researchKeywords: string;
    recentPapers: string;
    website: string;
    noResults: string;
    noResultsHelper: string;
  };
  programs: {
    title: string;
    description: string;
    university: string;
    degree: string;
    language: string;
    deadline: string;
    requirements: string;
    scholarship: string;
    tuition: string;
    website: string;
    noResults: string;
    noResultsHelper: string;
    matchReason: string;
    matchButton: string;
    matching: string;
    matchAll: string;
    matchAllDone: string;
  };
  userProfile: {
    panelTitle: string;
    panelBody: string;
    backgroundLabel: string;
    backgroundPlaceholder: string;
    fieldsLabel: string;
    fieldsPlaceholder: string;
    save: string;
    saved: string;
    noProfile: string;
    noProfileHelper: string;
  };
  dashboard2: {
    heroLabel: string;
    heroTitle: string;
    heroBody: string;
    inboxLabel: string;
    inboxLoading: string;
    inboxCountFmt: (n: number) => string;
    inboxBody: string;
    inboxPending: string;
    inboxManualCaptures: string;
    inboxSourceTypes: string;
    inboxLoadingSource: string;
    inboxEmptySource: string;
    inboxByType: string;
    gapsTitle: string;
    gapsSubtitle: string;
    gapsLoading: string;
    coverageTitle: string;
    coverageSubtitle: string;
    radarTitle: string;
    radarSubtitle: string;
    radarEmpty: string;
    radarEmptyHelper: string;
    streamTitle: string;
    streamSubtitle: string;
    streamEmpty: string;
    streamEmptyHelper: string;
    signalsTitle: string;
    signalsSubtitle: string;
    signalsBody: string;
    signalsUrgent: string;
    signalsOverdue: string;
    signalsCompletion: string;
    dbLabel: string;
    dbLoading: string;
    dbCurrent: string;
    coverageUni: string;
    coverageUniHint: string;
    coveragePrograms: string;
    coverageProgramsHint: string;
    coverageProfessors: string;
    coverageProfessorsHint: string;
    coveragePapers: string;
    coveragePapersHint: string;
    coverageCaptures: string;
    coverageCapturesHint: string;
    coverageTasks: string;
    coverageTasksHint: string;
    gapNoPrograms: string;
    gapNoProgramsDetail: string;
    gapNoProfessors: string;
    gapNoProfessorsDetail: string;
    gapFewUniversities: string;
    gapFewUniversitiesDetail: string;
    gapNoPapers: string;
    gapNoPapersDetail: string;
    gapCandidateBacklog: string;
    gapCandidateBacklogDetail: string;
    gapNoTasks: string;
    gapNoTasksDetail: string;
    gapNone: string;
    gapNoneDetail: string;
    gapNoProgramsFor: (name: string) => string;
    gapNoProgramsForDetail: (name: string) => string;
    gapNoProfessorsFor: (name: string) => string;
    gapNoProfessorsForDetail: (name: string) => string;
    gapFewResourcesFor: (name: string) => string;
    gapFewResourcesForDetail: (name: string) => string;
    gapNoAdmissionFor: (name: string) => string;
    gapNoAdmissionForDetail: (name: string) => string;
    gapNoExperienceFor: (name: string) => string;
    gapNoExperienceForDetail: (name: string) => string;
    gapNoDeadlineFor: (name: string) => string;
    gapNoDeadlineForDetail: (name: string) => string;
    gapNoMaterialsFor: (name: string) => string;
    gapNoMaterialsForDetail: (name: string) => string;
    gapNoLabDirectionFor: (name: string) => string;
    gapNoLabDirectionForDetail: (name: string) => string;
    staleSourcesTitle: string;
    staleSourcesBody: string;
    heroStatInbox: string;
    heroStatEntries: string;
    heroStatSources: string;
    briefingLabel: string;
    briefingNewCaptures: string;
    briefingHighGaps: string;
    briefingStaleSources: string;
    briefingPendingReview: string;
    cardResources: (n: number) => string;
    cardGaps: (n: number) => string;
    cardUpdated: (n: number) => string;
    cardNever: string;
  };
  review2: {
    title: string;
    description: string;
    accept: string;
    ignore: string;
    accepting: string;
    ignoring: string;
    accepted: string;
    ignored: string;
    later: string;
    latering: string;
    promote: string;
    noResults: string;
    noResultsHelper: string;
    noLaterResults: string;
    noLaterResultsHelper: string;
    filterResourceType: string;
    filterUniversity: string;
    filterStatus: string;
    pendingTab: string;
    laterTab: string;
    allTypes: string;
    allUniversities: string;
    confidenceHigh: string;
    confidenceMedium: string;
    confidenceLow: string;
    hasContent: string;
    hasExcerpt: string;
    urlOnly: string;
    refreshSnapshot: string;
  };
  universityDetail: {
    programsTitle: string;
    professorsTitle: string;
    labsTitle: string;
    statsTitle: string;
    paperCount: string;
    taskCount: string;
    noPrograms: string;
    noProfessors: string;
    noLabs: string;
    deadline: string;
    researchKeywords: string;
    gapsTitle: string;
    gapsSubtitle: string;
    resourcesTitle: string;
    noResources: string;
    captureHint: string;
    hasSnapshot: string;
    excerptOnly: string;
    urlOnly: string;
    gapResolved: string;
    gapIgnored: string;
    gapInProgress: string;
    gapResolve: string;
    gapIgnore: string;
    gapReopen: string;
    gapAddSource: string;
  };
  entityType: Record<"university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task" | "resource", string>;
  conflicts: {
    title: string;
    description: string;
    filterOpen: string;
    filterResolved: string;
    filterIgnored: string;
    allTypes: string;
    typeUrlDuplicate: string;
    typeTitleDuplicate: string;
    typeValueMismatch: string;
    typeStaleUnverified: string;
    typeAiFieldConflict: string;
    trustSource: string;
    resolve: string;
    ignore: string;
    verify: string;
    keepValue: string;
    resolutionNotes: string;
    resolutionNotesPlaceholder: string;
    detectedAt: string;
    resolvedAt: string;
    sourcesInvolved: string;
    noConflicts: string;
    noConflictsHelper: string;
    detectNow: string;
    detecting: string;
    autoDetected: string;
    staleWarning: string;
    confidenceDecayed: string;
    reliabilityScore: string;
    runRefresh: string;
  };
  requirementsPage: {
    title: string;
    description: string;
    tabCards: string;
    tabCompare: string;
    matchedLabel: string;
    universitiesLabel: string;
    avgConfidence: string;
    filterPlaceholder: string;
    noResults: string;
    noResultsHelper: string;
    noMatchedAction: string;
    sourceLabel: string;
    extractedAt: string;
    noExtractedFacts: string;
    noExtractedFactsHelper: string;
    runExtract: string;
    matchReasonLabel: string;
    sectionBasics: string;
    sectionLanguage: string;
    sectionApplication: string;
    sectionFees: string;
    sectionDocuments: string;
    sectionScholarships: string;
    sectionCycles: string;
    sectionNotes: string;
    degree: string;
    language: string;
    intakeMonths: string;
    graduateSchool: string;
    department: string;
    englishTest: string;
    englishMinScore: string;
    englishNotes: string;
    japaneseRequired: string;
    japaneseType: string;
    japaneseLevel: string;
    documentsRequired: string;
    supervisorConsent: string;
    yes: string;
    no: string;
    examFee: string;
    tuitionPerYear: string;
    quota: string;
    mextEligible: string;
    scholarships: string;
    cycleApplicationOpen: string;
    cycleApplicationClose: string;
    cycleConsent: string;
    cycleExam: string;
    cycleResult: string;
    cycleEnrollment: string;
    applicationPeriods: string;
    requirementsList: string;
    contactEmail: string;
    deadline: string;
    confidence: string;
    unresolvedQuestions: string;
    notSpecified: string;
    colProgram: string;
    colUniversity: string;
    colDegree: string;
    colLanguage: string;
    colDeadline: string;
    colEnglish: string;
    colJapanese: string;
    colDocs: string;
    colSupervisor: string;
    colTuition: string;
    colMext: string;
    openProgram: string;
    openSource: string;
  };
  universitiesPage: {
    title: string;
    description: string;
    totalLabel: string;
    resourcesLabel: string;
    highGapsLabel: string;
    programsLabel: string;
    professorsLabel: string;
    labsLabel: string;
    updatedLabel: string;
    neverUpdated: string;
    sortLabel: string;
    sortName: string;
    sortUpdated: string;
    sortResources: string;
    sortGaps: string;
    filterPlaceholder: string;
    noData: string;
    noDataHelper: string;
    noDataAction1: string;
    noDataAction2: string;
    noResults: string;
    openDetail: string;
    addSource: string;
    capture: string;
    viewResources: string;
    viewGaps: string;
    noGaps: string;
    gapHigh: string;
    gapMedium: string;
    gapLow: string;
  };
  papersPage: {
    title: string;
    description: string;
    confirmedLabel: string;
    pendingLabel: string;
    thisWeekLabel: string;
    tabAll: string;
    tabConfirmed: string;
    tabCandidates: string;
    filterPlaceholder: string;
    noResults: string;
    noResultsHelper: string;
    noPapers: string;
    noPapersHelper: string;
    noCandidates: string;
    noCandidatesHelper: string;
    runIngest: string;
    addArxivSource: string;
    capturePaper: string;
    goToReview: string;
    candidateBadge: string;
    openUrl: string;
    openReview: string;
    linkedTo: string;
    year: string;
    venue: string;
    authors: string;
    keywords: string;
    abstract: string;
  };
}

export type MetricKey =
  | "universities"
  | "programs"
  | "professors"
  | "labs"
  | "papers"
  | "pending_candidates"
  | "timeline_tasks";

export const LANG_LABELS: Record<LangCode, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

export const LOCALES: Record<LangCode, Locale> = {
  zh: {
    htmlLang: "zh-CN",
    dateLocale: "zh-CN",
    metaTitle: "SRIS",
    brand: { name: "SRIS", subtitle: "Research Intelligence" },
    search: "全局搜索",
    searchPlaceholder: "搜索院校 / 教授 / 实验室 / 论文 / 资源 / 任务…",
    searchEmpty: "没有匹配结果",
    searchHint: "Ctrl/⌘ + K 唤起",
    searchFilterAll: "全部",
    searchFilterUniversity: "院校",
    searchFilterProgram: "项目",
    searchFilterProfessor: "教授",
    searchFilterLab: "实验室",
    searchFilterPaper: "论文",
    searchFilterResource: "资源",
    searchFilterTask: "任务",
    asiaShanghai: "Asia/Shanghai",
    privateMode: "Cloudflare Worker + D1 · private mode",
    logout: "退出 token",
    authActive: "API 令牌已激活",
    authRequired: "需要 API 令牌",
    loading: "加载中…",
    notSet: "未设置",
    refresh: "刷新",
    retry: "重试",
    reenterToken: "重新输入 token",
    dashboardLoadFailed: "无法加载总览",
    noPapersTitle: "暂无论文",
    noPapersHelper: "运行 arXiv ingest 或在 Review Queue 接受候选论文。",
    noTasksTitle: "没有临近任务",
    noTasksHelper: "未来 90 天暂无未完成事项。",
    reviewClearedTitle: "Review Queue 清空",
    reviewClearedHelper: "新的 arXiv 候选会在定时任务后出现。",
    unknownAuthors: "未知作者",
    cockpitChip: "Research intelligence cockpit",
    heroTitle: "SGU / AI 修士申请总览",
    heroBody: "把院校、教授、实验室、论文雷达和申请任务压缩成一个可扫描的每日控制台。",
    hero: { pending: "待确认论文", tasks90d: "90 天任务", completion: "完成率", pendingHelper: "Review queue", tasksHelper: "Application timeline", completionHelper: "Upcoming window" },
    panels: {
      recentPapers: ["近期论文", "已进入正式库的研究信号"],
      timeline: ["申请窗口", "未来 90 天高优先级动作"],
      review: ["待确认队列", "自动采集结果进入正式库前的缓冲区"],
      status: ["系统状态", "面向长期运行的基础设施信号"],
    },
    carouselTagline: "Target schools",
    carouselTitle: "目标院校快速入口",
    carouselHint: "自动轮播 · 点击进入院校信息",
    metrics: { universities: "院校", programs: "项目", professors: "教授", labs: "实验室", papers: "论文", pending_candidates: "待确认", timeline_tasks: "任务" },
    priorities: { high: "高", medium: "中", low: "低" },
    taskStatuses: { todo: "待办", doing: "进行中", done: "已完成" },
    status: { db: "D1 数据库", arxiv: "arXiv Radar", ai: "AI 摘要", cron: "Cloudflare Cron", connected: "Connected", checking: "Checking", aiReserved: "Interface reserved", cronSchedule: "Daily 23:15 UTC", pendingFmt: (n) => `${n} pending` },
    nav: { dashboard: "总览", universities: "院校", professors: "教授", labs: "实验室", programs: "项目", requirements: "申请要求", papers: "论文雷达", review: "待确认", timeline: "时间线", sources: "数据源", conflicts: "冲突" },
    pages: {
      dashboard: { title: "总览", description: "Dashboard" },
      universities: { title: "院校", description: "目标院校数据库会在下一轮迁移到 React 表格视图。" },
      professors: { title: "教授", description: "目标院校的教授和导师信息，包括研究方向、联系方式和实验室关联。" },
      labs: { title: "实验室", description: "实验室和研究组信息，包括研究方向、近期论文和负责人。" },
      programs: { title: "项目", description: "SGU 英文项目、申请窗口、语言要求和学费信息。" },
      requirements: { title: "申请要求", description: "已 AI 匹配的 SGU 项目的完整申请要求详情。" },
      papers: { title: "论文雷达", description: "已确认论文库会改成高密度研究表格。" },
      review: { title: "待确认", description: "Review Queue 会保留接受/忽略流程,并升级成卡片队列。" },
      timeline: { title: "时间线", description: "TOEFL / JLPT / SOP / 推荐信 / 申请 DDL 的 Gantt 视图。" },
      sources: { title: "数据源", description: "arXiv RSS、iCal 订阅、浏览器抽取刷。" },
      conflicts: { title: "冲突管理", description: "检测并解决信息冲突，追踪来源可信度与信息过期。" },
    },
    placeholderNote: "当前大改先完成总览页,后续页面会逐个迁移。",
    university: {
      backToOverview: "返回总览",
      featured: "Featured target",
      location: "地点",
      focus: "关注方向",
      notesTitle: "申请情报笔记",
      notesBody: "这里会承接后续完整院校数据库:项目、教授、实验室、论文信号、DDL 和申请材料状态都会聚合到这个视图。当前版本先把入口和视觉骨架打通。",
      officialSite: "官方网站",
      imageSource: "图片来源",
    },
    tokenGate: {
      chip: "Cloudflare Worker + D1",
      title: "SRIS Research Intelligence Console",
      body: "面向 SGU / AI 修士申请的个人研究情报控制台。输入部署时设置的 API token 后进入总览。",
      formTitle: "Private access",
      formBody: "Token 只保存在当前浏览器 localStorage,不会写入数据库。",
      fieldLabel: "API_TOKEN",
      placeholder: "Paste your private token",
      submit: "Enter dashboard",
    },
    resourceDetail: {
      back: "返回",
      urlOnly: "仅保存了 URL，未抓取正文",
      reFetch: "重新抓取",
      fetching: "抓取中…",
      snapshotAt: "快照时间",
      edit: "编辑",
      save: "保存",
      cancel: "取消",
      linkedEntities: "关联实体",
      contentSection: "正文快照",
      excerptSection: "证据摘录",
      metadataSection: "元数据",
      noExcerpt: "无摘录",
      summarize: "AI 摘要",
      summarizing: "摘要中…",
      summaryPreview: "AI 摘要预览",
      applySummary: "应用为摘录",
      statusLabel: "状态",
      statusUnverified: "待核实",
      statusVerified: "已验证",
      statusStale: "已过期",
      statusCoreEvidence: "核心证据",
      markingStatus: "标记中…",
    },
    timeline: {
      title: "申请时间线",
      description: "未来 N 个月的任务横向甘特图。",
      windowMonths: (n) => `未来 ${n} 个月`,
      prev: "上一段",
      next: "下一段",
      today: "今日",
      noTasks: "时间窗口内暂无任务。",
      legend: "图例",
      legendHigh: "高优先级",
      legendMedium: "普通",
      legendDone: "已完成",
      newTask: "新建任务",
      titleLabel: "标题",
      deadlineLabel: "截止日期",
      priorityLabel: "优先级",
      taskTypeLabel: "类型",
      notesLabel: "备注",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      deleteConfirm: "确认删除？",
    },
    sources: {
      title: "数据源 / 集成",
      description: "arXiv 采集、日历订阅、浏览器一键抓取。",
      icalTitle: "iCal 订阅",
      icalBody: "把这个 URL 添加到 Google / Apple Calendar 后,所有 DDL 自动同步到你的原生日历并接收提醒。注意:URL 含 token,请勿外泄。",
      icalAction: "复制订阅链接",
      icalCopied: "已复制",
      captureTitle: "浏览器抽取刷",
      captureBody: "把下面这段 JavaScript 拖到浏览器收藏栏作为书签。点击书签时,当前页面 URL + 选中文本会进入 SRIS 待确认队列。",
      captureHint: "提示:Safari 需要在偏好设置里启用「显示开发菜单」后才能编辑书签 JS。",
      captureCopy: "复制 bookmarklet",
      captureCopied: "已复制",
      arxivTitle: "arXiv 关键词源",
      arxivBody: "在 radar_sources 表里维护查询和关键词,Worker 的 cron 每天 23:15 UTC 自动跑一遍。",
      sourceNameLabel: "名称",
      sourceTypeLabel: "类型",
      universityLabel: "院校",
      confidenceLabel: "可信度",
      checkFrequencyLabel: "检查频率",
      keywordsLabel: "关键词",
      enabledLabel: "启用",
      lastRunLabel: "上次运行",
      newSource: "新建数据源",
      editSource: "编辑",
      deleteSource: "删除",
      sourceTypes: { arxiv: "arXiv", official: "官方网站", program_page: "项目页面", professor_page: "教授页面", lab_page: "实验室页面", admission: "招生信息", scholar: "Google Scholar", forum: "论坛", video: "视频" },
      staleWarning: "超过 7 天未检查",
      neverRun: "从未运行",
      staleSourcesTitle: "数据源停滞",
      staleSourcesBody: "以下数据源超过 7 天未运行,可能错过新信息。",
      patrolNeverChecked: "从未检查",
      patrolOk: "正常",
      patrolChanged: "有变化",
      patrolFailed: "检查失败",
      patrolStale: "过期",
      checkNow: "检查一次",
      runPatrol: "批量巡检",
      patrolling: "巡检中…",
      lastChecked: "最近检查",
      lastChanged: "最近变化",
    },
    capture: {
      title: "保存到 SRIS",
      body: "确认信息无误后保存到待确认队列。可以在 Review 页面继续处理。",
      urlLabel: "URL",
      titleLabel: "标题",
      notesLabel: "备注 / 选中文本",
      submit: "保存",
      success: "已保存到待确认队列",
      cancel: "取消",
      classificationLabel: "已识别",
      classifiedTypes: {
        "lab-page": "实验室页面",
        "professor-page": "教授页面",
        "program-page": "项目页面",
        "course-page": "课程页面",
        "university-page": "大学页面",
        arxiv: "arXiv 论文",
        scholar: "Google Scholar",
        dblp: "DBLP 论文",
        "semantic-scholar": "Semantic Scholar",
        paper: "论文",
        lab_page: "实验室页面",
        professor_page: "教授页面",
        program_page: "项目页面",
        official_page: "官方页面",
        admission_notice: "招生公告",
        experience_post: "经验帖",
        video: "视频",
        other: "其他",
      },
      resourceTypeLabel: "资源类型",
      universityLabel: "目标院校",
      programLabel: "关联项目",
      confidenceLabel: "可信度",
      relevanceNoteLabel: "相关性备注",
      domainLabel: "来源域名",
      excerptLabel: "证据摘录",
      excerptPlaceholder: "保存网页中的关键段落",
    },
    professors: {
      title: "教授与导师",
      description: "目标院校的教授和导师信息，包括研究方向、联系方式和实验室关联。",
      university: "所属院校",
      researchKeywords: "研究方向",
      email: "邮箱",
      website: "主页",
      noResults: "暂无教授信息",
      noResultsHelper: "建议从以下方式补充：① 添加教授主页 source → Source Hub；② 在院校官网抓取 faculty 页面 → Capture；③ 从 Google Scholar 或 arXiv 候选关联到具体教授。",
      matchReason: "匹配分析",
      matchButton: "AI 匹配",
      matching: "分析中…",
      matchAll: "批量匹配",
      matchAllDone: "批量完成",
    },
    labs: {
      title: "实验室",
      description: "实验室和研究组信息，包括研究方向、近期论文和负责人。",
      university: "所属院校",
      director: "负责人",
      researchKeywords: "研究方向",
      recentPapers: "近期论文",
      website: "主页",
      noResults: "暂无实验室信息",
      noResultsHelper: "建议从以下方式补充：① 捕获实验室主页（lab_page 类型）→ 进入 Review Queue 接受；② 在 Source Hub 添加实验室页 source；③ 从已有教授关联到实验室。",
    },
    programs: {
      title: "项目",
      description: "SGU 英文项目、申请窗口、语言要求和学费信息。",
      university: "所属院校",
      degree: "学位",
      language: "授课语言",
      deadline: "申请截止",
      requirements: "申请要求",
      scholarship: "奖学金",
      tuition: "学费",
      website: "项目主页",
      noResults: "暂无项目信息",
      noResultsHelper: "建议从以下方式补充：① 优先捕获官方项目页（program_page / admission_notice 类型）；② 在院校详情页用缺口快捷入口跳到 Capture；③ 添加招生公告 source。",
      matchReason: "匹配分析",
      matchButton: "AI 匹配",
      matching: "分析中…",
      matchAll: "批量匹配",
      matchAllDone: "批量完成",
    },
    userProfile: {
      panelTitle: "我的研究背景",
      panelBody: "填写后，AI 可以分析每个教授和项目与你的研究方向匹配程度。",
      backgroundLabel: "研究背景与经历",
      backgroundPlaceholder: "例：本科计算机，研究过 LLM 推理效率、分布式训练调度，有 arXiv 预印本一篇。",
      fieldsLabel: "目标研究领域",
      fieldsPlaceholder: "例：ML systems, LLM inference, distributed training",
      save: "保存",
      saved: "已保存",
      noProfile: "未设置研究背景",
      noProfileHelper: "请先填写你的研究背景，才能生成匹配分析。",
    },
    dashboard2: {
      heroLabel: "Intelligence Library",
      heroTitle: "打破信息差的研究资源库",
      heroBody: "总览页现在优先回答：哪些资源刚被捕获、哪些来源覆盖不足、哪些关键词正在出现、哪些材料值得进入正式库。申请时间线和决策信号保留为辅助层。",
      inboxLabel: "Intelligence Inbox",
      inboxLoading: "正在整理资源入口",
      inboxCountFmt: (n) => `${n} 条新资源等待判断价值`,
      inboxBody: "这里是系统的主入口：arXiv 候选、浏览器捕获、手动保存的链接和近期论文先进入缓冲层，经过人工判断后再沉淀到正式资料库。",
      inboxPending: "待确认",
      inboxManualCaptures: "手动捕获",
      inboxSourceTypes: "来源类型",
      inboxLoadingSource: "正在统计来源…",
      inboxEmptySource: "暂无来源数据，先运行采集或用浏览器捕获入口保存资源。",
      inboxByType: "按类型",
      gapsTitle: "信息缺口",
      gapsSubtitle: "用来发现哪些领域还没有足够资料支撑判断",
      gapsLoading: "正在扫描信息缺口…",
      coverageTitle: "来源覆盖",
      coverageSubtitle: "把资料库从申请清单转向可验证的信息网络",
      radarTitle: "关键词雷达",
      radarSubtitle: "从候选论文和正式论文中提取当前高频方向",
      radarEmpty: "暂无关键词命中",
      radarEmptyHelper: "候选论文或正式论文进入库后，这里会显示研究方向热度。",
      streamTitle: "资源流",
      streamSubtitle: "最近捕获、候选论文和正式论文的统一视图",
      streamEmpty: "暂无资源流",
      streamEmptyHelper: "采集 arXiv、手动捕获网页或接受候选论文后，这里会开始滚动。",
      signalsTitle: "申请辅助信号",
      signalsSubtitle: "只保留会影响资料优先级的 deadline 与任务风险",
      signalsBody: "这块不再作为总览核心，只提醒哪些申请动作会改变接下来要搜集的信息优先级。",
      signalsUrgent: "30 天任务",
      signalsOverdue: "逾期",
      signalsCompletion: "完成率",
      dbLabel: "Database Inventory",
      dbLoading: "loading",
      dbCurrent: "current",
      coverageUni: "官方院校入口",
      coverageUniHint: "目标学校、官网入口、基础定位",
      coveragePrograms: "项目与 deadline",
      coverageProgramsHint: "SGU 项目、申请窗口、材料要求",
      coverageProfessors: "教授 / 实验室",
      coverageProfessorsHint: "研究对象、lab 页面、导师线索",
      coveragePapers: "论文与研究信号",
      coveragePapersHint: "正式论文库 + 待确认候选",
      coverageCaptures: "浏览器捕获",
      coverageCapturesHint: "从网页临时保存的非结构化资料",
      coverageTasks: "辅助任务",
      coverageTasksHint: "仅作为信息搜集优先级参考",
      gapNoPrograms: "项目信息尚未结构化",
      gapNoProgramsDetail: "还缺少项目名、申请窗口、材料要求和官方 URL。这个缺口会直接影响后续决策质量。",
      gapNoProfessors: "教授 / 实验室线索不足",
      gapNoProfessorsDetail: "信息差最容易出现在导师、lab、研究组页面和近期成果之间，需要优先补齐。",
      gapFewUniversities: "目标院校池偏窄",
      gapFewUniversitiesDetail: "建议至少保持 5 个目标院校入口，方便横向比较项目、导师和申请节奏。",
      gapNoPapers: "正式论文库为空",
      gapNoPapersDetail: "Review Queue 接受后才会成为可复用的研究证据，目前还缺沉淀层。",
      gapCandidateBacklog: "候选资源堆积",
      gapCandidateBacklogDetail: "待确认资源过多会降低资料可信度，建议先筛掉低相关候选再继续采集。",
      gapNoTasks: "deadline 暂未抽取",
      gapNoTasksDetail: "申请任务不是主轴，但 deadline 会决定信息搜集顺序，需要保留基础节点。",
      gapNone: "暂无明显信息缺口",
      gapNoneDetail: "当前资料库已经具备基础覆盖，可以继续扩大来源和提升资料可信度。",
      gapNoProgramsFor: (name) => `${name} 尚无结构化项目信息`,
      gapNoProgramsForDetail: (name) => `${name} 还缺少项目名、申请窗口和材料要求，直接影响决策质量。`,
      gapNoProfessorsFor: (name) => `${name} 教授/实验室线索不足`,
      gapNoProfessorsForDetail: (name) => `${name} 尚无教授或实验室数据，信息差最大。`,
      gapFewResourcesFor: (name) => `${name} 情报资源偏少`,
      gapFewResourcesForDetail: (name) => `${name} 的已确认资源不足 3 条，建议补充招生公告或经验帖。`,
      gapNoAdmissionFor: (name) => `${name} 缺少招生公告`,
      gapNoAdmissionForDetail: (name) => `${name} 尚无招生公告类资源，这是申请决策的关键信息。`,
      gapNoExperienceFor: (name) => `${name} 缺少经验帖`,
      gapNoExperienceForDetail: (name) => `${name} 尚无申请经验帖，了解前人路径有助于规划。`,
      gapNoDeadlineFor: (name) => `${name} 项目无截止日期`,
      gapNoDeadlineForDetail: (name) => `${name} 的项目尚未录入申请截止日期，无法规划时间线。`,
      gapNoMaterialsFor: (name) => `${name} 项目无申请材料说明`,
      gapNoMaterialsForDetail: (name) => `${name} 的项目缺少申请材料要求字段，无法确认准备清单。`,
      gapNoLabDirectionFor: (name) => `${name} 实验室方向未知`,
      gapNoLabDirectionForDetail: (name) => `${name} 有教授/实验室记录但缺少实验室页面资源，研究方向不明确。`,
      staleSourcesTitle: "数据源停滞",
      staleSourcesBody: "以下数据源超过 7 天未运行，可能错过新信息。",
      heroStatInbox: "情报入口",
      heroStatEntries: "资源条目",
      heroStatSources: "覆盖源",
      briefingLabel: "今日情报",
      briefingNewCaptures: "今日新增",
      briefingHighGaps: "高优先级缺口",
      briefingStaleSources: "停滞源",
      briefingPendingReview: "待确认",
      cardResources: (n) => `${n} 条资源`,
      cardGaps: (n) => `${n} 个缺口`,
      cardUpdated: (n) => `${n} 天前更新`,
      cardNever: "从未更新",
    },
    review2: {
      title: "待确认",
      description: "候选论文和捕获资源进入正式库前的缓冲区。",
      accept: "接受",
      ignore: "忽略",
      accepting: "接受中…",
      ignoring: "忽略中…",
      accepted: "已接受",
      ignored: "已忽略",
      later: "稍后",
      latering: "标记中…",
      promote: "恢复待办",
      noResults: "Review Queue 清空",
      noResultsHelper: "新的 arXiv 候选会在定时任务后出现。",
      noLaterResults: "没有标记为稍后的资源",
      noLaterResultsHelper: "标记为稍后的资源会出现在这里。",
      filterResourceType: "资源类型",
      filterUniversity: "院校",
      filterStatus: "状态",
      pendingTab: "待确认",
      laterTab: "稍后处理",
      allTypes: "全部类型",
      allUniversities: "全部院校",
      confidenceHigh: "高",
      confidenceMedium: "中",
      confidenceLow: "低",
      hasContent: "有正文",
      hasExcerpt: "有摘录",
      urlOnly: "仅链接",
      refreshSnapshot: "重新抓取",
    },
    universityDetail: {
      programsTitle: "项目",
      professorsTitle: "教授",
      labsTitle: "实验室",
      statsTitle: "统计",
      paperCount: "论文",
      taskCount: "任务",
      noPrograms: "暂无项目",
      noProfessors: "暂无教授",
      noLabs: "暂无实验室",
      deadline: "截止日期",
      researchKeywords: "研究方向",
      gapsTitle: "信息缺口",
      gapsSubtitle: "该院校目前缺少的信息维度",
      resourcesTitle: "情报资源",
      noResources: "暂无情报资源",
      captureHint: "捕获此信息",
      hasSnapshot: "有快照",
      excerptOnly: "仅摘录",
      urlOnly: "仅链接",
      gapResolved: "已解决",
      gapIgnored: "已忽略",
      gapInProgress: "处理中",
      gapResolve: "标记解决",
      gapIgnore: "忽略",
      gapReopen: "重新打开",
      gapAddSource: "添加来源",
    },
    entityType: { university: "院校", program: "项目", professor: "教授", lab: "实验室", paper: "论文", candidate: "候选", task: "任务", resource: "资源" },
    conflicts: {
      title: "冲突管理",
      description: "检测并解决信息冲突，追踪来源可信度与信息过期。",
      filterOpen: "待处理",
      filterResolved: "已解决",
      filterIgnored: "已忽略",
      allTypes: "全部类型",
      typeUrlDuplicate: "URL重复",
      typeTitleDuplicate: "标题重复",
      typeValueMismatch: "值冲突",
      typeStaleUnverified: "过期未验证",
      typeAiFieldConflict: "AI字段冲突",
      trustSource: "信任此来源",
      resolve: "解决",
      ignore: "忽略",
      verify: "验证",
      keepValue: "保留此值",
      resolutionNotes: "处理备注",
      resolutionNotesPlaceholder: "说明处理原因…",
      detectedAt: "检测时间",
      resolvedAt: "解决时间",
      sourcesInvolved: "涉及来源",
      noConflicts: "暂无冲突",
      noConflictsHelper: "当不同来源对同一字段说法不一致时，冲突会自动出现在这里。点击「立即检测」立即扫描。",
      detectNow: "立即检测",
      detecting: "检测中…",
      autoDetected: "自动检测",
      staleWarning: "信息可能已过期",
      confidenceDecayed: "可信度已衰减",
      reliabilityScore: "来源可靠性",
      runRefresh: "刷新可信度",
    },
    requirementsPage: {
      title: "申请要求详情",
      description: "已通过 AI 匹配标记为相关的 SGU 项目，把官方招生公告里的语言成绩、文档清单、申请窗口、学费等结构化字段铺开。",
      tabCards: "详情卡片",
      tabCompare: "对比表格",
      matchedLabel: "已匹配项目",
      universitiesLabel: "涉及院校",
      avgConfidence: "平均抽取置信度",
      filterPlaceholder: "按项目 / 院校筛选…",
      noResults: "无匹配结果",
      noResultsHelper: "尝试清空筛选词。",
      noMatchedAction: "前往「项目」页对感兴趣的 SGU 项目点击「AI 匹配」按钮，匹配过的项目就会出现在这里。",
      sourceLabel: "数据来源",
      extractedAt: "抽取时间",
      noExtractedFacts: "尚未结构化抽取",
      noExtractedFactsHelper: "该项目还没有关联的 program_page 或 admission_notice 资源完成 AI 抽取。建议捕获官方招生页面并在 Resource Detail 触发抽取。",
      runExtract: "前往捕获官方页",
      matchReasonLabel: "AI 匹配分析",
      sectionBasics: "基本信息",
      sectionLanguage: "语言要求",
      sectionApplication: "申请安排",
      sectionFees: "费用",
      sectionDocuments: "申请材料",
      sectionScholarships: "奖学金",
      sectionCycles: "申请周期",
      sectionNotes: "备注",
      degree: "学位",
      language: "授课语言",
      intakeMonths: "入学月",
      graduateSchool: "研究科",
      department: "专攻",
      englishTest: "英语考试",
      englishMinScore: "最低分",
      englishNotes: "备注",
      japaneseRequired: "日语要求",
      japaneseType: "类型",
      japaneseLevel: "等级",
      documentsRequired: "所需文档",
      supervisorConsent: "需要事前同意",
      yes: "需要",
      no: "不需要",
      examFee: "考试费",
      tuitionPerYear: "年学费",
      quota: "招生人数",
      mextEligible: "MEXT 资格",
      scholarships: "奖学金",
      cycleApplicationOpen: "申请开放",
      cycleApplicationClose: "申请截止",
      cycleConsent: "同意书截止",
      cycleExam: "考试期",
      cycleResult: "结果发布",
      cycleEnrollment: "入学日",
      applicationPeriods: "申请窗口",
      requirementsList: "申请要求",
      contactEmail: "联系邮箱",
      deadline: "截止日",
      confidence: "置信度",
      unresolvedQuestions: "未确认问题",
      notSpecified: "未指定",
      colProgram: "项目",
      colUniversity: "院校",
      colDegree: "学位",
      colLanguage: "语言",
      colDeadline: "截止",
      colEnglish: "英语",
      colJapanese: "日语",
      colDocs: "材料",
      colSupervisor: "事前同意",
      colTuition: "学费",
      colMext: "MEXT",
      openProgram: "打开项目",
      openSource: "查看证据",
    },
    universitiesPage: {
      title: "院校情报地图",
      description: "每所目标院校的情报覆盖状态：还缺什么、最近捕获了什么、下一步该查哪里。",
      totalLabel: "目标院校",
      resourcesLabel: "资源总数",
      highGapsLabel: "高优先缺口",
      programsLabel: "项目",
      professorsLabel: "教授",
      labsLabel: "实验室",
      updatedLabel: "最近更新",
      neverUpdated: "尚无资源",
      sortLabel: "排序",
      sortName: "名称",
      sortUpdated: "最近更新",
      sortResources: "资源最多",
      sortGaps: "缺口最多",
      filterPlaceholder: "按院校名筛选…",
      noData: "暂无目标院校",
      noDataHelper: "还没有添加任何目标院校。先添加一个 source 或捕获官方项目页，系统会自动创建院校入口。",
      noDataAction1: "添加数据源",
      noDataAction2: "捕获网页",
      noResults: "无匹配院校",
      openDetail: "查看详情",
      addSource: "添加 source",
      capture: "捕获",
      viewResources: "查看资源",
      viewGaps: "查看缺口",
      noGaps: "无明显缺口",
      gapHigh: "高",
      gapMedium: "中",
      gapLow: "低",
    },
    papersPage: {
      title: "论文雷达",
      description: "已确认论文库 + 待确认论文候选的统一视图。把论文和研究信号沉淀成教授匹配证据。",
      confirmedLabel: "已确认",
      pendingLabel: "待确认候选",
      thisWeekLabel: "本周新增",
      tabAll: "全部",
      tabConfirmed: "已确认论文",
      tabCandidates: "待确认候选",
      filterPlaceholder: "按标题 / 作者 / 关键词筛选…",
      noResults: "没有匹配结果",
      noResultsHelper: "尝试调整筛选条件。",
      noPapers: "正式论文库为空",
      noPapersHelper: "在 Review Queue 接受论文候选后，它们会进入正式论文库作为可复用证据。",
      noCandidates: "暂无论文候选",
      noCandidatesHelper: "运行 arXiv ingest、添加 arXiv source，或用捕获入口保存论文链接，候选就会出现在这里。",
      runIngest: "运行 arXiv ingest",
      addArxivSource: "添加 arXiv source",
      capturePaper: "捕获论文链接",
      goToReview: "前往 Review Queue",
      candidateBadge: "候选",
      openUrl: "打开链接",
      openReview: "进入 Review",
      linkedTo: "关联",
      year: "年份",
      venue: "发表于",
      authors: "作者",
      keywords: "关键词",
      abstract: "摘要",
    },
  },
  en: {
    htmlLang: "en",
    dateLocale: "en-US",
    metaTitle: "SRIS",
    brand: { name: "SRIS", subtitle: "Research Intelligence" },
    search: "Global search",
    searchPlaceholder: "Search universities / professors / labs / papers / resources / tasks…",
    searchEmpty: "No matching results",
    searchHint: "Ctrl/⌘ + K to open",
    searchFilterAll: "All",
    searchFilterUniversity: "University",
    searchFilterProgram: "Program",
    searchFilterProfessor: "Professor",
    searchFilterLab: "Lab",
    searchFilterPaper: "Paper",
    searchFilterResource: "Resource",
    searchFilterTask: "Task",
    asiaShanghai: "Asia/Shanghai",
    privateMode: "Cloudflare Worker + D1 · private mode",
    logout: "Sign out",
    authActive: "API token active",
    authRequired: "API token required",
    loading: "Loading…",
    notSet: "not set",
    refresh: "Refresh",
    retry: "Retry",
    reenterToken: "Re-enter token",
    dashboardLoadFailed: "Could not load dashboard",
    noPapersTitle: "No papers yet",
    noPapersHelper: "Run the arXiv ingest, or accept candidates from the review queue.",
    noTasksTitle: "No upcoming tasks",
    noTasksHelper: "Nothing open in the next 90 days.",
    reviewClearedTitle: "Review queue clear",
    reviewClearedHelper: "New arXiv candidates appear after each scheduled run.",
    unknownAuthors: "Unknown authors",
    cockpitChip: "Research intelligence cockpit",
    heroTitle: "SGU / AI Master application overview",
    heroBody: "Compress universities, professors, labs, the paper radar, and application tasks into one scannable daily console.",
    hero: { pending: "Pending papers", tasks90d: "90-day tasks", completion: "Completion", pendingHelper: "Review queue", tasksHelper: "Application timeline", completionHelper: "Upcoming window" },
    panels: {
      recentPapers: ["Recent papers", "Research signals already in the main library"],
      timeline: ["Application window", "High-priority moves in the next 90 days"],
      review: ["Review queue", "Buffer before candidates land in the main library"],
      status: ["System status", "Infrastructure signals for a long-running setup"],
    },
    carouselTagline: "Target schools",
    carouselTitle: "Target university quick entry",
    carouselHint: "Auto-scrolling · click to open",
    metrics: { universities: "Universities", programs: "Programs", professors: "Professors", labs: "Labs", papers: "Papers", pending_candidates: "Review", timeline_tasks: "Tasks" },
    priorities: { high: "High", medium: "Medium", low: "Low" },
    taskStatuses: { todo: "Todo", doing: "Doing", done: "Done" },
    status: { db: "D1 database", arxiv: "arXiv radar", ai: "AI summary", cron: "Cloudflare cron", connected: "Connected", checking: "Checking", aiReserved: "Interface reserved", cronSchedule: "Daily 23:15 UTC", pendingFmt: (n) => `${n} pending` },
    nav: { dashboard: "Dashboard", universities: "Universities", professors: "Professors", labs: "Labs", programs: "Programs", requirements: "Requirements", papers: "Paper radar", review: "Review", timeline: "Timeline", sources: "Sources", conflicts: "Conflicts" },
    pages: {
      dashboard: { title: "Dashboard", description: "Dashboard" },
      universities: { title: "Universities", description: "The target-university database moves to a React table view next." },
      professors: { title: "Professors", description: "Professors and advisors at target universities — research directions, contact info, and lab affiliations." },
      labs: { title: "Labs", description: "Research groups and labs — focus areas, recent papers, and directors." },
      programs: { title: "Programs", description: "SGU English programs — application windows, language requirements, and tuition." },
      requirements: { title: "Requirements", description: "Full application requirements for AI-matched SGU programs." },
      papers: { title: "Paper radar", description: "The accepted-papers library will become a dense research table." },
      review: { title: "Review", description: "Review queue keeps accept/ignore but upgrades to a card layout." },
      timeline: { title: "Timeline", description: "Gantt view of TOEFL / JLPT / SOP / recommendation / application DDLs." },
      sources: { title: "Sources", description: "arXiv RSS, iCal subscription, browser quick-capture." },
      conflicts: { title: "Conflicts", description: "Detect and resolve information conflicts, track source reliability." },
    },
    placeholderNote: "The redesign starts from the dashboard; other pages are migrated in subsequent passes.",
    university: {
      backToOverview: "Back to overview",
      featured: "Featured target",
      location: "Location",
      focus: "Focus areas",
      notesTitle: "Application notes",
      notesBody: "This view will host the full university database: programs, professors, labs, paper signals, deadlines, and material status. The current version wires up the entry point and visual skeleton.",
      officialSite: "Official site",
      imageSource: "Image source",
    },
    tokenGate: {
      chip: "Cloudflare Worker + D1",
      title: "SRIS Research Intelligence Console",
      body: "Personal research intelligence console for SGU / AI master’s applications. Enter the API token set at deploy time to continue.",
      formTitle: "Private access",
      formBody: "The token stays in this browser’s localStorage; it is never sent to a database.",
      fieldLabel: "API_TOKEN",
      placeholder: "Paste your private token",
      submit: "Enter dashboard",
    },
    resourceDetail: {
      back: "Back",
      urlOnly: "URL only, no content captured",
      reFetch: "Re-fetch content",
      fetching: "Fetching…",
      snapshotAt: "Snapshot at",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      linkedEntities: "Linked entities",
      contentSection: "Content snapshot",
      excerptSection: "Evidence excerpt",
      metadataSection: "Metadata",
      noExcerpt: "No excerpt",
      summarize: "AI summary",
      summarizing: "Summarizing…",
      summaryPreview: "AI summary preview",
      applySummary: "Apply as excerpt",
      statusLabel: "Status",
      statusUnverified: "Unverified",
      statusVerified: "Verified",
      statusStale: "Stale",
      statusCoreEvidence: "Core evidence",
      markingStatus: "Marking…",
    },
    timeline: {
      title: "Application timeline",
      description: "Horizontal Gantt view of tasks across the next several months.",
      windowMonths: (n) => `Next ${n} months`,
      prev: "Previous",
      next: "Next",
      today: "Today",
      noTasks: "No tasks in the current window.",
      legend: "Legend",
      legendHigh: "High priority",
      legendMedium: "Normal",
      legendDone: "Done",
      newTask: "New task",
      titleLabel: "Title",
      deadlineLabel: "Deadline",
      priorityLabel: "Priority",
      taskTypeLabel: "Type",
      notesLabel: "Notes",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      deleteConfirm: "Confirm delete?",
    },
    sources: {
      title: "Sources & integrations",
      description: "arXiv ingest, calendar subscription, one-click web capture.",
      icalTitle: "iCal subscription",
      icalBody: "Add this URL to Google / Apple Calendar to receive every deadline natively. The URL contains your token — do not share.",
      icalAction: "Copy subscription URL",
      icalCopied: "Copied",
      captureTitle: "Browser quick-capture",
      captureBody: "Drag the snippet below to your bookmarks bar. Clicking the bookmark sends the current page URL + selection to the SRIS review queue.",
      captureHint: "Note: Safari requires the Develop menu to be enabled before you can edit bookmark JavaScript.",
      captureCopy: "Copy bookmarklet",
      captureCopied: "Copied",
      arxivTitle: "arXiv keyword sources",
      arxivBody: "Maintain queries and keywords in `radar_sources`; the Worker cron runs every day at 23:15 UTC.",
      sourceNameLabel: "Name",
      sourceTypeLabel: "Type",
      universityLabel: "University",
      confidenceLabel: "Confidence",
      checkFrequencyLabel: "Check frequency",
      keywordsLabel: "Keywords",
      enabledLabel: "Enabled",
      lastRunLabel: "Last run",
      newSource: "New source",
      editSource: "Edit",
      deleteSource: "Delete",
      sourceTypes: { arxiv: "arXiv", official: "Official site", program_page: "Program page", professor_page: "Professor page", lab_page: "Lab page", admission: "Admission", scholar: "Google Scholar", forum: "Forum", video: "Video" },
      staleWarning: "Not checked in 7+ days",
      neverRun: "Never run",
      staleSourcesTitle: "Stale sources",
      staleSourcesBody: "These sources haven't run in over 7 days and may be missing new information.",
      patrolNeverChecked: "Never checked",
      patrolOk: "OK",
      patrolChanged: "Changed",
      patrolFailed: "Check failed",
      patrolStale: "Stale",
      checkNow: "Check now",
      runPatrol: "Run patrol",
      patrolling: "Patrolling…",
      lastChecked: "Last checked",
      lastChanged: "Last changed",
    },
    capture: {
      title: "Save to SRIS",
      body: "Confirm the details, then push it into the review queue.",
      urlLabel: "URL",
      titleLabel: "Title",
      notesLabel: "Notes / selected text",
      submit: "Save",
      success: "Saved to the review queue",
      cancel: "Cancel",
      classificationLabel: "Detected",
      classifiedTypes: {
        "lab-page": "Lab page",
        "professor-page": "Professor page",
        "program-page": "Program page",
        "course-page": "Course page",
        "university-page": "University page",
        arxiv: "arXiv paper",
        scholar: "Google Scholar",
        dblp: "DBLP paper",
        "semantic-scholar": "Semantic Scholar",
        paper: "Paper",
        lab_page: "Lab page",
        professor_page: "Professor page",
        program_page: "Program page",
        official_page: "Official page",
        admission_notice: "Admission notice",
        experience_post: "Experience post",
        video: "Video",
        other: "Other",
      },
      resourceTypeLabel: "Resource type",
      universityLabel: "Target university",
      programLabel: "Related program",
      confidenceLabel: "Confidence",
      relevanceNoteLabel: "Relevance note",
      domainLabel: "Source domain",
      excerptLabel: "Evidence excerpt",
      excerptPlaceholder: "Save key paragraphs from the page",
    },
    professors: {
      title: "Professors & Advisors",
      description: "Professors and advisors at target universities — research directions, contact info, and lab affiliations.",
      university: "University",
      researchKeywords: "Research areas",
      email: "Email",
      website: "Website",
      noResults: "No professors yet",
      noResultsHelper: "To populate this list: ① add a professor page source in Source Hub; ② capture a faculty page (professor_page type); ③ or link paper candidates to a professor profile.",
      matchReason: "Match analysis",
      matchButton: "AI match",
      matching: "Analyzing…",
      matchAll: "Match all",
      matchAllDone: "Done",
    },
    labs: {
      title: "Labs",
      description: "Research groups and labs — focus areas, recent papers, and directors.",
      university: "University",
      director: "Director",
      researchKeywords: "Research areas",
      recentPapers: "Recent papers",
      website: "Website",
      noResults: "No labs yet",
      noResultsHelper: "To populate this list: ① capture a lab homepage (lab_page type) and accept it in Review; ② add a lab page source in Source Hub; ③ or associate a professor with a lab entry.",
    },
    programs: {
      title: "Programs",
      description: "SGU English programs — application windows, language requirements, and tuition.",
      university: "University",
      degree: "Degree",
      language: "Language",
      deadline: "Deadline",
      requirements: "Requirements",
      scholarship: "Scholarship",
      tuition: "Tuition",
      website: "Program website",
      noResults: "No programs yet",
      noResultsHelper: "To populate this list: ① capture official program or admission pages (program_page / admission_notice types); ② use the gap shortcut in University Detail to open Capture pre-filled; ③ or add an admission notice source.",
      matchReason: "Match analysis",
      matchButton: "AI match",
      matching: "Analyzing…",
      matchAll: "Match all",
      matchAllDone: "Done",
    },
    userProfile: {
      panelTitle: "My Research Profile",
      panelBody: "Fill this in so AI can analyze how each professor and program aligns with your research direction.",
      backgroundLabel: "Research background",
      backgroundPlaceholder: "e.g. CS undergrad, research on LLM inference efficiency and distributed training scheduling, one arXiv preprint.",
      fieldsLabel: "Target research fields",
      fieldsPlaceholder: "e.g. ML systems, LLM inference, distributed training",
      save: "Save",
      saved: "Saved",
      noProfile: "No research profile set",
      noProfileHelper: "Set your research background first to enable match analysis.",
    },
    dashboard2: {
      heroLabel: "Intelligence Library",
      heroTitle: "Breaking the information gap",
      heroBody: "The dashboard now prioritizes: which resources were just captured, which sources lack coverage, which keywords are emerging, and which materials belong in the main library. Application timeline and decision signals are kept as a supporting layer.",
      inboxLabel: "Intelligence Inbox",
      inboxLoading: "Organizing resource entries",
      inboxCountFmt: (n) => `${n} new resources awaiting review`,
      inboxBody: "This is the main entry point: arXiv candidates, browser captures, manually saved links, and recent papers first enter a buffer layer, then settle into the main library after human judgment.",
      inboxPending: "Pending",
      inboxManualCaptures: "Manual captures",
      inboxSourceTypes: "Source types",
      inboxLoadingSource: "Counting sources…",
      inboxEmptySource: "No source data yet. Run ingestion or use the browser capture to save resources.",
      inboxByType: "By type",
      gapsTitle: "Information gaps",
      gapsSubtitle: "Discover which areas lack enough evidence for decisions",
      gapsLoading: "Scanning for gaps…",
      coverageTitle: "Source coverage",
      coverageSubtitle: "Turn the library from an application checklist into a verifiable information network",
      radarTitle: "Keyword radar",
      radarSubtitle: "Extract trending research directions from candidates and papers",
      radarEmpty: "No keyword hits yet",
      radarEmptyHelper: "When candidates or papers enter the library, research direction trends will appear here.",
      streamTitle: "Resource stream",
      streamSubtitle: "Unified view of recent captures, candidates, and papers",
      streamEmpty: "No resources yet",
      streamEmptyHelper: "Ingest arXiv, capture web pages, or accept candidates to start the stream.",
      signalsTitle: "Application signals",
      signalsSubtitle: "Only deadlines and task risks that affect information-gathering priority",
      signalsBody: "This section is no longer the dashboard core — it only reminds you which application actions change the next information-gathering priority.",
      signalsUrgent: "30-day tasks",
      signalsOverdue: "Overdue",
      signalsCompletion: "Completion",
      dbLabel: "Database Inventory",
      dbLoading: "loading",
      dbCurrent: "current",
      coverageUni: "University entries",
      coverageUniHint: "Target schools, official sites, baseline positioning",
      coveragePrograms: "Programs & deadlines",
      coverageProgramsHint: "SGU programs, application windows, material requirements",
      coverageProfessors: "Professors / Labs",
      coverageProfessorsHint: "Research targets, lab pages, advisor leads",
      coveragePapers: "Papers & research signals",
      coveragePapersHint: "Main paper library + pending candidates",
      coverageCaptures: "Browser captures",
      coverageCapturesHint: "Unstructured material saved from web pages",
      coverageTasks: "Supporting tasks",
      coverageTasksHint: "For information-gathering priority only",
      gapNoPrograms: "Programs not yet structured",
      gapNoProgramsDetail: "Missing program names, application windows, material requirements, and official URLs. This gap directly affects decision quality.",
      gapNoProfessors: "Professor / lab leads insufficient",
      gapNoProfessorsDetail: "Information gaps are most common between advisors, lab pages, research groups, and recent outputs — prioritize filling these.",
      gapFewUniversities: "Target university pool too narrow",
      gapFewUniversitiesDetail: "Maintain at least 5 target university entries for cross-comparing programs, advisors, and application rhythm.",
      gapNoPapers: "Main paper library empty",
      gapNoPapersDetail: "Only accepted Review Queue items become reusable research evidence — the sediment layer is missing.",
      gapCandidateBacklog: "Candidate backlog",
      gapCandidateBacklogDetail: "Too many unreviewed resources reduce data credibility. Filter low-relevance candidates before continuing ingestion.",
      gapNoTasks: "Deadlines not yet extracted",
      gapNoTasksDetail: "Application tasks aren't the main axis, but deadlines determine information-gathering order — keep basic nodes.",
      gapNone: "No obvious information gaps",
      gapNoneDetail: "The current library has baseline coverage. Continue expanding sources and improving data credibility.",
      gapNoProgramsFor: (name) => `${name} has no structured programs`,
      gapNoProgramsForDetail: (name) => `Missing program names, application windows, and material requirements for ${name}.`,
      gapNoProfessorsFor: (name) => `${name} lacks professor / lab leads`,
      gapNoProfessorsForDetail: (name) => `No professor or lab data for ${name} — this is where information gaps are largest.`,
      gapFewResourcesFor: (name) => `${name} has few intelligence resources`,
      gapFewResourcesForDetail: (name) => `${name} has fewer than 3 confirmed resources — consider adding admission notices or experience posts.`,
      gapNoAdmissionFor: (name) => `${name} lacks admission notices`,
      gapNoAdmissionForDetail: (name) => `${name} has no admission notice resources — critical for application decisions.`,
      gapNoExperienceFor: (name) => `${name} lacks experience posts`,
      gapNoExperienceForDetail: (name) => `${name} has no application experience posts — understanding predecessors' paths helps planning.`,
      gapNoDeadlineFor: (name) => `${name} programs have no deadlines`,
      gapNoDeadlineForDetail: (name) => `${name}'s programs have no application deadline recorded — cannot plan a timeline.`,
      gapNoMaterialsFor: (name) => `${name} programs lack materials list`,
      gapNoMaterialsForDetail: (name) => `${name}'s programs have no requirements listed — cannot confirm what to prepare.`,
      gapNoLabDirectionFor: (name) => `${name} lab direction unknown`,
      gapNoLabDirectionForDetail: (name) => `${name} has professor/lab entries but no lab-page resource — research direction is unclear.`,
      staleSourcesTitle: "Stale sources",
      staleSourcesBody: "These sources haven't run in over 7 days and may be missing new information.",
      heroStatInbox: "Inbox",
      heroStatEntries: "Entries",
      heroStatSources: "Sources",
      briefingLabel: "Today's Intelligence",
      briefingNewCaptures: "New captures today",
      briefingHighGaps: "High-priority gaps",
      briefingStaleSources: "Stale sources",
      briefingPendingReview: "Pending review",
      cardResources: (n) => `${n} resources`,
      cardGaps: (n) => `${n} gaps`,
      cardUpdated: (n) => `${n}d ago`,
      cardNever: "Never updated",
    },
    review2: {
      title: "Review",
      description: "Buffer before candidates land in the main library.",
      accept: "Accept",
      ignore: "Ignore",
      accepting: "Accepting…",
      ignoring: "Ignoring…",
      accepted: "Accepted",
      ignored: "Ignored",
      later: "Later",
      latering: "Marking…",
      promote: "Re-open",
      noResults: "Review queue clear",
      noResultsHelper: "New arXiv candidates appear after each scheduled run.",
      noLaterResults: "No items marked for later",
      noLaterResultsHelper: "Items you mark for later review will appear here.",
      filterResourceType: "Resource type",
      filterUniversity: "University",
      filterStatus: "Status",
      pendingTab: "Pending",
      laterTab: "Later",
      allTypes: "All types",
      allUniversities: "All universities",
      confidenceHigh: "High",
      confidenceMedium: "Medium",
      confidenceLow: "Low",
      hasContent: "Has content",
      hasExcerpt: "Has excerpt",
      urlOnly: "URL only",
      refreshSnapshot: "Re-fetch",
    },
    universityDetail: {
      programsTitle: "Programs",
      professorsTitle: "Professors",
      labsTitle: "Labs",
      statsTitle: "Stats",
      paperCount: "Papers",
      taskCount: "Tasks",
      noPrograms: "No programs",
      noProfessors: "No professors",
      noLabs: "No labs",
      deadline: "Deadline",
      researchKeywords: "Research areas",
      gapsTitle: "Information gaps",
      gapsSubtitle: "Missing information dimensions for this university",
      resourcesTitle: "Intelligence resources",
      noResources: "No intelligence resources",
      captureHint: "Capture this information",
      hasSnapshot: "Snapshotted",
      excerptOnly: "Excerpt only",
      urlOnly: "URL only",
      gapResolved: "Resolved",
      gapIgnored: "Ignored",
      gapInProgress: "In progress",
      gapResolve: "Mark resolved",
      gapIgnore: "Ignore",
      gapReopen: "Reopen",
      gapAddSource: "Add source",
    },
    entityType: { university: "University", program: "Program", professor: "Professor", lab: "Lab", paper: "Paper", candidate: "Candidate", task: "Task", resource: "Resource" },
    conflicts: {
      title: "Conflict Management",
      description: "Detect and resolve information conflicts, track source reliability and stale data.",
      filterOpen: "Open",
      filterResolved: "Resolved",
      filterIgnored: "Ignored",
      allTypes: "All types",
      typeUrlDuplicate: "URL duplicate",
      typeTitleDuplicate: "Title duplicate",
      typeValueMismatch: "Value mismatch",
      typeStaleUnverified: "Stale/unverified",
      typeAiFieldConflict: "AI field conflict",
      trustSource: "Trust this source",
      resolve: "Resolve",
      ignore: "Ignore",
      verify: "Verify",
      keepValue: "Keep this value",
      resolutionNotes: "Resolution notes",
      resolutionNotesPlaceholder: "Explain your decision…",
      detectedAt: "Detected at",
      resolvedAt: "Resolved at",
      sourcesInvolved: "Sources involved",
      noConflicts: "No conflicts",
      noConflictsHelper: "Conflicts appear here when different sources disagree on the same field. Click \"Detect now\" to run an immediate scan.",
      detectNow: "Detect now",
      detecting: "Detecting…",
      autoDetected: "Auto-detected",
      staleWarning: "Information may be stale",
      confidenceDecayed: "Confidence has decayed",
      reliabilityScore: "Source reliability",
      runRefresh: "Refresh confidence",
    },
    requirementsPage: {
      title: "Program requirements",
      description: "Structured requirements for SGU programs you've AI-matched — language scores, document checklists, application windows, fees — all laid out side by side.",
      tabCards: "Detail cards",
      tabCompare: "Compare table",
      matchedLabel: "Matched programs",
      universitiesLabel: "Universities",
      avgConfidence: "Avg extraction confidence",
      filterPlaceholder: "Filter by program / university…",
      noResults: "No matching results",
      noResultsHelper: "Try clearing the filter.",
      noMatchedAction: "Go to the Programs page and click \"AI match\" on programs you're interested in — matched programs will appear here.",
      sourceLabel: "Source",
      extractedAt: "Extracted",
      noExtractedFacts: "Not yet extracted",
      noExtractedFactsHelper: "No linked program_page or admission_notice resource has been AI-extracted for this program. Capture the official admission page and trigger extraction from Resource Detail.",
      runExtract: "Capture official page",
      matchReasonLabel: "AI match analysis",
      sectionBasics: "Basics",
      sectionLanguage: "Language requirements",
      sectionApplication: "Application",
      sectionFees: "Fees",
      sectionDocuments: "Documents required",
      sectionScholarships: "Scholarships",
      sectionCycles: "Application cycles",
      sectionNotes: "Notes",
      degree: "Degree",
      language: "Language",
      intakeMonths: "Intake",
      graduateSchool: "Graduate school",
      department: "Department",
      englishTest: "English test",
      englishMinScore: "Min score",
      englishNotes: "Notes",
      japaneseRequired: "Japanese required",
      japaneseType: "Test type",
      japaneseLevel: "Min level",
      documentsRequired: "Documents",
      supervisorConsent: "Supervisor consent required",
      yes: "Required",
      no: "Not required",
      examFee: "Exam fee",
      tuitionPerYear: "Tuition / year",
      quota: "Quota",
      mextEligible: "MEXT eligible",
      scholarships: "Scholarships",
      cycleApplicationOpen: "App. open",
      cycleApplicationClose: "App. close",
      cycleConsent: "Consent deadline",
      cycleExam: "Exam period",
      cycleResult: "Result",
      cycleEnrollment: "Enrollment",
      applicationPeriods: "Application periods",
      requirementsList: "Requirements",
      contactEmail: "Contact email",
      deadline: "Deadline",
      confidence: "Confidence",
      unresolvedQuestions: "Unresolved questions",
      notSpecified: "Not specified",
      colProgram: "Program",
      colUniversity: "University",
      colDegree: "Degree",
      colLanguage: "Lang",
      colDeadline: "Deadline",
      colEnglish: "English",
      colJapanese: "JLPT",
      colDocs: "Docs",
      colSupervisor: "Consent",
      colTuition: "Tuition",
      colMext: "MEXT",
      openProgram: "Open program",
      openSource: "View evidence",
    },
    universitiesPage: {
      title: "University intelligence map",
      description: "Coverage status for each target university — what's missing, what was recently captured, where to look next.",
      totalLabel: "Universities",
      resourcesLabel: "Total resources",
      highGapsLabel: "High-priority gaps",
      programsLabel: "Programs",
      professorsLabel: "Professors",
      labsLabel: "Labs",
      updatedLabel: "Last updated",
      neverUpdated: "No resources yet",
      sortLabel: "Sort",
      sortName: "Name",
      sortUpdated: "Recently updated",
      sortResources: "Most resources",
      sortGaps: "Most gaps",
      filterPlaceholder: "Filter by university name…",
      noData: "No target universities",
      noDataHelper: "No universities added yet. Add a source or capture an official program page and a university entry will be created automatically.",
      noDataAction1: "Add source",
      noDataAction2: "Capture page",
      noResults: "No matching universities",
      openDetail: "View detail",
      addSource: "Add source",
      capture: "Capture",
      viewResources: "View resources",
      viewGaps: "View gaps",
      noGaps: "No significant gaps",
      gapHigh: "High",
      gapMedium: "Med",
      gapLow: "Low",
    },
    papersPage: {
      title: "Paper radar",
      description: "Confirmed papers + pending candidates in one view. Settle papers into reusable professor-match evidence.",
      confirmedLabel: "Confirmed",
      pendingLabel: "Pending candidates",
      thisWeekLabel: "This week",
      tabAll: "All",
      tabConfirmed: "Confirmed papers",
      tabCandidates: "Pending candidates",
      filterPlaceholder: "Filter by title / author / keyword…",
      noResults: "No matching results",
      noResultsHelper: "Try adjusting your filters.",
      noPapers: "No confirmed papers yet",
      noPapersHelper: "Accept paper candidates in the Review Queue to build the confirmed paper library.",
      noCandidates: "No paper candidates",
      noCandidatesHelper: "Run arXiv ingest, add an arXiv source, or capture a paper URL to start seeing candidates here.",
      runIngest: "Run arXiv ingest",
      addArxivSource: "Add arXiv source",
      capturePaper: "Capture paper URL",
      goToReview: "Go to Review Queue",
      candidateBadge: "Candidate",
      openUrl: "Open URL",
      openReview: "Open in Review",
      linkedTo: "Linked to",
      year: "Year",
      venue: "Venue",
      authors: "Authors",
      keywords: "Keywords",
      abstract: "Abstract",
    },
  },
  ja: {
    htmlLang: "ja",
    dateLocale: "ja-JP",
    metaTitle: "SRIS",
    brand: { name: "SRIS", subtitle: "Research Intelligence" },
    search: "全文検索",
    searchPlaceholder: "大学 / 教授 / 研究室 / 論文 / リソース / タスクを検索…",
    searchEmpty: "一致する結果がありません",
    searchHint: "Ctrl/⌘ + K で開く",
    searchFilterAll: "すべて",
    searchFilterUniversity: "大学",
    searchFilterProgram: "プログラム",
    searchFilterProfessor: "教授",
    searchFilterLab: "研究室",
    searchFilterPaper: "論文",
    searchFilterResource: "リソース",
    searchFilterTask: "タスク",
    asiaShanghai: "Asia/Shanghai",
    privateMode: "Cloudflare Worker + D1 · プライベートモード",
    logout: "トークン解除",
    authActive: "API トークン有効",
    authRequired: "API トークンが必要",
    loading: "読み込み中…",
    notSet: "未設定",
    refresh: "更新",
    retry: "再試行",
    reenterToken: "トークン再入力",
    dashboardLoadFailed: "ダッシュボードを読み込めません",
    noPapersTitle: "論文はまだありません",
    noPapersHelper: "arXiv ingest を実行するか、レビューキューから候補を採用してください。",
    noTasksTitle: "直近のタスクはありません",
    noTasksHelper: "90 日以内に未完了の項目はありません。",
    reviewClearedTitle: "レビューキューは空です",
    reviewClearedHelper: "新しい arXiv 候補は次回のスケジュール後に表示されます。",
    unknownAuthors: "著者不明",
    cockpitChip: "Research intelligence cockpit",
    heroTitle: "SGU / AI 修士出願ダッシュボード",
    heroBody: "大学・教授・研究室・論文レーダー・出願タスクを一つのスキャン可能なコンソールに集約。",
    hero: { pending: "未確認論文", tasks90d: "90 日タスク", completion: "完了率", pendingHelper: "Review queue", tasksHelper: "Application timeline", completionHelper: "Upcoming window" },
    panels: {
      recentPapers: ["最近の論文", "正式登録済みの研究シグナル"],
      timeline: ["出願ウィンドウ", "今後 90 日の優先タスク"],
      review: ["レビュー待ち", "正式登録前のバッファ"],
      status: ["システム状態", "長期運用向けのインフラ信号"],
    },
    carouselTagline: "Target schools",
    carouselTitle: "志望校クイックエントリー",
    carouselHint: "自動スクロール · クリックで詳細",
    metrics: { universities: "大学", programs: "プログラム", professors: "教授", labs: "研究室", papers: "論文", pending_candidates: "レビュー", timeline_tasks: "タスク" },
    priorities: { high: "高", medium: "中", low: "低" },
    taskStatuses: { todo: "未着手", doing: "進行中", done: "完了" },
    status: { db: "D1 データベース", arxiv: "arXiv レーダー", ai: "AI サマリ", cron: "Cloudflare Cron", connected: "Connected", checking: "Checking", aiReserved: "Interface reserved", cronSchedule: "毎日 23:15 UTC", pendingFmt: (n) => `${n} pending` },
    nav: { dashboard: "ダッシュボード", universities: "大学", professors: "教授", labs: "研究室", programs: "プログラム", requirements: "出願要件", papers: "論文レーダー", review: "レビュー", timeline: "タイムライン", sources: "ソース", conflicts: "競合" },
    pages: {
      dashboard: { title: "ダッシュボード", description: "Dashboard" },
      universities: { title: "大学", description: "志望校データベースは次回 React テーブルに移行します。" },
      professors: { title: "教授", description: "志望校の教授・指導教員情報 — 研究方向・連絡先・研究室所属。" },
      labs: { title: "研究室", description: "研究グループ・研究室 — 重点領域・最近の論文・責任者。" },
      programs: { title: "プログラム", description: "SGU 英語プログラム — 出願窓口・言語要件・学費情報。" },
      requirements: { title: "出願要件", description: "AI マッチ済み SGU プログラムの完全な出願要件詳細。" },
      papers: { title: "論文レーダー", description: "登録済み論文ライブラリは高密度の研究テーブルになります。" },
      review: { title: "レビュー", description: "レビュー待ちは accept/ignore のままカード形式に進化します。" },
      timeline: { title: "タイムライン", description: "TOEFL / JLPT / SOP / 推薦状 / 出願締切のガントビュー。" },
      sources: { title: "ソース", description: "arXiv RSS、iCal 購読、ブラウザクイックキャプチャ。" },
      conflicts: { title: "競合管理", description: "情報の競合を検出・解決し、ソースの信頼性を追跡。" },
    },
    placeholderNote: "総覧から大改修を始め、他ページは順次移行します。",
    university: {
      backToOverview: "ダッシュボードへ戻る",
      featured: "Featured target",
      location: "所在地",
      focus: "重点領域",
      notesTitle: "出願メモ",
      notesBody: "この画面は今後、大学データベース全体(プログラム・教授・研究室・論文シグナル・締切・出願マテリアル状況)を集約します。現バージョンは入口と視覚的なスケルトンを通すまでです。",
      officialSite: "公式サイト",
      imageSource: "画像の出典",
    },
    tokenGate: {
      chip: "Cloudflare Worker + D1",
      title: "SRIS Research Intelligence Console",
      body: "SGU / AI 修士出願のための個人向け研究インテリジェンス・コンソール。デプロイ時に設定した API トークンを入力してください。",
      formTitle: "Private access",
      formBody: "トークンはブラウザの localStorage のみに保存され、データベースには送信されません。",
      fieldLabel: "API_TOKEN",
      placeholder: "プライベートトークンを貼り付け",
      submit: "ダッシュボードへ",
    },
    resourceDetail: {
      back: "戻る",
      urlOnly: "URL のみ、コンテンツ未取得",
      reFetch: "再取得",
      fetching: "取得中…",
      snapshotAt: "スナップショット日時",
      edit: "編集",
      save: "保存",
      cancel: "キャンセル",
      linkedEntities: "関連エンティティ",
      contentSection: "コンテンツスナップショット",
      excerptSection: "証拠抜粋",
      metadataSection: "メタデータ",
      noExcerpt: "抜粋なし",
      summarize: "AI 要約",
      summarizing: "要約中…",
      summaryPreview: "AI 要約プレビュー",
      applySummary: "抜粋に適用",
      statusLabel: "ステータス",
      statusUnverified: "未確認",
      statusVerified: "確認済み",
      statusStale: "期限切れ",
      statusCoreEvidence: "核心証拠",
      markingStatus: "マーク中…",
    },
    timeline: {
      title: "出願タイムライン",
      description: "今後数ヶ月のタスクを横方向のガントで一覧。",
      windowMonths: (n) => `今後 ${n} ヶ月`,
      prev: "前へ",
      next: "次へ",
      today: "今日",
      noTasks: "現在の表示ウィンドウにタスクはありません。",
      legend: "凡例",
      legendHigh: "高優先",
      legendMedium: "通常",
      legendDone: "完了",
      newTask: "新規タスク",
      titleLabel: "タイトル",
      deadlineLabel: "締切",
      priorityLabel: "優先度",
      taskTypeLabel: "タイプ",
      notesLabel: "メモ",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      deleteConfirm: "削除しますか？",
    },
    sources: {
      title: "ソース・連携",
      description: "arXiv 取り込み・カレンダー購読・ワンクリック取り込み。",
      icalTitle: "iCal 購読",
      icalBody: "この URL を Google / Apple カレンダーに追加すると、全ての締切がネイティブカレンダーに同期されます。URL にはトークンが含まれます — 共有しないでください。",
      icalAction: "購読 URL をコピー",
      icalCopied: "コピーしました",
      captureTitle: "ブラウザクイックキャプチャ",
      captureBody: "下のスニペットをブックマークバーにドラッグしてください。ブックマークをクリックすると、現在のページ URL と選択テキストが SRIS のレビューキューに送られます。",
      captureHint: "注意: Safari ではブックマークの JavaScript を編集するために「開発」メニューを有効化する必要があります。",
      captureCopy: "ブックマークレットをコピー",
      captureCopied: "コピーしました",
      arxivTitle: "arXiv キーワードソース",
      arxivBody: "`radar_sources` でクエリとキーワードを管理します。Worker の cron が毎日 23:15 UTC に実行します。",
      sourceNameLabel: "名前",
      sourceTypeLabel: "タイプ",
      universityLabel: "大学",
      confidenceLabel: "信頼度",
      checkFrequencyLabel: "確認頻度",
      keywordsLabel: "キーワード",
      enabledLabel: "有効",
      lastRunLabel: "最終実行",
      newSource: "新規ソース",
      editSource: "編集",
      deleteSource: "削除",
      sourceTypes: { arxiv: "arXiv", official: "公式サイト", program_page: "プログラムページ", professor_page: "教授ページ", lab_page: "研究室ページ", admission: "入試情報", scholar: "Google Scholar", forum: "フォーラム", video: "動画" },
      staleWarning: "7 日以上未チェック",
      neverRun: "未実行",
      staleSourcesTitle: "ソース停滞",
      staleSourcesBody: "これらのソースは 7 日以上実行されておらず、新しい情報を見落としている可能性があります。",
      patrolNeverChecked: "未チェック",
      patrolOk: "正常",
      patrolChanged: "変更あり",
      patrolFailed: "チェック失敗",
      patrolStale: "期限切れ",
      checkNow: "今すぐチェック",
      runPatrol: "一括巡回",
      patrolling: "巡回中…",
      lastChecked: "最終チェック",
      lastChanged: "最終変更",
    },
    capture: {
      title: "SRIS に保存",
      body: "内容を確認してレビューキューに送ります。",
      urlLabel: "URL",
      titleLabel: "タイトル",
      notesLabel: "メモ / 選択テキスト",
      submit: "保存",
      success: "レビューキューに保存しました",
      cancel: "キャンセル",
      classificationLabel: "検出",
      classifiedTypes: {
        "lab-page": "研究室ページ",
        "professor-page": "教授ページ",
        "program-page": "プログラムページ",
        "course-page": "コースページ",
        "university-page": "大学ページ",
        arxiv: "arXiv 論文",
        scholar: "Google Scholar",
        dblp: "DBLP 論文",
        "semantic-scholar": "Semantic Scholar",
        paper: "論文",
        lab_page: "研究室ページ",
        professor_page: "教授ページ",
        program_page: "プログラムページ",
        official_page: "公式ページ",
        admission_notice: "入試公告",
        experience_post: "体験記",
        video: "動画",
        other: "その他",
      },
      resourceTypeLabel: "リソースタイプ",
      universityLabel: "対象大学",
      programLabel: "関連プログラム",
      confidenceLabel: "信頼度",
      relevanceNoteLabel: "関連性メモ",
      domainLabel: "ソースドメイン",
      excerptLabel: "証拠抜粋",
      excerptPlaceholder: "ページの重要な段落を保存",
    },
    professors: {
      title: "教授・指導教員",
      description: "志望校の教授・指導教員情報 — 研究方向・連絡先・研究室所属。",
      university: "所属大学",
      researchKeywords: "研究分野",
      email: "メール",
      website: "ウェブサイト",
      noResults: "教授情報なし",
      noResultsHelper: "次の方法で追加できます：① Source Hub で教授ページのソースを追加；② 教員ページをキャプチャ（professor_page タイプ）；③ 論文候補を教授プロフィールに関連付け。",
      matchReason: "マッチ分析",
      matchButton: "AI マッチ",
      matching: "分析中…",
      matchAll: "一括マッチ",
      matchAllDone: "完了",
    },
    labs: {
      title: "研究室",
      description: "研究グループ・研究室 — 重点領域・最近の論文・責任者。",
      university: "所属大学",
      director: "責任者",
      researchKeywords: "研究分野",
      recentPapers: "最近の論文",
      website: "ウェブサイト",
      noResults: "研究室情報なし",
      noResultsHelper: "次の方法で追加できます：① 研究室ホームページをキャプチャ（lab_page タイプ）してレビューで受け入れ；② Source Hub で研究室ページのソースを追加；③ 教授を研究室に関連付け。",
    },
    programs: {
      title: "プログラム",
      description: "SGU 英語プログラム — 出願窓口・言語要件・学費情報。",
      university: "所属大学",
      degree: "学位",
      language: "授業言語",
      deadline: "出願締切",
      requirements: "出願要件",
      scholarship: "奨学金",
      tuition: "学費",
      website: "プログラムサイト",
      noResults: "プログラム情報なし",
      noResultsHelper: "次の方法で追加できます：① 公式プログラム・募集要項ページをキャプチャ（program_page / admission_notice タイプ）；② 大学詳細のギャップショートカットでキャプチャを開く；③ 募集要項ソースを追加。",
      matchReason: "マッチ分析",
      matchButton: "AI マッチ",
      matching: "分析中…",
      matchAll: "一括マッチ",
      matchAllDone: "完了",
    },
    userProfile: {
      panelTitle: "研究プロフィール",
      panelBody: "入力すると、AIが各教授・プログラムとの研究方向の適合性を分析できます。",
      backgroundLabel: "研究背景・経験",
      backgroundPlaceholder: "例：学部CS、LLM推論効率・分散訓練スケジューリングの研究、arXivプレプリント1本。",
      fieldsLabel: "目標研究分野",
      fieldsPlaceholder: "例：ML systems, LLM inference, distributed training",
      save: "保存",
      saved: "保存済み",
      noProfile: "研究プロフィール未設定",
      noProfileHelper: "まず研究背景を入力してください。マッチ分析が有効になります。",
    },
    dashboard2: {
      heroLabel: "Intelligence Library",
      heroTitle: "情報格差を打破する研究リソースライブラリ",
      heroBody: "ダッシュボードは今、何がキャプチャされたか、どのソースのカバレッジが不足しているか、どのキーワードが台頭しているか、どの資料がメインライブラリに値するかを優先的に回答します。出願タイムラインと意思決定シグナルは補助層として維持されます。",
      inboxLabel: "Intelligence Inbox",
      inboxLoading: "リソースエントリを整理中",
      inboxCountFmt: (n) => `${n} 件の新規リソースが審査待ち`,
      inboxBody: "ここがシステムのメインエントリです：arXiv 候補、ブラウザキャプチャ、手動保存リンク、最近の論文がまずバッファ層に入り、人間の判断を経て正式ライブラリに沈殿します。",
      inboxPending: "未確認",
      inboxManualCaptures: "手動キャプチャ",
      inboxSourceTypes: "ソース種別",
      inboxLoadingSource: "ソースを集計中…",
      inboxEmptySource: "ソースデータなし。取り込みを実行するか、ブラウザキャプチャでリソースを保存してください。",
      inboxByType: "タイプ別",
      gapsTitle: "情報ギャップ",
      gapsSubtitle: "どの領域の証拠が不足しているかを発見",
      gapsLoading: "ギャップをスキャン中…",
      coverageTitle: "ソースカバレッジ",
      coverageSubtitle: "ライブラリを出願チェックリストから検証可能な情報ネットワークへ",
      radarTitle: "キーワードレーダー",
      radarSubtitle: "候補論文と正式論文から注目研究方向を抽出",
      radarEmpty: "キーワード命中なし",
      radarEmptyHelper: "候補論文や正式論文がライブラリに入ると、研究方向トレンドが表示されます。",
      streamTitle: "リソースストリーム",
      streamSubtitle: "最近のキャプチャ・候補論文・正式論文の統合ビュー",
      streamEmpty: "リソースなし",
      streamEmptyHelper: "arXiv を取り込み、ウェブページをキャプチャ、または候補を受け入れるとストリームが開始されます。",
      signalsTitle: "出願補助シグナル",
      signalsSubtitle: "情報収集優先度に影響する締切とタスクリスクのみ",
      signalsBody: "このセクションはダッシュボードのコアではありません — 次の情報収集優先度を変更する出願アクションのみをリマインドします。",
      signalsUrgent: "30 日以内タスク",
      signalsOverdue: "期限超過",
      signalsCompletion: "完了率",
      dbLabel: "Database Inventory",
      dbLoading: "loading",
      dbCurrent: "current",
      coverageUni: "大学エントリ",
      coverageUniHint: "志望校・公式サイト・基本ポジショニング",
      coveragePrograms: "プログラム・締切",
      coverageProgramsHint: "SGU プログラム・出願窓口・書類要件",
      coverageProfessors: "教授 / 研究室",
      coverageProfessorsHint: "研究対象・ラボページ・指導教員の手がかり",
      coveragePapers: "論文・研究シグナル",
      coveragePapersHint: "正式論文ライブラリ + 未確認候補",
      coverageCaptures: "ブラウザキャプチャ",
      coverageCapturesHint: "ウェブページから一時保存した非構造化資料",
      coverageTasks: "補助タスク",
      coverageTasksHint: "情報収集優先度の参考のみ",
      gapNoPrograms: "プログラム情報が未構造化",
      gapNoProgramsDetail: "プログラム名・出願窓口・書類要件・公式 URL が不足。このギャップは意思決定品質に直接影響します。",
      gapNoProfessors: "教授 / 研究室の手がかり不足",
      gapNoProfessorsDetail: "情報ギャップは指導教員・ラボ・研究グループページと最近の成果の間に最も生じやすい — これらを優先的に埋めてください。",
      gapFewUniversities: "志望校プールが狭い",
      gapFewUniversitiesDetail: "少なくとも 5 つの志望校エントリを維持し、プログラム・指導教員・出願リズムを横断比較できるようにしてください。",
      gapNoPapers: "正式論文ライブラリが空",
      gapNoPapersDetail: "レビューキューで承認されたものだけが再利用可能な研究証拠になります — 沈殿層が欠けています。",
      gapCandidateBacklog: "候補バックログ",
      gapCandidateBacklogDetail: "未確認リソースが多すぎるとデータの信頼性が低下します。低関連候補を除外してから取り込みを続けてください。",
      gapNoTasks: "締切が未抽出",
      gapNoTasksDetail: "出願タスクは主軸ではありませんが、締切が情報収集順序を決定します — 基本ノードを維持してください。",
      gapNone: "明らかな情報ギャップなし",
      gapNoneDetail: "現在のライブラリは基本カバレッジを備えています。ソースの拡大とデータ信頼性の向上を続けてください。",
      gapNoProgramsFor: (name) => `${name} に構造化されたプログラム情報なし`,
      gapNoProgramsForDetail: (name) => `${name} のプログラム名・出願窓口・書類要件が不足。意思決定品質に直接影響します。`,
      gapNoProfessorsFor: (name) => `${name} に教授/研究室の手がかり不足`,
      gapNoProfessorsForDetail: (name) => `${name} の教授・研究室データなし — 情報ギャップが最大の領域です。`,
      gapFewResourcesFor: (name) => `${name} のインテリジェンスリソースが少ない`,
      gapFewResourcesForDetail: (name) => `${name} の確認済みリソースが 3 件未満です — 入試公告や体験記の追加を検討してください。`,
      gapNoAdmissionFor: (name) => `${name} に入試公告なし`,
      gapNoAdmissionForDetail: (name) => `${name} には入試公告リソースがありません — 出願決定に不可欠な情報です。`,
      gapNoExperienceFor: (name) => `${name} に体験記なし`,
      gapNoExperienceForDetail: (name) => `${name} には出願体験記がありません — 先人の道を知ることで計画に役立ちます。`,
      gapNoDeadlineFor: (name) => `${name} のプログラムに期限なし`,
      gapNoDeadlineForDetail: (name) => `${name} のプログラムに出願締め切りが登録されていません — タイムラインを計画できません。`,
      gapNoMaterialsFor: (name) => `${name} のプログラムに出願材料リストなし`,
      gapNoMaterialsForDetail: (name) => `${name} のプログラムに必要書類フィールドがありません — 準備リストを確認できません。`,
      gapNoLabDirectionFor: (name) => `${name} の研究室方向不明`,
      gapNoLabDirectionForDetail: (name) => `${name} には教授・研究室があるが研究室ページリソースがありません — 研究方向が不明です。`,
      staleSourcesTitle: "ソース停滞",
      staleSourcesBody: "これらのソースは 7 日以上実行されておらず、新しい情報を見落としている可能性があります。",
      heroStatInbox: "受信箱",
      heroStatEntries: "エントリ",
      heroStatSources: "ソース",
      briefingLabel: "今日のインテリジェンス",
      briefingNewCaptures: "今日の新規",
      briefingHighGaps: "高優先ギャップ",
      briefingStaleSources: "停滞ソース",
      briefingPendingReview: "未確認",
      cardResources: (n) => `${n} 件リソース`,
      cardGaps: (n) => `${n} 件ギャップ`,
      cardUpdated: (n) => `${n} 日前`,
      cardNever: "未更新",
    },
    review2: {
      title: "レビュー",
      description: "候補が正式ライブラリに入る前のバッファ。",
      accept: "承認",
      ignore: "無視",
      accepting: "承認中…",
      ignoring: "無視中…",
      accepted: "承認済み",
      ignored: "無視済み",
      later: "後で",
      latering: "マーク中…",
      promote: "再オープン",
      noResults: "レビューキューは空です",
      noResultsHelper: "新しい候補は次回のスケジュール後に表示されます。",
      noLaterResults: "後でマークされたアイテムなし",
      noLaterResultsHelper: "後で確認するためにマークしたアイテムがここに表示されます。",
      filterResourceType: "リソースタイプ",
      filterUniversity: "大学",
      filterStatus: "ステータス",
      pendingTab: "未確認",
      laterTab: "後で",
      allTypes: "全タイプ",
      allUniversities: "全大学",
      confidenceHigh: "高",
      confidenceMedium: "中",
      confidenceLow: "低",
      hasContent: "本文あり",
      hasExcerpt: "抜粋あり",
      urlOnly: "URLのみ",
      refreshSnapshot: "再取得",
    },
    universityDetail: {
      programsTitle: "プログラム",
      professorsTitle: "教授",
      labsTitle: "研究室",
      statsTitle: "統計",
      paperCount: "論文",
      taskCount: "タスク",
      noPrograms: "プログラムなし",
      noProfessors: "教授なし",
      noLabs: "研究室なし",
      deadline: "締切",
      researchKeywords: "研究分野",
      gapsTitle: "情報ギャップ",
      gapsSubtitle: "この大学で不足している情報領域",
      resourcesTitle: "インテリジェンスリソース",
      noResources: "インテリジェンスリソースなし",
      captureHint: "この情報をキャプチャ",
      hasSnapshot: "スナップショットあり",
      excerptOnly: "抜粋のみ",
      urlOnly: "URLのみ",
      gapResolved: "解決済み",
      gapIgnored: "無視",
      gapInProgress: "対応中",
      gapResolve: "解決済みにする",
      gapIgnore: "無視",
      gapReopen: "再オープン",
      gapAddSource: "ソース追加",
    },
    entityType: { university: "大学", program: "プログラム", professor: "教授", lab: "研究室", paper: "論文", candidate: "候補", task: "タスク", resource: "リソース" },
    conflicts: {
      title: "競合管理",
      description: "情報の競合を検出・解決し、ソースの信頼性と古いデータを追跡。",
      filterOpen: "未解決",
      filterResolved: "解決済み",
      filterIgnored: "無視",
      allTypes: "全タイプ",
      typeUrlDuplicate: "URL重複",
      typeTitleDuplicate: "タイトル重複",
      typeValueMismatch: "値の不一致",
      typeStaleUnverified: "期限切れ未検証",
      typeAiFieldConflict: "AIフィールド矛盾",
      trustSource: "このソースを信頼",
      resolve: "解決",
      ignore: "無視",
      verify: "検証",
      keepValue: "この値を保持",
      resolutionNotes: "解決メモ",
      resolutionNotesPlaceholder: "判断理由を入力…",
      detectedAt: "検出日時",
      resolvedAt: "解決日時",
      sourcesInvolved: "関連ソース",
      noConflicts: "競合なし",
      noConflictsHelper: "異なるソースが同じフィールドで矛盾する場合、ここに競合が表示されます。「今すぐ検出」をクリックしてスキャン。",
      detectNow: "今すぐ検出",
      detecting: "検出中…",
      autoDetected: "自動検出",
      staleWarning: "情報が古い可能性",
      confidenceDecayed: "信頼度が低下",
      reliabilityScore: "ソース信頼性",
      runRefresh: "信頼度を更新",
    },
    requirementsPage: {
      title: "出願要件詳細",
      description: "AI マッチで関連付けた SGU プログラムの構造化された出願要件 — 語学スコア、書類リスト、出願期間、学費を一覧で。",
      tabCards: "詳細カード",
      tabCompare: "比較表",
      matchedLabel: "マッチ済み",
      universitiesLabel: "大学数",
      avgConfidence: "平均抽出信頼度",
      filterPlaceholder: "プログラム / 大学でフィルター…",
      noResults: "一致する結果なし",
      noResultsHelper: "フィルターを消去してください。",
      noMatchedAction: "「プログラム」ページで興味のある SGU プログラムに「AI マッチ」をクリックすると、ここに表示されます。",
      sourceLabel: "ソース",
      extractedAt: "抽出日時",
      noExtractedFacts: "未抽出",
      noExtractedFactsHelper: "このプログラムに関連する program_page または admission_notice リソースが AI 抽出されていません。公式募集ページをキャプチャして Resource Detail で抽出を実行してください。",
      runExtract: "公式ページをキャプチャ",
      matchReasonLabel: "AI マッチ分析",
      sectionBasics: "基本情報",
      sectionLanguage: "語学要件",
      sectionApplication: "出願情報",
      sectionFees: "費用",
      sectionDocuments: "提出書類",
      sectionScholarships: "奨学金",
      sectionCycles: "出願サイクル",
      sectionNotes: "備考",
      degree: "学位",
      language: "授業言語",
      intakeMonths: "入学月",
      graduateSchool: "研究科",
      department: "専攻",
      englishTest: "英語試験",
      englishMinScore: "最低点",
      englishNotes: "備考",
      japaneseRequired: "日本語要件",
      japaneseType: "試験タイプ",
      japaneseLevel: "最低レベル",
      documentsRequired: "必要書類",
      supervisorConsent: "事前同意必要",
      yes: "必要",
      no: "不要",
      examFee: "受験料",
      tuitionPerYear: "年間学費",
      quota: "募集人数",
      mextEligible: "MEXT 対象",
      scholarships: "奨学金",
      cycleApplicationOpen: "出願開始",
      cycleApplicationClose: "出願締切",
      cycleConsent: "同意書締切",
      cycleExam: "試験期間",
      cycleResult: "結果発表",
      cycleEnrollment: "入学日",
      applicationPeriods: "出願期間",
      requirementsList: "出願要件",
      contactEmail: "連絡先",
      deadline: "締切",
      confidence: "信頼度",
      unresolvedQuestions: "未確認事項",
      notSpecified: "未指定",
      colProgram: "プログラム",
      colUniversity: "大学",
      colDegree: "学位",
      colLanguage: "言語",
      colDeadline: "締切",
      colEnglish: "英語",
      colJapanese: "日本語",
      colDocs: "書類",
      colSupervisor: "同意",
      colTuition: "学費",
      colMext: "MEXT",
      openProgram: "プログラムを開く",
      openSource: "証拠を見る",
    },
    universitiesPage: {
      title: "大学情報マップ",
      description: "各志望校の情報カバレッジ状況 — 何が不足しているか、最近何がキャプチャされたか、次にどこを調べるべきか。",
      totalLabel: "志望校",
      resourcesLabel: "リソース総数",
      highGapsLabel: "高優先ギャップ",
      programsLabel: "プログラム",
      professorsLabel: "教授",
      labsLabel: "研究室",
      updatedLabel: "最終更新",
      neverUpdated: "リソースなし",
      sortLabel: "並び替え",
      sortName: "名前",
      sortUpdated: "最近更新",
      sortResources: "リソース多",
      sortGaps: "ギャップ多",
      filterPlaceholder: "大学名でフィルター…",
      noData: "志望校なし",
      noDataHelper: "まだ大学が追加されていません。ソースを追加するか、公式プログラムページをキャプチャすると、大学エントリが自動作成されます。",
      noDataAction1: "ソース追加",
      noDataAction2: "ページをキャプチャ",
      noResults: "一致する大学なし",
      openDetail: "詳細を見る",
      addSource: "ソース追加",
      capture: "キャプチャ",
      viewResources: "リソースを見る",
      viewGaps: "ギャップを見る",
      noGaps: "顕著なギャップなし",
      gapHigh: "高",
      gapMedium: "中",
      gapLow: "低",
    },
    papersPage: {
      title: "論文レーダー",
      description: "確認済み論文と候補論文を一元表示。論文を教授マッチの証拠として蓄積。",
      confirmedLabel: "確認済み",
      pendingLabel: "候補",
      thisWeekLabel: "今週",
      tabAll: "すべて",
      tabConfirmed: "確認済み論文",
      tabCandidates: "候補",
      filterPlaceholder: "タイトル / 著者 / キーワードでフィルター…",
      noResults: "一致する結果なし",
      noResultsHelper: "フィルターを調整してください。",
      noPapers: "確認済み論文なし",
      noPapersHelper: "レビューキューで候補を受け入れると、確認済み論文ライブラリに追加されます。",
      noCandidates: "論文候補なし",
      noCandidatesHelper: "arXiv 取り込みを実行するか、arXiv ソースを追加するか、論文 URL をキャプチャすると候補が表示されます。",
      runIngest: "arXiv 取り込みを実行",
      addArxivSource: "arXiv ソースを追加",
      capturePaper: "論文 URL をキャプチャ",
      goToReview: "レビューキューへ",
      candidateBadge: "候補",
      openUrl: "URL を開く",
      openReview: "レビューで開く",
      linkedTo: "関連",
      year: "年",
      venue: "掲載先",
      authors: "著者",
      keywords: "キーワード",
      abstract: "概要",
    },
  },
};
