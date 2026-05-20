# SRIS Auto Intelligence Pipeline TODO

目标：把 SRIS 从“可手动采集和整理的情报库”升级为“配置 source 后自动巡检、自动抓取、自动提取、自动整理、人工确认入库”的研究情报系统。

核心原则：不要把自动化结果直接污染正式库。所有自动发现的信息应先进入 Review Queue，并带上正文快照、抽取字段、可信度、关联对象建议和变化说明，由用户确认后入库。

## Product Definition

- 自动化范围不是“全网乱爬”，而是：所有进入 `radar_sources` / Source Hub 的目标信息源。
- 自动化流程必须保留人工确认环节：`source -> candidate -> enrichment -> review -> accepted resource/entity`。
- 官方来源优先级高于经验帖和论坛来源。
- 自动抽取失败不能阻塞候选生成；失败信息要进入运行日志和 UI。
- 无 `LLM_API_KEY` 时仍要运行规则后备：抓取、hash 变化检测、基础类型判断、基础可信度打分。

> **Status (2026-05-17):** 本地仓库已出现 P0 自动化流水线实现草稿：`Automation` 页面、`/api/automation/run`、`automation_runs` / `automation_run_items`、候选 enrichment、source 扩展字段与 cron unified runner 已落地。本文已按本地未提交代码更新进度；仍需运行完整检查并推送。

## Current Baseline

已存在能力：

- [x] `radar_sources` 数据源表。
- [x] arXiv ingest：`runIngest` / `/api/ingest/arxiv/run`。
- [x] Source patrol：`runPatrol` / `/api/patrol/run` / `/api/sources/:id/patrol`。
- [x] 网页抓取与快照：`content_text`、`raw_snapshot`、`snapshot_at`。
- [x] Review Queue 候选表：当前复用 `paper_candidates` 承载通用 intelligence candidates。
- [x] Resource Detail 手动抽取：`/api/resources/:id/extract`。
- [x] 批量资源抽取入口：`/api/resources/extract-all`。
- [x] AI summary、AI suggest meta、conflict detection、confidence refresh。
- [x] Cloudflare scheduled cron 已触发 ingest、patrol、conflict、confidence。

主要缺口：

- [x] 统一自动化入口已新增：`POST /api/automation/run`。
- [x] `automation_runs` / `automation_run_items` 运行记录已新增。
- [x] Patrol / arXiv / quick capture 产生的候选已可进入 enrichment 流程。
- [x] 候选资源已具备 enrichment 状态、正文抓取、类型推断、可信度、影响说明、大学关联建议。
- [ ] 候选资源还缺更完整的 AI summary、program/professor/lab 关联建议和 token usage 统计。
- [ ] Dashboard 缺少 Automation Health 模块；当前主要通过独立 Automation 页面和 Sources 页面观察。
- [ ] 缺少失败重试、频率控制、LLM token 用量记录。

## P0 — Unified Automation Run ✅

目标：新增一个统一入口，把现有自动任务串成一条可观察、可重试的流水线。

- [x] 新增 `automation_runs` 表。
- [x] 字段包括：`id`、`run_type`、`status`、`started_at`、`finished_at`、`triggered_by`、`sources_checked`、`candidates_created`、`candidates_enriched`、`resources_extracted`、`conflicts_detected`、`failed_count`、`llm_input_tokens`、`llm_output_tokens`、`error_summary`、`details_json`。
- [x] 新增 `automation_run_items` 表，记录每个 source/candidate/resource 的处理结果。
- [x] 新增后端入口：`POST /api/automation/run`。
- [x] 支持 query 参数：`scope=all|sources|candidates|resources|ai`、`force=1`、`dry_run=1`。
- [x] Cron 改为调用统一 runner，而不是在 `scheduled()` 中分散 `waitUntil` 多个任务。
- [x] 现有 ingest / patrol / confidence / conflict 等任务已被纳入统一 runner。
- [ ] `/api/resources/extract-all` 仍需明确是否执行真正的 resource extraction，而不只是 resources scope 的 conflict/confidence 步骤。

验收标准：

- [x] 手动调用 `/api/automation/run` 后能返回运行摘要。
- [x] Cron 运行后能在数据库看到一条 `automation_runs` 记录。
- [x] 子步骤失败不会让整条流水线完全中断，最终状态支持 `partial_success`。
- [x] 每次运行能记录 source / candidate / system 级 run items。
- [ ] AI 抽取失败和 token 使用量仍需更完整统计。

## P0 — Candidate Enrichment Pipeline ✅

目标：所有自动生成的候选都要自动补充可 review 的上下文，而不是只保存 URL。

