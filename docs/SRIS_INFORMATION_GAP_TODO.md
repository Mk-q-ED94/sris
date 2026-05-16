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

## P1 — 资源正文抓取 / 内容保存

目标：避免 SRIS 变成只保存 URL 的收藏夹。关键网页、公告、经验帖和教授主页必须能保存正文快照和证据摘录，防止来源失效或网页改版后证据丢失。

- [ ] 为候选资源和正式资源增加正文/摘录字段：`content_text`、`excerpt`、`raw_snapshot`、`snapshot_at`。
- [ ] Quick Capture 支持保存用户选中文本作为 `excerpt`。
- [ ] 后端支持对 URL 做轻量抓取：标题、meta description、纯文本正文、HTTP 状态、最终跳转 URL。
- [ ] 保存原始来源信息：domain、canonical URL、content hash、抓取时间。
- [ ] Resource Detail 中展示正文摘录、保存时间、原始 URL 和快照状态。
- [ ] 对抓取失败的资源保留手动摘录入口。

验收标准：

- 保存一个项目页面后，即使原网页失效，SRIS 中仍能看到关键申请要求摘录。
- 保存一个教授主页后，能看到研究方向相关正文片段。
- 每条资源能区分“仅 URL”“有摘录”“有完整正文快照”。

## P1 — Resource Detail / 资源详情页

目标：每条资源都成为独立证据对象，而不是列表中的一行。

- [ ] 新增资源详情路由：`#/resources/:id`。
- [ ] 详情页展示：标题、URL、资源类型、来源、可信度、关联院校/项目/教授/实验室、decision impact、relevance note、正文摘录、处理历史。
- [ ] 详情页支持编辑资源元数据：类型、confidence、关联对象、relevance note、decision impact。
- [ ] 支持从详情页跳回关联实体：University Detail、Program、Professor、Lab。
- [ ] 支持把资源标记为：待验证、已验证、过期、冲突、核心证据。
- [ ] 资源详情页保留“重新抓取 / 更新快照”入口。

验收标准：

- 从 Dashboard 资源流、Review Queue、University Detail 都能打开同一个资源详情页。
- 一条资源能清楚说明它为什么重要，以及它支撑哪个申请判断。
- 修改资源详情后，关联实体页和搜索结果同步更新。

## P1 — 信息缺口行动闭环

目标：Gap 不只是提醒，而是能直接引导下一步补资料。

- [ ] 每个 gap 提供明确 action：添加 source、打开 capture、生成搜索关键词、关联已有资源、标记已解决。
- [ ] Gap 支持状态：open、in_progress、resolved、ignored。
- [ ] Gap 支持关联到具体 university/program/professor/lab。
- [ ] Gap 支持记录解决证据：用哪条 resource 关闭了这个 gap。
- [ ] Dashboard 只突出 open/high priority gaps。
- [ ] University Detail 中展示 gap 的解决进度。

验收标准：

- 点击“教授主页缺失”可以直接进入 Capture 或 Source Hub 添加来源。
- 当关联了一条教授主页 resource 后，对应 gap 可以被标记解决。
- Dashboard 不再反复提示已解决的缺口。

## P1 — 来源巡检机制

目标：让 Source Hub 不只是静态链接表，而是能提醒哪些来源需要重新检查、哪些来源可能有更新。

- [ ] 为 source 增加巡检状态：never_checked、ok、changed、failed、stale。
- [ ] 记录最近检查结果：HTTP 状态、标题、content hash、last_checked_at、last_changed_at。
- [ ] Source Hub 支持手动“检查一次”。
- [ ] Cron 每日/每周检查启用 source，并把变化写入 Intelligence Queue。
- [ ] Dashboard 显示长期未检查 source 和失败 source。
- [ ] 对招生公告、项目页、教授主页等高价值 source 设置更短检查频率。

验收标准：

- 某个项目页内容发生变化时，系统能生成待确认候选。
- Source Hub 能看到哪些来源失败、哪些长期没检查。
- 用户能从 stale source 直接进入 review/capture 流程。

## P1 — 可信度与冲突管理

目标：让系统能处理“不同来源说法不一致”的现实问题，避免把经验帖、旧网页、官网公告混在一起。

- [ ] 资源支持可信度等级：official、high、medium、low、unverified。
- [ ] 支持 evidence type：official_requirement、deadline、professor_interest、lab_direction、experience_claim、paper_signal、contact_info。
- [ ] 支持把两条或多条资源标记为 conflict。
- [ ] Conflict 记录包含：冲突字段、冲突说明、优先采用哪条证据、解决状态。
- [ ] UI 中对官方来源和未验证经验帖做明显区分。
- [ ] 搜索和详情页优先展示官方/高可信证据。

验收标准：

- 当官网 deadline 和经验帖 deadline 不一致时，可以标记冲突。
- 资源详情页能看到“这条信息是否已验证”和“是否与其他资源冲突”。
- Dashboard 能提醒未解决的高影响冲突。

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
7. 资源正文抓取 / 内容保存。
8. Resource Detail 资源详情页。
9. 信息缺口行动闭环。
10. 来源巡检机制。
11. 可信度与冲突管理。
