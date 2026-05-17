# SRIS Information Gap TODO

SRIS 的核心定位：不是普通申请管理工具，而是一个用来打破 SGU / AI 修士申请信息差的私人情报资源库。申请决策、timeline、任务管理都应服务于"发现信息、判断可信度、沉淀证据、暴露缺口"这个主流程。

> **Status (2026-05-17):** 所有 P0/P1/P2 模块及 Later AI 增强已全部落地。文档保留作为产品参考，新需求请追加到文末的「后续探索」区。

## Product North Star

- 打开系统后，能立刻知道最近捕获了什么新情报。
- 每条资源都能回答：来源是什么、可信度如何、和哪个学校/教授/项目相关、为什么值得保存、它会影响什么决策。
- 每个目标院校都能显示信息缺口：还缺项目 deadline、教授主页、实验室方向、论文证据、申请材料要求、经验帖或官方公告。
- Review Queue 是所有情报进入正式库前的中枢，而不只是论文候选队列。

## P0 — 通用 Intelligence Queue ✅

目标：把 Review Queue 从 paper-only 扩展成所有资源的待处理队列。

- [x] 新增通用情报候选数据模型 `intelligence_candidates`。
- [x] 支持资源类型：`official_page`、`program_page`、`professor_page`、`lab_page`、`admission_notice`、`paper`、`experience_post`、`video`、`other`。
- [x] 每条候选资源包含：标题、URL、来源类型、目标院校、关联项目、关联教授、捕获时间、原始摘录、状态。
- [x] 增加人工字段：`relevance_note`、`decision_impact`、`confidence`、`evidence_type`。
- [x] Review 页面支持筛选：资源类型、目标院校、可信度、处理状态、捕获来源。
- [x] Review 页面支持动作：接受入库、忽略、标记稍后处理、关联到院校/项目/教授。
- [x] 保留现有 paper candidate 流程，但让论文成为通用队列的一种资源类型。

## P0 — Capture 自动分类强化 ✅

目标：让"一键保存网页"成为主要输入方式。

- [x] 优化 quick capture：根据 URL、页面标题、用户备注自动推测资源类型。
- [x] 增加捕获表单中的手动修正字段：资源类型、目标院校、关联对象、重要性。
- [x] Capture 页面展示分类预览：系统为什么判断它是 program/lab/professor/paper（含 reason 文案）。
- [x] 支持保存选中文本作为 evidence excerpt。
- [x] 支持从 URL 自动提取域名来源，如 university official site、arXiv、Google Scholar、YouTube、论坛。

## P1 — Source Hub / 信息源中心 ✅

目标：固定并管理"信息差来自哪里"。

- [x] 新增 `radar_sources` 表 + Source Hub 页面。
- [x] 信息源字段：名称、URL、类型、目标院校、可信度、检查频率、最近检查时间、启用状态。
- [x] 来源类型包括：院校官网、项目页、教授主页、实验室页、招生公告、arXiv RSS、Scholar、论坛/经验帖、YouTube/说明会。
- [x] Sources 页面支持按院校、类型、可信度筛选。
- [x] Dashboard 显示来源覆盖度和长期未检查来源。

## P1 — 信息缺口地图 ✅

目标：每个目标院校都有一张"还缺什么"的地图。

- [x] 为大学详情页新增 Information Gap 区块。
- [x] 缺口类型：项目 deadline 缺失（`no_deadline_for`）、申请材料缺失（`no_materials_for`）、教授/实验室缺失（`no_professors_for`）、实验室方向缺失（`no_lab_direction_for`）、资源过少（`few_resources_for`）、经验帖缺失（`no_experience_for`）、招生公告缺失（`no_admission_for`）、项目缺失（`no_programs_for`）。
- [x] 每个缺口有优先级：high / medium / low。
- [x] 每个缺口可以跳转到对应的 Capture 入口（带 prefill）。
- [x] Dashboard 汇总所有目标院校的高优先级缺口。

## P1 — Resource Library / 正式资源库 ✅

目标：把确认过的资源从"收藏链接"变成可复用证据。

- [x] 新增正式资源表 `intelligence_resources`。
- [x] 支持资源关联到 university/program/professor/lab/paper/task。
- [x] 每条资源展示：标题、来源、类型、可信度、关联对象、decision impact、备注、创建时间。
- [x] 在院校、教授、项目详情页展示相关资源。
- [x] 支持按资源类型和关键词筛选。

## P1 — 资源正文抓取 / 内容保存 ✅

目标：避免 SRIS 变成只保存 URL 的收藏夹。