- [x] 新增 `enrichment_status`、`enriched_at`、`enrichment_error` 字段到候选表。
- [x] 对新候选自动执行 URL 抓取，保存 `content_text`、`excerpt`、`raw_snapshot`、`snapshot_at`。
- [x] 根据 source type、URL、标题、正文自动推断 `resource_type`。
- [x] 自动生成 `relevance_note` 初稿。
- [x] 自动生成 `decision_impact` 初稿，LLM 不可用时走规则后备。
- [x] 自动生成 `confidence` 初稿。
- [x] 自动识别 `domain_source`；`canonicalizeUrl` helper 已存在。
- [x] 自动尝试关联 `university_id`。
- [x] 对重复 URL 做去重，避免重复候选堆积。
- [ ] 自动关联 `program_id`、`professor_id`、`lab_id`。
- [ ] 使用 canonical URL / content hash 做更强去重。
- [ ] 为 candidate enrichment 记录真实 LLM token usage。

验收标准：

- [x] Patrol、arXiv、quick capture 产生的新候选可带有正文摘录、可信度、来源说明和大学关联建议。
- [x] 同一 URL 重复出现时不会生成多条有效 pending 候选。
- [x] 无 LLM 配置时仍能生成规则后备字段。
- [ ] Review Queue 还需要更完整展示自动摘要和关联建议。

## P0 — Source Coverage Expansion ✅

目标：让 Source Hub 成为“所有自动情报输入”的控制台。

- [x] 明确定义 source types：`official`、`program_page`、`admission`、`professor_page`、`lab_page`、`forum`、`video`、`arxiv`、`scholar`、`conference`、`calendar`、`other`。
- [x] 为每类 source 定义默认 `resource_type`、`check_frequency`、priority、confidence。
- [x] Source 表增加 `last_candidate_created_at`、`last_error`、`consecutive_failures`、`last_run_id`。
- [x] 支持 source 级别启用/禁用 AI enrichment。
- [x] 支持 source 级别设置 priority：`critical`、`high`、`normal`、`low`。
- [x] Source Hub UI 已加入 priority / AI enrichment 控制，并展示失败字段基础信息。
- [ ] Source Hub 还需展示每个 source 的候选数、上次抽取结果和完整自动化历史入口。

验收标准：

- [x] 添加一个招生公告 source 后，系统能按频率巡检并在变化时生成 `admission_notice` 候选。
- [x] 添加一个教授主页 source 后，系统能生成 `professor_page` 候选。
- [x] 失败 source 能在 Source Hub 被一眼看出来。
- [ ] 教授主页变化后自动抽取研究方向仍需接入 resource/candidate extraction。

## P1 — Automatic Structured Extraction

目标：候选入库后自动抽取结构化字段，减少手动整理成本。

- [x] 接受候选为正式 resource 后，已触发 candidate enrichment。
- [ ] 接受候选为正式 resource 后，自动触发真正的 resource extraction。
- [ ] 支持直接对候选做预抽取，并在 Review Queue 中展示预览。
- [ ] `admission_notice` 抽取：deadline、申请窗口、语言要求、材料清单、推荐信、考试、学费、奖学金、名额、联系信息。
- [ ] `program_page` 抽取：项目名称、学位、语言、研究方向、要求、学费、奖学金、官网链接。
- [ ] `professor_page` 抽取：姓名、title、邮箱、研究方向、近期论文、招生意向、联系建议。
- [ ] `lab_page` 抽取：实验室名称、PI、研究方向、项目、近期论文、招生信息。
- [ ] `experience_post` 抽取：经验结论、年份、项目/院校、可信度、风险点、与官方信息是否冲突。
- [ ] `paper` 抽取：关键词、方法、任务、相关教授/实验室线索、是否值得追踪。

验收标准：

- [ ] 接受一条招生公告资源后，Requirements 页面能看到结构化字段。
- [ ] 接受一条教授主页资源后，教授档案能获得研究方向或待确认建议。
- [ ] 抽取失败时 Resource Detail 和 automation run 都能显示失败原因。

## P1 — Entity Update Suggestions

目标：自动提取不是只存在 resource 里，还要能转化成“建议更新实体”的待确认变更。

- [ ] 新增 `entity_update_suggestions` 表。
- [ ] 字段包括：`entity_type`、`entity_id`、`field_name`、`current_value`、`suggested_value`、`source_resource_id`、`confidence`、`status`、`created_at`。
- [ ] 支持建议更新 `program.deadline`、`program.requirements`、`program.tuition`。
- [ ] 支持建议更新 `professor.email`、`professor.research_keywords`、`professor.website`。
- [ ] 支持建议更新 `lab.research_keywords`、`lab.recent_papers`。
- [ ] UI 中提供 Accept / Ignore / Mark Conflict。
- [ ] 接受建议后写入正式实体，并保留 source evidence。

验收标准：

- [ ] 官方项目页抽取到新 deadline 时，不直接覆盖正式字段，而是生成可确认建议。
- [ ] 用户接受建议后，实体页、Requirements 页、Dashboard 缺口状态同步更新。
- [ ] 如果建议值与现有值冲突，能进入 Conflicts 系统。

## P1 — Automation Health UI

目标：用户打开 SRIS 后能知道自动化是否健康、是否有新信息、哪里失败。

- [ ] Dashboard 新增 Automation Health 模块。
- [x] 新增独立 `Automation` 页面，展示最近一次运行时间、运行状态、新增候选数、失败数、运行历史。
- [ ] 展示抽取成功率、未处理候选数和失败 source Top 5。
- [ ] 展示最近新增官方信息、最近新增论文信号、最近结构化抽取结果。
- [ ] Sources 页面新增每个 source 的自动化历史入口。
- [x] Automation 页面增加 Run automation now 按钮，并支持 scope / dry run。

