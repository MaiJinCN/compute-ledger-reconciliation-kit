# 算力账本与任务对账开源套件

面向基于积分/算力的计算产品的中立任务、账本、用量对账工具包。

适合"用户用积分/点数付款，产品再调用外部计算服务"的软件。本工具帮助你把三本账对齐：

1. 产品自己的任务记录。
2. 产品自己的用户积分账本。
3. 外部计算服务返回的真实用量。

## 它解决什么问题

- 生成不绑定任何品牌和供应商的产品任务 ID。
- 用 `clientRequestId` 防止断网、重试、重复点击导致重复提交。
- 用 `ledgerEntryId` 记录每一笔扣费、退款、补扣或人工调整。
- 对比任务、账本、外部用量是否一致，发现不一致时报告但不自动改余额。
- 给 AI 编程助手提供一键复用指令。

## 核心原则

用户看到和客服查询的主 ID 应该是产品自己的 `taskId`。

外部计算服务返回的任务号只是执行方任务号，应该保存用于排查，但不要替代产品自己的任务 ID。

## 快速使用

```bash
git clone <仓库地址>
cd compute-ledger-reconciliation-kit
npm test
```

代码示例：

```js
import {
  createTaskId,
  createClientRequestId,
  createLedgerEntryId,
  reconcileTask
} from "compute-ledger-reconciliation-kit";

const taskId = createTaskId("AUD");
const clientRequestId = createClientRequestId();
const ledgerEntryId = createLedgerEntryId();

const result = reconcileTask({
  task: {
    taskId,
    projectId: "PRJ-20260611-120000-ABC123",
    taskType: "audio",
    status: "success",
    creditsConsumed: 30,
    gpuSeconds: 60
  },
  providerJobs: [
    {
      taskId,
      provider: "generic-cloud",
      providerTaskId: "provider-task-001",
      status: "success",
      gpuSeconds: 60,
      rawCost: 0.1
    }
  ],
  ledgerEntries: [
    {
      ledgerEntryId,
      taskId,
      entryType: "debit",
      creditsDelta: -30,
      balanceAfter: 970,
      gpuSeconds: 60,
      rawCost: 0.1
    }
  ]
});

console.log(result.level, result.message);
```

## Agent 一键集成

本工具附带了 [AGENTS.md](./AGENTS.md) —— 一份专门写给 AI 编程助手（Claude Code、Cursor、Copilot 等）的复用指令文件。

**使用方法**：将 AGENTS.md 中的提示词复制给你的 AI 编程工具，它会自动完成以下工作：

1. 添加 ID 生成辅助函数。
2. 创建任务表、执行端任务表、账本流水表。
3. 加上 `clientRequestId` 防重提交机制。
4. 接入只读对账引擎。
5. 运行测试（重复提交、账本缺失、重复扣费、执行端用量不匹配等场景）。

不需要手动通读全部源码 —— AI 助手仅凭 AGENTS.md 就能理解整个方案，大幅降低集成成本，同时保证不同项目之间实现的一致性。

## 数据模型

推荐的 ID 层级关系：

```text
projectId
└─ taskId
   ├─ clientRequestId
   ├─ providerTaskId
   └─ ledgerEntryId
```

通俗解释：

| ID | 归属方 | 用途 |
|---|---|---|
| `projectId` | 产品 | 一个用户项目下可以挂多个任务，像文件夹编号。 |
| `taskId` | 产品 | 一次具体任务的编号，真正用于客服查询和扣费对账。 |
| `clientRequestId` | 客户端 | 一次点击或提交的防重复编号，重试不会多扣费。 |
| `providerTaskId` | 外部服务商 | 外部执行服务返回的任务编号，用于排查。 |
| `ledgerEntryId` | 产品 | 一笔账本流水编号，不可修改。 |

## 文件结构

- `src/` — 核心代码（ID 生成、账本、用量换算、对账引擎）。
- `docs/database-schema.sql` — 参考 SQL 建表语句。
- `docs/integration-guide.md` — 集成检查清单。
- `examples/node-basic.mjs` — 最小使用示例。
- `AGENTS.md` — AI 编程助手一键复用指令。

## 安全默认行为

对账引擎只报告不一致，不自动扣费、不自动退款、不自动删除、不自动改余额。

余额变化应该由你的产品后台明确执行，并保留管理员审计记录。

## 许可证

MIT.
