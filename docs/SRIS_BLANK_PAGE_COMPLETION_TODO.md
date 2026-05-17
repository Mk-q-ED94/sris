# SRIS Blank Page Completion TODO

目标：把导航里仍处于占位状态的页面补齐，同时保持当前 Apple / Stripe 风的高密度情报控制台 UI。页面补齐不应把 SRIS 做成普通申请管理器，而要继续围绕“发现信息、沉淀证据、暴露信息缺口、辅助申请决策”这个主流程。

> **Status (2026-05-17):** P0 空白页面补齐已完成。`#universities` 和 `#papers` 已接入真实页面；当前 TODO 仅保留剩余增强项与验收记录。

## Current Audit

- [x] `#universities`：已新增院校列表页，不再落到 `PlaceholderPage`。
- [x] `#papers`：已新增 Paper Radar 页面，不再落到 `PlaceholderPage`。
- [x] 保留现有已实现页面：`Dashboard`、`UniversityDetail`、`Professors`、`Labs`、`Programs`、`Review`、`Timeline`、`Sources`、`Conflicts`、`Capture`、`ResourceDetail`。
- [x] 主导航中可见页面已都有真实组件；`PlaceholderPage` 仅作为未知路由兜底。

## P0 — Universities / 院校情报地图 ✅

目标：院校列表页不是普通学校名录，而是“目标院校信息差地图”。用户进入后应立刻知道每个学校掌握了多少证据、缺什么、下一步该查什么。

- [x] 新增 `apps/web/src/pages/Universities.tsx`。
- [x] 在 `apps/web/src/App.tsx` 中把 `route.page === "universities"` 且没有 `universityId` 的情况指向新页面。
- [x] 页面顶部展示院校总览指标：目标院校数、总资源数、高优先级缺口数。
- [x] 主体使用高密度列表，不使用营销式大卡片。
- [x] 每个院校展示：资源数、项目数、教授数、实验室数、最近更新、缺口状态。
- [x] 支持关键词筛选：院校名称、地区/位置。
- [x] 支持排序：名称、最近更新、资源最多、缺口最多。
- [x] 支持快捷动作：打开详情页、打开官网；空状态可跳转 Source Hub 或 Capture。
- [x] 空状态引导用户添加第一个 source 或 capture 官方项目页，而不是只显示“暂无数据”。

验收记录：

- [x] 点击侧边栏“Universities”不再进入占位页。
- [x] 点击任一院校可以进入现有 `UniversityDetail`。
- [x] 即使数据库为空，也能看到清晰的下一步动作。
- [x] 页面视觉与当前 Dashboard 保持一致，不改变顶部轮播组件。

## P0 — Papers / Paper Radar ✅

目标：论文页应服务“研究方向与导师匹配证据”，不是单纯论文收藏夹。它要把已确认论文、待 review 论文候选、关键词命中和关联实体放在同一个雷达视图里。

- [x] 新增 `apps/web/src/pages/Papers.tsx`。
- [x] 在 `apps/web/src/App.tsx` 中把 `route.page === "papers"` 指向新页面。
- [x] 页面顶部展示雷达指标：已确认论文数、待确认论文候选数、本周新增。
- [x] 主体展示已确认论文与候选论文：标题、作者、年份/venue、来源、关键词、候选状态。
- [x] 支持基础筛选：标题、作者、关键词、venue。
- [x] 支持论文与 Review Queue 打通：候选论文可跳转 Review Queue，论文/候选均可打开原始 URL。
- [x] 待确认论文候选与正式论文在 UI 上分区展示，并使用 `candidate` 状态徽标区分。
- [x] 空状态引导用户运行 arXiv ingest、添加 arXiv source，或用 Capture 保存论文链接。

验收记录：

- [x] 点击侧边栏“Paper Radar”不再进入占位页。
- [x] 页面能同时解释“已确认论文”和“待确认论文候选”的关系。
- [x] 论文已作为教授/实验室匹配证据的入口存在，后续仍需加强关联字段展示。
- [x] 没有数据时仍能引导下一步采集动作。

## P1 — Existing Page Empty-State Upgrade ✅

目标：已实现页面在空数据时不应显得像空壳，而要转化成“下一步情报采集指令”。

- [x] `Professors` 空状态：提示从教授主页、实验室页、Google Scholar、论文候选中建立教授档案。
- [x] `Labs` 空状态：提示从实验室主页和教授详情页补方向、近期论文、source。
- [x] `Programs` 空状态：提示优先 capture 官方项目页、招生要求页、deadline 页面。
- [x] `Sources` 空状态：提示先建立院校官网、项目页、教授主页、arXiv RSS 四类高价值 source。
- [x] `Review` 空状态：提示新的候选来自 arXiv / capture / source patrol。
- [x] `Conflicts` 空状态：提示冲突页是证据不一致时使用的质量控制台。

验收记录：

- [x] 所有主页面在 0 数据时都能告诉用户“下一步该搜什么”。
- [x] 空状态文案保持工具化，不做 landing page 介绍。

## P1 — Shared Data And API Work ✅

目标：用已有 API 优先实现页面，必要时补轻量聚合接口，避免前端堆复杂计算。

- [x] 复用 `fetchReviewCandidates`，并新增 `fetchUniversitySummary`、`fetchPapers`。
- [x] 新增 `/api/universities/summary` 返回院校级统计。
- [x] `/api/papers` 已通过通用表路由暴露已确认论文数据。
- [x] 为 dev fallback mock 数据补齐院校列表和论文雷达场景。
- [x] 补 i18n keys：页面标题、筛选器、空状态、状态徽标、快捷动作。

验收记录：

- [x] 前端页面不直接依赖硬编码业务数字。
- [x] dev 模式 API 不通时仍能展示可验收的 mock UI。
- [x] Worker typecheck 不出现新增类型缺口。

## P1 — Routing Cleanup ✅

- [x] `PlaceholderPage` 只用于未知或未来页面兜底。
- [x] `VALID_PAGES` 中的每个主导航页面都有真实组件。
- [x] URL hash 规范保持不变：`#universities`、`#universities/:id`、`#papers`。
- [x] 全局搜索命中院校时继续打开详情页，命中资源时继续打开资源详情页。

## Remaining Enhancements

这些不是“空白页补齐”的阻塞项，而是下一轮把页面从“可用”推进到“更像情报雷达”的增强项。

### Universities

- [ ] 增加高级筛选：缺口优先级、source 状态、资料完整度、国家/地区分组。
- [ ] 在列表中展示长期未检查 source 数、最近 source patrol 状态、最高优先级 gap 文案。
- [ ] 增加行内快捷动作：添加 source、打开 capture prefill、查看相关资源、查看 open gaps。
- [ ] 把 gap 计算从前端启发式迁移到后端汇总，避免页面逻辑和真实 gap 系统不一致。

### Papers

- [ ] 增加高级筛选：年份、来源、状态、关联院校、关联教授、关联实验室。
- [ ] 顶部补充 top keywords 和最近 arXiv ingest 时间。
- [ ] 在论文行展示关联教授/实验室/院校，以及 AI 摘要状态。
- [ ] 支持从论文行打开 Resource Detail，或把论文关联到教授/实验室。
- [ ] 增加手动触发 arXiv ingest 的入口，并显示运行结果。

### Verification

- [x] `npm run check` 已通过：Web build、Worker typecheck、Worker tests 25 passed。
- [ ] 浏览器视觉检查 `#universities` 桌面和移动视口。
- [ ] 浏览器视觉检查 `#papers` 桌面和移动视口。
- [ ] 部署后 smoke test：Cloudflare Worker 上打开两个页面并确认 API 正常。
