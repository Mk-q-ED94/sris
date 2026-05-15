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
  };
  entityType: Record<"university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task" | "resource", string>;
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
    nav: { dashboard: "总览", universities: "院校", professors: "教授", labs: "实验室", programs: "项目", papers: "论文雷达", review: "待确认", timeline: "时间线", sources: "数据源" },
    pages: {
      dashboard: { title: "总览", description: "Dashboard" },
      universities: { title: "院校", description: "目标院校数据库会在下一轮迁移到 React 表格视图。" },
      professors: { title: "教授", description: "目标院校的教授和导师信息，包括研究方向、联系方式和实验室关联。" },
      labs: { title: "实验室", description: "实验室和研究组信息，包括研究方向、近期论文和负责人。" },
      programs: { title: "项目", description: "SGU 英文项目、申请窗口、语言要求和学费信息。" },
      papers: { title: "论文雷达", description: "已确认论文库会改成高密度研究表格。" },
      review: { title: "待确认", description: "Review Queue 会保留接受/忽略流程,并升级成卡片队列。" },
      timeline: { title: "时间线", description: "TOEFL / JLPT / SOP / 推荐信 / 申请 DDL 的 Gantt 视图。" },
      sources: { title: "数据源", description: "arXiv RSS、iCal 订阅、浏览器抽取刷。" },
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
    },
    professors: {
      title: "教授与导师",
      description: "目标院校的教授和导师信息，包括研究方向、联系方式和实验室关联。",
      university: "所属院校",
      researchKeywords: "研究方向",
      email: "邮箱",
      website: "主页",
      noResults: "暂无教授信息",
      noResultsHelper: "通过数据源采集或手动添加教授后，这里会展示导师列表。",
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
      noResultsHelper: "添加实验室后，这里会展示研究组列表。",
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
      noResultsHelper: "添加 SGU 项目后，这里会展示项目列表和截止日期。",
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
    },
    entityType: { university: "院校", program: "项目", professor: "教授", lab: "实验室", paper: "论文", candidate: "候选", task: "任务", resource: "资源" },
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
    nav: { dashboard: "Dashboard", universities: "Universities", professors: "Professors", labs: "Labs", programs: "Programs", papers: "Paper radar", review: "Review", timeline: "Timeline", sources: "Sources" },
    pages: {
      dashboard: { title: "Dashboard", description: "Dashboard" },
      universities: { title: "Universities", description: "The target-university database moves to a React table view next." },
      professors: { title: "Professors", description: "Professors and advisors at target universities — research directions, contact info, and lab affiliations." },
      labs: { title: "Labs", description: "Research groups and labs — focus areas, recent papers, and directors." },
      programs: { title: "Programs", description: "SGU English programs — application windows, language requirements, and tuition." },
      papers: { title: "Paper radar", description: "The accepted-papers library will become a dense research table." },
      review: { title: "Review", description: "Review queue keeps accept/ignore but upgrades to a card layout." },
      timeline: { title: "Timeline", description: "Gantt view of TOEFL / JLPT / SOP / recommendation / application DDLs." },
      sources: { title: "Sources", description: "arXiv RSS, iCal subscription, browser quick-capture." },
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
    },
    professors: {
      title: "Professors & Advisors",
      description: "Professors and advisors at target universities — research directions, contact info, and lab affiliations.",
      university: "University",
      researchKeywords: "Research areas",
      email: "Email",
      website: "Website",
      noResults: "No professors yet",
      noResultsHelper: "Add professors via data sources or manual entry to see them listed here.",
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
      noResultsHelper: "Add labs to see research groups listed here.",
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
      noResultsHelper: "Add SGU programs to see deadlines and requirements here.",
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
    },
    entityType: { university: "University", program: "Program", professor: "Professor", lab: "Lab", paper: "Paper", candidate: "Candidate", task: "Task", resource: "Resource" },
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
    nav: { dashboard: "ダッシュボード", universities: "大学", professors: "教授", labs: "研究室", programs: "プログラム", papers: "論文レーダー", review: "レビュー", timeline: "タイムライン", sources: "ソース" },
    pages: {
      dashboard: { title: "ダッシュボード", description: "Dashboard" },
      universities: { title: "大学", description: "志望校データベースは次回 React テーブルに移行します。" },
      professors: { title: "教授", description: "志望校の教授・指導教員情報 — 研究方向・連絡先・研究室所属。" },
      labs: { title: "研究室", description: "研究グループ・研究室 — 重点領域・最近の論文・責任者。" },
      programs: { title: "プログラム", description: "SGU 英語プログラム — 出願窓口・言語要件・学費情報。" },
      papers: { title: "論文レーダー", description: "登録済み論文ライブラリは高密度の研究テーブルになります。" },
      review: { title: "レビュー", description: "レビュー待ちは accept/ignore のままカード形式に進化します。" },
      timeline: { title: "タイムライン", description: "TOEFL / JLPT / SOP / 推薦状 / 出願締切のガントビュー。" },
      sources: { title: "ソース", description: "arXiv RSS、iCal 購読、ブラウザクイックキャプチャ。" },
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
    },
    professors: {
      title: "教授・指導教員",
      description: "志望校の教授・指導教員情報 — 研究方向・連絡先・研究室所属。",
      university: "所属大学",
      researchKeywords: "研究分野",
      email: "メール",
      website: "ウェブサイト",
      noResults: "教授情報なし",
      noResultsHelper: "データソースまたは手動で教授を追加すると、ここに一覧が表示されます。",
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
      noResultsHelper: "研究室を追加すると、研究グループ一覧が表示されます。",
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
      noResultsHelper: "SGU プログラムを追加すると、締切と要件がここに表示されます。",
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
    },
    entityType: { university: "大学", program: "プログラム", professor: "教授", lab: "研究室", paper: "論文", candidate: "候補", task: "タスク", resource: "リソース" },
  },
};
