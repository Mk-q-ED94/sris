# SRIS Blank Page Completion TODO

目标：把导航里仍处于占位状态的页面补齐，同时保持当前 Apple / Stripe 风的高密度情报控制台 UI。页面补齐不应把 SRIS 做成普通申请管理器，而要继续围绕“发现信息、沉淀证据、暴露信息缺口、辅助申请决策”这个主流程。

## Current Audit

- [ ] `#universities`：当前只有 `#/universities/:id` 院校详情页，院校列表入口仍会落到 `PlaceholderPage`。
- [ ] `#papers`：当前 Paper Radar / 已确认论文库入口仍会落到 `PlaceholderPage`。
- [ ] 保留现有已实现页面：`Dashboard`、`UniversityDetail`、`Professors`、`Labs`、`Programs`、`Review`、`Timeline`、`Sources`、`Conflicts`、`Capture`、`ResourceDetail`。
- [ ] 完成后移除主导航中可见页面对 `PlaceholderPage` 的依赖，只保留未知路由兜底。

## P0 — Universities / 院校情报地图

目标：院校列表页不是普通学校名录，而是“目标院校信息差地图”。用户进入后应立刻知道每个学校掌握了多少证据、缺什么、下一步该查什么。

- [ ] 新增 `apps/web/src/pages/Universities.tsx`。
- [ ] 在 `apps/web/src/App.tsx` 中把 `route.page === "universities"` 且没有 `universityId` 的情况指向新页面。
- [ ] 页面顶部展示院校总览指标：目标院校数、总资源数、高优先级缺口数、长期未检查来源数、最近更新时间。
- [ ] 主体使用高密度列表或雷达卡，不使用营销式大卡片。
- [ ] 每个院校展示：资源数、缺口数、项目数、教授数、实验室数、最近更新、最高优先级缺口、source 覆盖状态。
- [ ] 支持筛选：地区/国家、缺口优先级、source 状态、资料完整度、关键词。
- [ ] 支持排序：最近更新、缺口最多、资源最多、deadline 最近。
- [ ] 支持快捷动作：打开详情页、添加 source、打开 capture、查看相关资源、查看 open gaps。
- [ ] 空状态应引导用户添加第一个 source 或 capture 官方项目页，而不是只显示“暂无数据”。

验收标准：

- [ ] 点击侧边栏“Universities”不再进入占位页。
- [ ] 点击任一院校可以进入现有 `UniversityDetail`。
- [ ] 即使数据库为空，也能看到清晰的下一步动作。
- [ ] 页面视觉与当前 Dashboard 保持一致，不改变顶部轮播组件。

## P0 — Papers / Paper Radar

目标：论文页应服务“研究方向与导师匹配证据”，不是单纯论文收藏夹。它要把已确认论文、待 review 论文候选、关键词命中和关联实体放在同一个雷达视图里。

- [ ] 新增 `apps/web/src/pages/Papers.tsx`。
- [ ] 在 `apps/web/src/App.tsx` 中把 `route.page === "papers"` 指向新页面。
- [ ] 页面顶部展示雷达指标：已确认论文数、待确认论文候选数、本周新增、top keywords、最近 arXiv ingest 时间。
- [ ] 主体提供论文表格：标题、作者、年份、来源/venue、关键词、关联教授/实验室/院校、状态、AI 占位状态。
- [ ] 增加筛选：年份、来源、关键词、状态、关联院校、关联教授。
- [ ] 支持论文与资源体系打通：可以打开 URL、打开资源详情、进入 Review Queue、关联教授/实验室。
- [ ] 待确认论文候选不应混成正式论文，UI 上要明显区分 `pending candidate` 和 `accepted paper/resource`。
- [ ] 空状态应引导用户运行 arXiv ingest、添加 arXiv source、或用 Capture 保存论文链接。

验收标准：

- [ ] 点击侧边栏“Paper Radar”不再进入占位页。
- [ ] 页面能同时解释“已确认论文”和“待确认论文候选”的关系。
- [ ] 论文能作为教授/实验室匹配证据，而不是孤立列表。
- [ ] 没有数据时仍能引导下一步采集动作。

## P1 — Existing Page Empty-State Upgrade

目标：已实现页面在空数据时不应显得像空壳，而要转化成“下一步情报采集指令”。

- [ ] `Professors` 空状态：提示从教授主页、实验室页、Google Scholar、论文候选中建立教授档案。
- [ ] `Labs` 空状态：提示从实验室主页和教授详情页补方向、近期论文、source。
- [ ] `Programs` 空状态：提示优先 capture 官方项目页、招生要求页、deadline 页面。
- [ ] `Sources` 空状态：提示先建立院校官网、项目页、教授主页、arXiv RSS 四类高价值 source。
- [ ] `Review` 空状态：提示使用 quick capture、source patrol、arXiv ingest 产生候选资源。
- [ ] `Conflicts` 空状态：提示冲突页是证据不一致时使用的质量控制台。

验收标准：

- [ ] 所有主页面在 0 数据时都能告诉用户“下一步该搜什么”。
- [ ] 空状态文案保持工具化，不做 landing page 介绍。

## P1 — Shared Data And API Work

目标：用已有 API 优先实现页面，必要时补轻量聚合接口，避免前端堆复杂计算。

- [ ] 复用 `fetchUniversities`、`fetchPrograms`、`fetchProfessors`、`fetchLabs`、`fetchRadarSources`、`fetchReviewCandidates`。
- [ ] 如前端聚合过重，新增 `/api/universities/summary` 返回院校级统计。
- [ ] 如现有 paper API 不足，新增 `/api/papers` 或 `/api/papers/radar` 返回已确认论文和候选概览。
- [ ] 为 dev fallback mock 数据补齐院校列表和论文雷达场景。
- [ ] 补 i18n keys：页面标题、筛选器、空状态、状态徽标、快捷动作。

验收标准：

- [ ] 前端页面不直接依赖硬编码业务数字。
- [ ] dev 模式 API 不通时仍能展示可验收的 mock UI。
- [ ] Worker typecheck 不出现新增类型缺口。

## P1 — Routing Cleanup

- [ ] `PlaceholderPage` 只用于未知或未来页面兜底。
- [ ] `VALID_PAGES` 中的每个主导航页面都有真实组件。
- [ ] URL hash 规范保持不变：`#universities`、`#universities/:id`、`#papers`。
- [ ] 全局搜索命中院校时继续打开详情页，命中资源时继续打开资源详情页。

## Suggested Build Order

1. 实现 `Universities.tsx` 静态 UI + mock/dev 数据聚合。
2. 接入真实 `fetchUniversities` 等 API，并完成 `App.tsx` 路由替换。
3. 实现 `Papers.tsx` 静态 UI + mock/dev 数据。
4. 接入论文、候选、资源相关 API，并完成 `App.tsx` 路由替换。
5. 升级各已实现页面的空状态。
6. 补 i18n 文案与类型。
7. 运行 `npm run check`，再做浏览器视觉检查。

## Test Plan

- [ ] `npm run check` 通过。
- [ ] 浏览器打开 `#universities`，确认不再空白或占位。
- [ ] 浏览器打开 `#papers`，确认不再空白或占位。
- [ ] 从 `#universities` 点击院校能进入详情页。
- [ ] 从 `#papers` 点击 review / resource / URL 动作能到正确位置。
- [ ] 空数据库或 mock 数据为空时，每个页面都有明确下一步动作。
