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
  };
  entityType: Record<"university" | "program" | "professor" | "lab" | "paper" | "candidate" | "task", string>;
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
    searchPlaceholder: "搜索院校 / 教授 / 实验室 / 论文 / 任务…",
    searchEmpty: "没有匹配结果",
    searchHint: "Ctrl/⌘ + K 唤起",
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
      professors: { title: "教授", description: "教授和研究方向视图会沿用新的 Apple/Stripe 组件系统。" },
      labs: { title: "实验室", description: "实验室、关键词和近期论文会在后续页面重构。" },
      programs: { title: "项目", description: "SGU 项目与 deadline 管理将接入同一套筛选交互。" },
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
    },
    entityType: { university: "院校", program: "项目", professor: "教授", lab: "实验室", paper: "论文", candidate: "候选", task: "任务" },
  },
  en: {
    htmlLang: "en",
    dateLocale: "en-US",
    metaTitle: "SRIS",
    brand: { name: "SRIS", subtitle: "Research Intelligence" },
    search: "Global search",
    searchPlaceholder: "Search universities / professors / labs / papers / tasks…",
    searchEmpty: "No matching results",
    searchHint: "Ctrl/⌘ + K to open",
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
      professors: { title: "Professors", description: "Professor and research-direction views will adopt the new component system." },
      labs: { title: "Labs", description: "Labs, keywords, and recent papers will be rebuilt in a later pass." },
      programs: { title: "Programs", description: "SGU programs and deadlines will share the same filtering interactions." },
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
    },
    entityType: { university: "University", program: "Program", professor: "Professor", lab: "Lab", paper: "Paper", candidate: "Candidate", task: "Task" },
  },
  ja: {
    htmlLang: "ja",
    dateLocale: "ja-JP",
    metaTitle: "SRIS",
    brand: { name: "SRIS", subtitle: "Research Intelligence" },
    search: "全文検索",
    searchPlaceholder: "大学 / 教授 / 研究室 / 論文 / タスクを検索…",
    searchEmpty: "一致する結果がありません",
    searchHint: "Ctrl/⌘ + K で開く",
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
      professors: { title: "教授", description: "教授・研究方向ビューは新しいコンポーネント体系を採用します。" },
      labs: { title: "研究室", description: "研究室・キーワード・最近の論文は後続パスで再構築します。" },
      programs: { title: "プログラム", description: "SGU プログラムと締切は同じフィルタ UI を共有します。" },
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
    },
    entityType: { university: "大学", program: "プログラム", professor: "教授", lab: "研究室", paper: "論文", candidate: "候補", task: "タスク" },
  },
};