验收标准：

- [ ] Dashboard 能回答“自动化最近有没有正常跑”。
- [ ] Source Hub 能回答“哪个 source 最近失败了，为什么失败”。
- [x] 用户可以手动触发一次完整自动化并看到结果。

## P1 — Review Queue Upgrade For Auto Results

目标：Review Queue 成为自动情报进入正式库前的中枢，而不是只显示标题列表。

- [x] 候选卡片展示 enrichment status，并支持失败后手动 re-enrich。
- [x] 候选卡片可展示 decision impact、confidence、正文摘录等自动补充信息。
- [ ] 候选卡片还需更清晰展示自动摘要、变化说明和完整关联建议。
- [ ] 支持批量接受低风险官方资源。
- [ ] 支持批量忽略低可信经验帖或重复候选。
- [ ] 支持“接受为 resource + 创建实体更新建议”。
- [ ] 支持“接受为 resource + 立即抽取结构化字段”。

验收标准：

- [ ] 每条自动候选都能解释“为什么值得看”。
- [ ] 用户无需打开原网页也能初步判断是否入库。
- [ ] 接受后的资源进入 Resource Detail，并携带自动 enrichment 结果。

## P2 — Scheduling, Budget, And Safety

目标：自动化要稳定、可控、不会超预算。

- [ ] 为 LLM 调用增加每日 token 预算。
- [ ] 为 source 增加最大抓取频率限制。
- [ ] 为 automation run 增加并发限制，避免重复 cron 重叠。
- [ ] 增加 retry 策略：网络失败重试，LLM schema 失败不无限重试。
- [ ] 增加 `dry_run` 模式，预估会处理多少 source / candidate / resource。
- [ ] 大批量抽取时限制每次最多处理 N 条，剩余下次继续。
- [ ] 对 robots / HTTP 403 / 大文件 / 非 HTML 内容做明确失败状态。

验收标准：

- [ ] 自动化不会因为一个失败 source 中断。
- [ ] 自动化不会一次性处理过多资源导致超时或成本失控。
- [ ] 用户能看到 token 使用量和失败原因。

## P2 — Notification And Digest

目标：自动化跑完后，不只是把数据塞进库，还要给用户一个可读摘要。

- [ ] 生成 daily digest：新增候选、重要变化、失败 source、需要 review 的高优先级情报。
- [ ] Dashboard 展示 latest digest。
- [ ] 支持导出 digest 为 Markdown。
- [ ] 后续可接入邮件、Slack、Calendar 或浏览器通知。

验收标准：

- [ ] 每天打开 SRIS 可以看到“昨天自动发现了什么”。
- [ ] Digest 中的每条信息都能跳转到 Review Queue 或 Resource Detail。

## Suggested Build Order

1. [x] 新增 `automation_runs` / `automation_run_items` schema。
2. [x] 实现 `/api/automation/run`，先串联现有 `runIngest`、`runPatrol`、`runConflictDetection`、`runConfidenceUpdate`。
3. [x] Cron 改为调用 unified automation runner。
4. [x] 新增候选 enrichment 子步骤：抓正文、meta 建议、大学关联建议、URL 去重。
5. [x] Review Queue 展示自动 enrichment 状态和 re-enrich 操作。
6. [ ] 接受候选后自动触发真正的 resource extraction。
7. [ ] 新增 `entity_update_suggestions`，把抽取结果转成待确认实体更新。
8. [ ] Dashboard / Sources 增加更完整 Automation Health。
9. [ ] 增加预算、重试、并发锁和 digest。

## Test Plan

- [ ] Worker test：`/api/automation/run` 无 token 拒绝，有 token 成功。
- [ ] Worker test：cron 能创建 `automation_runs` 记录。
- [ ] Worker test：source changed 时生成候选并写入 run item。
- [ ] Worker test：重复 URL 不生成重复 pending 候选。
- [ ] Worker test：enrichment 失败时 run 状态为 partial_success。
- [ ] Worker test：无 `LLM_API_KEY` 时规则后备可运行。
- [ ] Frontend test：Dashboard 显示 automation health。
- [ ] Frontend test：Sources 页面能显示 source 自动化历史。
- [ ] E2E smoke：添加 program_page source -> 手动运行 automation -> Review Queue 出现候选 -> 接受 -> Resource Detail 有抽取结果 -> Requirements 页面显示结构化字段。

## Definition Of Done

- [ ] 每个启用 source 都能按频率自动检查。
- [ ] 新信息会自动进入 Review Queue。
- [ ] 候选资源自动带有正文、摘要、可信度、影响说明和关联建议。
- [ ] 正式资源能自动触发结构化抽取。
- [ ] 实体字段更新必须经过建议确认，不自动覆盖。
- [ ] Dashboard 能显示自动化健康状态和最新情报摘要。
- [ ] 所有自动化运行都有可追踪日志。
