# SRIS Information Gap TODO

SRIS 的核心定位：不是普通申请管理工具，而是一个用来打破 SGU / AI 修士申请信息差的私人情报资源库。申请决策、timeline、任务管理都应服务于“发现信息、判断可信度、沉淀证据、暴露缺口”这个主流程。

## Product North Star

- 打开系统后，能立刻知道最近捕获了什么新情报。
- 每条资源都能回答：来源是什么、可信度如何、和哪个学校/教授/项目相关、为什么值得保存、它会影响什么决策。
- 每个目标院校都能显示信息缺口：还缺项目 deadline、教授主页、实验室方向、论文证据、申请材料要求、经验帖或官方公告。
- Review Queue 是所有情报进入正式库前的中枢，而不只是论文候选队列。

## P0 — 通用 Intelligence Queue

目标：把 Review Queue 从 paper-only 扩展成所有资源的待处理队列。

- [ ] 新增通用情报候选数据模型 `intelligence_candidates`。
- [ ] 支持资源类型：`official_page`、`program_page`、`professor_page`、`lab_page`、`admission_notice`、`paper`、`experience_post`、`video`、`other`。
- [ ] 每条候选资源包含：标题、URL、来源类型、目标院校、关联项目、关联教授、捕获时间、原始摘录、状态。
- [ ] 增加人工字段：`relevance_note`、`decision_impact`、`confidence`、`evidence_type`。
- [ ] Review 页面支持筛选：资源类型、目标院校、可信度、处理状态、捕获来源。
- [ ] Review 页面支持动作：接受入库、忽略、标记稍后处理、关联到院校/项目/教授。
- [ ] 保留现有 paper candidate 流程，但让论文成为通用队列的一种资源类型。

验收标准：

- 浏览器捕获、arXiv 候选、手动链接都能进入同一个 Intelligence Queue。
- 接受资源后，可以进入对应正式表或资源库记录。
- Dashboard 的“情报入口”数字来自通用队列，而不是只来自论文候选。

## P0 — Capture 自动分类强化

目标：让“一键保存网页”成为主要输入方式。

- [ ] 优化 quick capture：根据 URL、页面标题、用户备注自动推测资源类型。
- [ ] 增加捕获表单中的手动修正字段：资源类型、目标院校、关联对象、重要性。
- [ ] Capture 页面展示分类预览：系统为什么判断它是 program/lab/professor/paper。
- [ ] 支持保存选中文本作为 evidence excerpt。
- [ ] 支持从 URL 自动提取域名来源，如 university official site、arXiv、Google Scholar、YouTube、论坛。

验收标准：

- 保存一个教授主页后，Review Queue 能显示它是 `professor_page`。
- 保存一个招生项目页后，Review Queue 能显示它是 `program_page`。
- 保存一个经验帖后，Review Queue 不会被误认为论文。

## P1 — Source Hub / 信息源中心

目标：固定并管理“信息差来自哪里”。

- [ ] 新增 `radar_sources` 或扩展现有 sources 页面为 Source Hub。
- [ ] 信息源字段：名称、URL、类型、目标院校、可信度、检查频率、最近检查时间、启用状态。
- [ ] 来源类型包括：院校官网、项目页、教授主页、实验室页、招生公告、arXiv RSS、Scholar、论坛/经验帖、YouTube/说明会。
- [ ] Sources 页面支持按院校、类型、可信度筛选。
- [ ] Dashboard 显示来源覆盖度和长期未检查来源。

验收标准：

- 能看到每个目标院校有哪些信息源。
- 能看到哪些 source 很久没检查。
- 能从 Source Hub 手动触发一次 capture/review。

## P1 — 信息缺口地图

目标：每个目标院校都有一张“还缺什么”的地图。

- [ ] 为大学详情页新增 Information Gap 区块。
- [ ] 缺口类型：项目 deadline 缺失、申请材料缺失、教授主页缺失、实验室方向缺失、近三年论文不足、经验帖缺失、官方公告缺失。
- [ ] 每个缺口有优先级：high / medium / low。
- [ ] 每个缺口可以跳转到对应的 Source Hub 或 Capture 入口。
- [ ] Dashboard 汇总所有目标院校的高优先级缺口。

验收标准：

- 任意目标院校详情页能显示信息完整度。
- 高优先级缺口能指导下一步该搜什么。
- 缺口不是静态文案，而是基于数据库记录动态计算。

## P1 — Resource Library / 正式资源库

目标：把确认过的资源从“收藏链接”变成可复用证据。

- [ ] 新增正式资源表 `intelligence_resources`。
- [ ] 支持资源关联到 university/program/professor/lab/paper/task。
- [ ] 每条资源展示：标题、来源、类型、可信度、关联对象、decision impact、备注、创建时间。
- [ ] 在院校、教授、项目详情页展示相关资源。
- [ ] 支持按资源类型和关键词筛选。

验收标准：

- 接受后的经验帖、官网页、教授主页都能在对应实体详情页看到。
- 资源库能作为后续 SOP、套磁、项目筛选的证据来源。

## P2 — Dashboard 继续收束到情报主线

目标：总览页成为“今天该看哪些情报”的入口。

- [ ] Dashboard 顶部突出今日情报：新增捕获、待处理、高优先级缺口、长期未检查 sources。
- [ ] 院校轮播保留视觉入口，但卡片上增加轻量信息状态：资源数、缺口数、最近更新。
- [ ] 资源流支持混合展示：官网页、经验帖、论文、教授主页、项目页。
- [ ] 申请辅助信号继续降级，只显示会影响信息搜集优先级的 deadline。

验收标准：

- Dashboard 不再像任务管理器，而像情报控制台。
- 用户打开页面后能明确知道今天先处理哪些资源。

## P2 — 搜索升级为证据搜索

目标：搜索不只是找实体，而是找“能支持判断的证据”。

- [ ] 全局搜索覆盖 intelligence resources。
- [ ] 搜索结果显示资源类型、可信度、关联对象。
- [ ] 支持按院校/教授/项目过滤搜索结果。
- [ ] 支持只搜官方来源或只搜经验帖。

验收标准：

- 搜 “LLM systems Tokyo” 能看到教授、实验室、论文和相关资源。
- 搜某个学校时，能快速定位官方项目页和申请要求。

## Later — AI 增强但不作为 MVP 依赖

AI 应该增强信息处理效率，但不能成为核心流程的前置依赖。

- [ ] 自动摘要网页正文。
- [ ] 自动抽取 deadline、申请材料、导师方向。
- [ ] 自动生成 professor/program 匹配理由。
- [ ] 自动给资源打 confidence 和 decision impact 初稿。
- [ ] 自动发现同一信息的多来源冲突。

## Suggested Next Build Order

1. 通用 `intelligence_candidates` schema + API。
2. Review 页面改造成通用 Intelligence Queue。
3. quick capture 写入通用队列。
4. Dashboard 的 Intelligence Inbox 改读通用队列。
5. Source Hub 和 Information Gap Map。
6. 正式 Resource Library 与实体详情页联动。

