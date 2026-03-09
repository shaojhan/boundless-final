# CLAUDE.md — 後端架構規範（Domain-Driven Design）

> 此檔案會被 Claude Code 自動讀取。所有程式碼生成、重構、設計決策都應遵守本規範。

---

## 🏗️ 架構總覽

本專案採用 **領域驅動設計（DDD）** 搭配三層職責分離：

```
src/
├── domain/          # 領域模型（Entity、Value Object、領域規則）
├── service/         # 業務邏輯編排（Use Case、跨 Entity 操作）
├── repository/      # 資料存取介面與實作（Prisma）
└── interfaces/      # 介面層（Express Router、Middleware）
```

---

## 📐 各層規範

### 1. Domain `src/domain/`

**職責**：定義業務核心概念與規則，**不依賴任何框架、Prisma、Express**。

```
domain/
└── {context}/
    ├── {Entity}.ts          # 實體（有唯一 ID，封裝業務行為）
    ├── {ValueObject}.ts     # 值物件（不可變，用 equals() 比較）
    └── events/              # 領域事件（選用）
```

**規則**：
- Entity 用 class 封裝，包含業務方法（如 `order.place()`、`user.deactivate()`）
- Value Object 用 `readonly` + `equals()` 實作不可變性
- 不 import `@prisma/client`、`express`、任何 service / repository
- 業務驗證邏輯寫在 Entity 內，不寫在 Service 或 Router

**Entity 範例**：
```typescript
// src/domain/order/Order.ts
import { randomUUID } from 'crypto';
import { Money } from './Money';

export class Order {
  readonly id: string;
  readonly customerId: string;
  total: Money;
  status: 'pending' | 'placed' | 'cancelled';

  constructor(params: {
    id?: string;
    customerId: string;
    total: Money;
    status?: Order['status'];
  }) {
    this.id = params.id ?? randomUUID();
    this.customerId = params.customerId;
    this.total = params.total;
    this.status = params.status ?? 'pending';
  }

  place(): void {
    if (this.status !== 'pending') {
      throw new Error('只有 pending 狀態的訂單可以下單');
    }
    this.status = 'placed';
  }

  cancel(): void {
    if (this.status === 'cancelled') {
      throw new Error('訂單已取消');
    }
    this.status = 'cancelled';
  }
}
```

**Value Object 範例**：
```typescript
// src/domain/order/Money.ts
export class Money {
  constructor(
    readonly amount: number,
    readonly currency: string,
  ) {
    if (amount < 0) throw new Error('金額不可為負數');
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('幣別不一致');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

---

### 2. Repository `src/repository/`

**職責**：定義資料存取介面，並用 Prisma 實作，**是唯一允許使用 `@prisma/client` 的地方**。

```
repository/
└── {context}/
    ├── I{Name}Repository.ts      # 介面定義
    └── Prisma{Name}Repository.ts # Prisma 實作
```

**規則**：
- 介面（`IOrderRepository`）只定義方法簽名，不含 Prisma 型別
- 實作（`PrismaOrderRepository`）負責 Prisma Model ↔ Domain Entity 的轉換
- **不把 Prisma 回傳物件直接傳給 Service**，必須先轉換成 Domain Entity
- Service 只依賴介面，不直接 `import` Prisma 實作

**Repository 介面範例**：
```typescript
// src/repository/order/IOrderRepository.ts
import { Order } from '../../domain/order/Order';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  save(order: Order): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Prisma 實作範例**：
```typescript
// src/repository/order/PrismaOrderRepository.ts
import { PrismaClient } from '@prisma/client';
import { IOrderRepository } from './IOrderRepository';
import { Order } from '../../domain/order/Order';
import { Money } from '../../domain/order/Money';

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const raw = await this.prisma.order.findUnique({ where: { id } });
    if (!raw) return null;
    return new Order({
      id: raw.id,
      customerId: raw.customerId,
      total: new Money(raw.totalAmount, raw.totalCurrency),
      status: raw.status as Order['status'],
    });
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const rows = await this.prisma.order.findMany({ where: { customerId } });
    return rows.map(raw => new Order({
      id: raw.id,
      customerId: raw.customerId,
      total: new Money(raw.totalAmount, raw.totalCurrency),
      status: raw.status as Order['status'],
    }));
  }

  async save(order: Order): Promise<void> {
    const data = {
      customerId: order.customerId,
      totalAmount: order.total.amount,
      totalCurrency: order.total.currency,
      status: order.status,
    };
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: { id: order.id, ...data },
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }
}
```

