import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useAuth } from '@/hooks/user/use-auth'
import { authFetch } from '@/lib/api-client'
import { apiBaseUrl } from '@/configs'
import type { RootState } from '@/store'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminProduct {
  id: number
  puid: string | null
  name: string | null
  type: number | null
  price: number | null
  stock: number | null
  sales: number | null
  valid: number | null
}

interface AdminOrderItem {
  product_id: number
  product_name: string | null
  quantity: number
}

interface AdminOrder {
  id: number
  ouid: string
  user_id: string
  payment: number
  created_time: string
  items: AdminOrderItem[]
}

interface AdminStats {
  totalOrders: number
  totalRevenue: number
  productCount: number
}

interface InstrumentCategory {
  id: number
  name: string
}

interface LessonCategory {
  id: number
  name: string
}

interface CreateForm {
  name: string
  type: 1 | 2
  price: string
  stock: string
  instrument_category_id: string
  lesson_category_id: string
}

const EMPTY_FORM: CreateForm = {
  name: '',
  type: 1,
  price: '',
  stock: '0',
  instrument_category_id: '',
  lesson_category_id: '',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const { LoginUserData } = useAuth()
  const status = useSelector((state: RootState) => state.auth.status)

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [productTotal, setProductTotal] = useState(0)
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [editingStock, setEditingStock] = useState<Record<string, number>>({})
  const [savingPuid, setSavingPuid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [productPage, setProductPage] = useState(1)
  const PAGE_SIZE = 20

  // Create product modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [instrumentCategories, setInstrumentCategories] = useState<InstrumentCategory[]>([])
  const [lessonCategories, setLessonCategories] = useState<LessonCategory[]>([])

  // ── Guard ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    } else if (status === 'authenticated' && !LoginUserData.isAdmin) {
      router.replace('/')
    }
  }, [status, LoginUserData, router])

  // ── Fetch data ────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async (page: number) => {
    const res = await authFetch(`${apiBaseUrl}/admin/products?page=${page}&pageSize=${PAGE_SIZE}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.items ?? [])
      setProductTotal(data.total ?? 0)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated' || !LoginUserData.isAdmin) return

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, ordersRes] = await Promise.all([
          authFetch(`${apiBaseUrl}/admin/stats`),
          authFetch(`${apiBaseUrl}/admin/orders?page=1&pageSize=10`),
        ])
        if (statsRes.ok) {
          const d = await statsRes.json()
          setStats(d.data)
        }
        if (ordersRes.ok) {
          const d = await ordersRes.json()
          setOrders(d.items ?? [])
        }
        await fetchProducts(1)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [status, LoginUserData.isAdmin, fetchProducts])

  useEffect(() => {
    if (status !== 'authenticated' || !LoginUserData.isAdmin) return
    fetchProducts(productPage)
  }, [productPage, status, LoginUserData.isAdmin, fetchProducts])

  // ── Actions ───────────────────────────────────────────────────────────────

  // Fetch categories when modal opens
  useEffect(() => {
    if (!showCreateModal) return
    const fetchCategories = async () => {
      const [iRes, lRes] = await Promise.all([
        fetch(`${apiBaseUrl}/instrument/categories`),
        fetch(`${apiBaseUrl}/lesson/categories`),
      ])
      if (iRes.ok) {
        const d = await iRes.json()
        setInstrumentCategories(d.data ?? d ?? [])
      }
      if (lRes.ok) {
        const d = await lRes.json()
        setLessonCategories(d.data ?? d ?? [])
      }
    }
    fetchCategories()
  }, [showCreateModal])

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const body: Record<string, unknown> = {
        name: createForm.name.trim(),
        type: createForm.type,
        price: parseInt(createForm.price, 10),
      }
      if (createForm.type === 1) {
        body.stock = parseInt(createForm.stock, 10)
        if (createForm.instrument_category_id) {
          body.instrument_category_id = parseInt(createForm.instrument_category_id, 10)
        }
      } else {
        if (createForm.lesson_category_id) {
          body.lesson_category_id = parseInt(createForm.lesson_category_id, 10)
        }
      }

      const res = await authFetch(`${apiBaseUrl}/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const d = await res.json()
        setProducts((prev) => [d.data, ...prev])
        setProductTotal((t) => t + 1)
        setStats((s) => s ? { ...s, productCount: s.productCount + 1 } : s)
        setShowCreateModal(false)
        setCreateForm(EMPTY_FORM)
      } else {
        const d = await res.json()
        setCreateError(d.message ?? '新增失敗')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleStockChange = (puid: string, value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0) {
      setEditingStock((prev) => ({ ...prev, [puid]: num }))
    }
  }

  const handleStockSave = async (puid: string, currentStock: number | null) => {
    const stock = editingStock[puid] ?? currentStock ?? 0
    setSavingPuid(puid)
    try {
      const res = await authFetch(`${apiBaseUrl}/admin/products/${puid}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.puid === puid ? { ...p, stock } : p))
        )
        setEditingStock((prev) => {
          const next = { ...prev }
          delete next[puid]
          return next
        })
      }
    } finally {
      setSavingPuid(null)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (status === 'initializing') {
    return <div style={{ padding: 40, textAlign: 'center' }}>載入中...</div>
  }

  if (!LoginUserData.isAdmin) return null

  const totalPages = Math.ceil(productTotal / PAGE_SIZE)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>管理後台</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '8px 18px',
              background: '#124365',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            + 新增商品
          </button>
          <Link href="/" style={{ color: '#124365', textDecoration: 'none', fontSize: 14 }}>
            ← 返回首頁
          </Link>
        </div>
      </div>

      {/* Create product modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 10, padding: '28px 32px',
              width: 480, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>新增商品</h3>
            <form onSubmit={handleCreateSubmit}>
              <FormRow label="商品名稱">
                <input
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                  placeholder="請輸入商品名稱"
                />
              </FormRow>

              <FormRow label="商品類型">
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm((f) => ({ ...f, type: Number(e.target.value) as 1 | 2 }))}
                  style={inputStyle}
                >
                  <option value={1}>樂器</option>
                  <option value={2}>課程</option>
                </select>
              </FormRow>

              <FormRow label="售價 (NT$)">
                <input
                  required
                  type="number"
                  min={0}
                  value={createForm.price}
                  onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))}
                  style={inputStyle}
                  placeholder="0"
                />
              </FormRow>

              {createForm.type === 1 && (
                <>
                  <FormRow label="庫存數量">
                    <input
                      type="number"
                      min={0}
                      value={createForm.stock}
                      onChange={(e) => setCreateForm((f) => ({ ...f, stock: e.target.value }))}
                      style={inputStyle}
                    />
                  </FormRow>
                  <FormRow label="樂器分類">
                    <select
                      value={createForm.instrument_category_id}
                      onChange={(e) => setCreateForm((f) => ({ ...f, instrument_category_id: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="">（不指定）</option>
                      {instrumentCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </FormRow>
                </>
              )}

              {createForm.type === 2 && (
                <FormRow label="課程分類">
                  <select
                    value={createForm.lesson_category_id}
                    onChange={(e) => setCreateForm((f) => ({ ...f, lesson_category_id: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="">（不指定）</option>
                    {lessonCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </FormRow>
              )}

              {createError && (
                <p style={{ color: '#e53e3e', fontSize: 13, margin: '8px 0' }}>{createError}</p>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setCreateForm(EMPTY_FORM); setCreateError('') }}
                  style={{ padding: '8px 18px', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', background: '#fff', fontSize: 14 }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ padding: '8px 18px', background: '#124365', color: '#fff', border: 'none', borderRadius: 6, cursor: creating ? 'default' : 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                  {creating ? '新增中...' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          <StatCard label="總訂單數" value={stats.totalOrders.toLocaleString()} />
          <StatCard label="總營收" value={`NT$ ${stats.totalRevenue.toLocaleString()}`} />
          <StatCard label="上架商品" value={stats.productCount.toLocaleString()} />
        </div>
      )}

      {/* Products table */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          商品庫存管理
          <span style={{ fontSize: 13, fontWeight: 400, color: '#666', marginLeft: 8 }}>
            共 {productTotal} 件
          </span>
        </h2>
        {loading ? (
          <p>載入中...</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f0f5fa', textAlign: 'left' }}>
                    <Th>商品名稱</Th>
                    <Th>類型</Th>
                    <Th>售價</Th>
                    <Th>銷售量</Th>
                    <Th>庫存</Th>
                    <Th>調整庫存</Th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const puid = p.puid ?? String(p.id)
                    const stockVal = editingStock[puid] ?? p.stock ?? 0
                    const isDirty = puid in editingStock
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                        <Td>{p.name ?? '(無名稱)'}</Td>
                        <Td>{p.type === 2 ? '課程' : '樂器'}</Td>
                        <Td>{p.price != null ? `NT$ ${p.price.toLocaleString()}` : '-'}</Td>
                        <Td>{p.sales ?? 0}</Td>
                        <Td>
                          <span style={{ color: (p.stock ?? 0) <= 0 ? '#e53e3e' : 'inherit' }}>
                            {p.type === 2 ? '∞' : (p.stock ?? 0)}
                          </span>
                        </Td>
                        <Td>
                          {p.type === 1 ? (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <input
                                type="number"
                                min={0}
                                value={stockVal}
                                onChange={(e) => handleStockChange(puid, e.target.value)}
                                style={{
                                  width: 80,
                                  padding: '4px 8px',
                                  border: '1px solid #ccc',
                                  borderRadius: 4,
                                  fontSize: 13,
                                }}
                              />
                              <button
                                onClick={() => handleStockSave(puid, p.stock)}
                                disabled={savingPuid === puid || !isDirty}
                                style={{
                                  padding: '4px 12px',
                                  background: isDirty ? '#124365' : '#ccc',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: 4,
                                  cursor: isDirty ? 'pointer' : 'default',
                                  fontSize: 13,
                                }}
                              >
                                {savingPuid === puid ? '儲存中...' : '儲存'}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontSize: 13 }}>不適用</span>
                          )}
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                <button
                  onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                  disabled={productPage <= 1}
                  style={paginBtnStyle}
                >
                  上一頁
                </button>
                <span style={{ lineHeight: '32px', fontSize: 13 }}>
                  {productPage} / {totalPages}
                </span>
                <button
                  onClick={() => setProductPage((p) => Math.min(totalPages, p + 1))}
                  disabled={productPage >= totalPages}
                  style={paginBtnStyle}
                >
                  下一頁
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Recent orders */}
      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>近期訂單</h2>
        {loading ? (
          <p>載入中...</p>
        ) : orders.length === 0 ? (
          <p style={{ color: '#999' }}>暫無訂單</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '16px 20px',
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>訂單 #{order.ouid}</span>
                  <span style={{ fontSize: 13, color: '#666' }}>
                    {new Date(order.created_time).toLocaleDateString('zh-TW')}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
                  會員：{order.user_id}　合計：NT$ {order.payment.toLocaleString()}
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>
                  {order.items.map((item, i) => (
                    <span key={i} style={{ marginRight: 12 }}>
                      {item.product_name ?? `商品 #${item.product_id}`} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#f0f5fa',
        borderRadius: 8,
        padding: '20px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#124365' }}>{value}</div>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 12px', color: '#124365', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  )
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: '10px 12px' }}>{children}</td>
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #ccc',
  borderRadius: 5,
  fontSize: 14,
  boxSizing: 'border-box',
}

const paginBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: '#124365',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
}