- [x] 为候选资源和正式资源增加正文/摘录字段：`content_text`、`excerpt`、`raw_snapshot`、`snapshot_at`。
- [x] Quick Capture 支持保存用户选中文本作为 `excerpt`。
- [x] 后端支持对 URL 做轻量抓取：标题、meta description、纯文本正文、HTTP 状态、最终跳转 URL。
- [x] 保存原始来源信息：domain、canonical URL、content hash、抓取时间。
- [x] Resource Detail 中展示正文摘录、保存时间、原始 URL 和快照状态。
- [x] 对抓取失败的资源保留手动摘录入口。

## P1 — Resource Detail / 资源详情页 ✅

目标：每条资源都成为独立证据对象，而不是列表中的一行。

- [x] 资源详情路由：`#/resources/:id`。
- [x] 详情页展示：标题、URL、资源类型、来源、可信度、关联院校/项目/教授/实验室、decision impact、relevance note、正文摘录、AI 抽取事实。
- [x] 详情页支持编辑资源元数据：类型、confidence、关联对象、relevance note、decision impact。
- [x] 支持从详情页跳回关联实体：University Detail、Program、Professor、Lab。
- [x] 支持把资源标记为：`unverified` / `verified` / `stale` / `core_evidence`（冲突由独立的 conflicts 系统处理）。
- [x] 资源详情页保留"重新抓取 / 更新快照"入口。

## P1 — 信息缺口行动闭环 ✅

目标：Gap 不只是提醒，而是能直接引导下一步补资料。

- [x] 每个 gap 提供明确 action：添加 source、打开 capture、关联已有资源、标记已解决。
- [x] Gap 支持状态：open、in_progress、resolved、ignored。
- [x] Gap 支持关联到具体 university。
- [x] Gap 支持 `gap_actions` 表记录解决证据。
- [x] Dashboard 只突出 open/high priority gaps。
- [x] University Detail 中展示 gap 的解决进度。

## P1 — 来源巡检机制 ✅

目标：让 Source Hub 不只是静态链接表，而是能提醒哪些来源需要重新检查。

- [x] 为 source 增加巡检状态：`never_checked`、`ok`、`changed`、`failed`、`stale`。
- [x] 记录最近检查结果：HTTP 状态、标题、content hash、`last_checked_at`、`last_changed_at`。
- [x] Source Hub 支持手动"检查一次"。
- [x] Cron 每日检查启用 source。
- [x] Dashboard 显示长期未检查 source 和失败 source。
- [x] 对高价值 source 设置更短检查频率（`check_frequency` 字段）。

## P1 — 可信度与冲突管理 ✅

目标：让系统能处理"不同来源说法不一致"的现实问题。

- [x] 资源支持可信度等级：official、high、medium、low、unverified。
- [x] 支持把两条或多条资源标记为 conflict。
- [x] Conflict 记录包含：冲突字段、冲突说明、优先采用哪条证据、解决状态。
- [x] UI 中对官方来源和未验证经验帖做明显区分（confidence badge）。
- [x] 搜索和详情页优先展示官方/高可信证据。
- [x] AI 自动跨资源冲突检测（`ai_field_conflict` 类型 + 独立 Conflicts 页面）。

## P2 — Dashboard 收束到情报主线 ✅

- [x] Dashboard 顶部突出今日情报：新增捕获、待处理、高优先级缺口、长期未检查 sources。
- [x] 院校卡片显示资源数、缺口数、最近更新。
- [x] 资源流支持混合展示：官网页、经验帖、论文、教授主页、项目页。
- [x] 申请辅助信号降级为只显示影响信息搜集优先级的 deadline。

## P2 — 搜索升级为证据搜索 ✅

- [x] 全局搜索覆盖 intelligence resources。
- [x] 搜索结果显示资源类型、可信度、关联对象（subtitle 解析）。
- [x] 支持按类型过滤搜索结果。
- [x] 支持按 resource 子类型 + confidence 二级过滤。

## Later — AI 增强 ✅

AI 增强信息处理效率，且不是核心流程前置依赖（全部 graceful degrade，无 LLM_API_KEY 时降级到规则后备）。

- [x] 自动摘要网页正文（`POST /api/resources/:id/summarize`，提取后自动触发）。
- [x] 自动抽取 deadline、申请材料、导师方向（admission_notice / professor_page / program_page / lab_page 四类 schema）。
- [x] 自动生成 professor/program 匹配理由（`/api/professors/:id/match` + `/api/programs/:id/match`，基于 `user_profile`）。
- [x] 自动给资源打 confidence 和 decision impact 初稿（`/api/resources/:id/suggest-meta`，含规则后备）。
- [x] 自动发现同一信息的多来源冲突（`detect-conflicts.ts` LLM 比对器，结果写入 conflicts 表）。

## 后续探索 / 非 TODO 待整理需求

当前 TODO 已完整覆盖产品定义。如有新方向（如桌面端浏览器扩展、批量 AI 处理预算控制、CSV/Notion 导出、与 Calendar/邮件深度集成等）请在此区追加。