---

### 3. Service `src/service/`

**職責**：編排 Domain Entity 與 Repository 完成業務流程，**不含 HTTP 細節，不直接用 Prisma**。

```
service/
└── {context}/
    └── {Name}Service.ts
```

**規則**：
- Service 透過建構子注入 Repository 介面（依賴反轉）
- 一個 Service 方法對應一個業務操作（Use Case）
- 不 import `express`、不處理 `req` / `res`
- 複雜的業務規則委派給 Domain Entity 方法執行

**Service 範例**：
```typescript
// src/service/order/OrderService.ts
import { IOrderRepository } from '../../repository/order/IOrderRepository';
import { Order } from '../../domain/order/Order';
import { Money } from '../../domain/order/Money';

export interface PlaceOrderInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
}

export class OrderService {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async placeOrder(input: PlaceOrderInput): Promise<Order> {
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = new Order({
      customerId: input.customerId,
      total: new Money(totalAmount, 'TWD'),
    });

    order.place(); // 業務規則在 Entity 內執行

    await this.orderRepo.save(order);
    return order;
  }

  async cancelOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('訂單不存在');

    order.cancel(); // 業務規則在 Entity 內執行

    await this.orderRepo.save(order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) throw new Error('訂單不存在');
    return order;
  }
}
```

---

### 4. Interfaces `src/interfaces/`

**職責**：接收 HTTP 請求，呼叫 Service，回傳 HTTP Response，**不含業務邏輯**。

```
interfaces/
├── routers/         # Express Router
├── middlewares/     # 錯誤處理、認證、驗證
└── schemas/         # Zod Request 驗證 Schema
```

**規則**：
- Router 只做：**驗證輸入 → 呼叫 Service → 回傳結果**
- 不在 Router 直接 `new Service()`，從 DI 容器取得實例
- 用 Zod 驗證 Request body
- 統一錯誤處理透過 Express error middleware

**Router 範例**：
```typescript
// src/interfaces/routers/orderRouter.ts
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { orderService } from '../../container';

export const orderRouter = Router();

const PlaceOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })),
});

orderRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = PlaceOrderSchema.parse(req.body);
    const order = await orderService.placeOrder(body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

orderRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    res.json(order);
  } catch (err) {
    next(err);
  }
});
```

```typescript
// src/interfaces/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  if (err.message.includes('不存在')) {
    return res.status(404).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## 💉 DI 容器 `src/container.ts`

手動組裝所有依賴，**這是唯一允許 `new PrismaClient()` 的地方**。

```typescript
// src/container.ts
import { PrismaClient } from '@prisma/client';
import { PrismaOrderRepository } from './repository/order/PrismaOrderRepository';
import { OrderService } from './service/order/OrderService';

const prisma = new PrismaClient();

export const orderRepository = new PrismaOrderRepository(prisma);
export const orderService = new OrderService(orderRepository);
```

---

## 🔗 依賴方向（強制）

```
interfaces → service → domain
                ↓
           repository (interface)
                ↑
        PrismaRepository (實作)
```

- **Domain**：不依賴任何層
- **Repository interface**：只依賴 Domain
- **Service**：依賴 Domain + Repository interface
- **Interfaces（Router）**：依賴 Service
- **PrismaRepository**：依賴 Domain + `@prisma/client`

> ❌ Router 不直接用 Prisma；Domain 不 import `@prisma/client`；Service 不 import Prisma 實作類別

---

## 🧪 測試規範（Vitest）

| 層級 | 測試類型 | 說明 |
|------|---------|------|
| Domain | 單元測試 | 純 TS，無任何 mock，速度最快 |
| Service | 單元測試 | mock Repository interface |
| Repository | 整合測試 | 需真實 DB（或 vitest + testcontainers） |
| Router | E2E 測試 | Supertest + 完整 app |

```
tests/
├── unit/
│   ├── domain/
│   └── service/
└── integration/
    └── repository/
```

**Domain 單元測試**：
```typescript
// tests/unit/domain/Order.test.ts
import { describe, it, expect } from 'vitest';
import { Order } from '../../../src/domain/order/Order';
import { Money } from '../../../src/domain/order/Money';

describe('Order', () => {
  const makeOrder = () => new Order({
    customerId: 'user-1',
    total: new Money(500, 'TWD'),
  });

  it('初始狀態應為 pending', () => {
    expect(makeOrder().status).toBe('pending');
  });

  it('place() 應將狀態改為 placed', () => {
    const order = makeOrder();
    order.place();
    expect(order.status).toBe('placed');
  });

  it('已下單的訂單不能再次 place()', () => {
    const order = makeOrder();
    order.place();
    expect(() => order.place()).toThrow('只有 pending 狀態的訂單可以下單');
  });
});
```

**Service 單元測試（mock Repository）**：
```typescript
// tests/unit/service/OrderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../../../src/service/order/OrderService';
import { IOrderRepository } from '../../../src/repository/order/IOrderRepository';

const mockRepo: IOrderRepository = {
  findById: vi.fn(),
  findByCustomerId: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

describe('OrderService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('placeOrder 應儲存訂單並回傳 placed 狀態', async () => {
    const service = new OrderService(mockRepo);
    const order = await service.placeOrder({
      customerId: 'user-1',
      items: [{ productId: 'prod-1', quantity: 2, price: 100 }],
    });

    expect(mockRepo.save).toHaveBeenCalledOnce();
    expect(order.status).toBe('placed');
    expect(order.total.amount).toBe(200);
  });

  it('cancelOrder 在訂單不存在時應拋出錯誤', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    const service = new OrderService(mockRepo);

    await expect(service.cancelOrder('not-exist')).rejects.toThrow('訂單不存在');
  });
});
```

---

## 🚀 新增功能標準流程

1. **Domain**：建立 Entity / Value Object，把業務規則寫進去
2. **Repository interface**：在 `src/repository/{context}/I{Name}Repository.ts` 定義方法
3. **Prisma Schema**：更新 `schema.prisma`，執行 `npx prisma migrate dev`
4. **Repository 實作**：在 `src/repository/{context}/Prisma{Name}Repository.ts` 實作
5. **Service**：在 `src/service/{context}/{Name}Service.ts` 編排業務流程
6. **DI 容器**：在 `src/container.ts` 組裝新的 Repository 和 Service
7. **Router**：在 `src/interfaces/routers/` 新增路由
8. **先寫 Domain + Service 單元測試**，再補整合測試

---

## ⚠️ 常見反模式（禁止）

- ❌ Service 直接 `import { PrismaClient } from '@prisma/client'`
- ❌ Router 直接呼叫 `prisma.order.findMany()`
- ❌ 把 Prisma 回傳物件直接傳給 Service（未轉換成 Domain Entity）
- ❌ 業務規則（如狀態檢查）寫在 Service 而非 Entity
- ❌ Domain Entity import 任何外部套件（框架、ORM）
- ❌ `new PrismaClient()` 出現在 `container.ts` 以外的地方

---

## 🛠️ 技術棧

- **語言**：TypeScript（strict mode）
- **Web Framework**：Express
- **ORM**：Prisma
- **驗證**：Zod
- **測試**：Vitest + Supertest
- **容器化**：Docker / Podman
- **DB**：MySQL

---

*最後更新：請在每次架構調整時同步更新此文件。*