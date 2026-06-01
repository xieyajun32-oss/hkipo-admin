import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const defaultAccounts = `HK001 贺理平 154,775
HK002 陈灵 159,246
HK003 丁玲 153,875
HK004 叶炫 158,233
HK005 何倩 107,050
HK006 陈晓欣 149,189
HK007 陈惠如 31,196
HK009 何存琼 162,430
HK010 张青明 106,250
HK011 张发明 115,801
HK012 张中秀 163,685
HK013 赵继恒 168,686
HK014 黄中梅（甲尾） 550,111
HK015 谢玉华 218,117
HK016 胡秋兰（甲尾） 544,355
HK017 江青霖（甲尾） 537,089
HK018 赖振兴 25,488
HK019 文清杨（甲尾） 543,014
HK020 刘雨 145,902
HK021 王水秀 133,245
HK022 李爱君 10,010
HK023 刘德桂 163,728
HK024 文成玲 107,487
HK025 刘江南（甲尾） 400,000
HK026 李中茹 148,453
HK027 周伟（甲尾） 538,221
HK028 李嘉诚（甲尾） 486,195
HK029 王茗（甲尾） 527,949
HK030 张李磊（甲尾） 566,748
HK031 许磊（甲尾） 590,945
HK032 黎祥 128,603
HK033 方金华 146,721
HK034 陈亮 56,394`

const feeOptions = [0, 28, 68, 88, 50, 100]
const defaultTiers = [
  { threshold: 50000, leverage: 10, fee: 88 },
  { threshold: 0, leverage: 10, fee: 28 },
]
const defaultStocks = [
  { id: 'stock-a', name: '核心票', code: '', lotShares: 100, ipoPrice: 66.4, allocation: 50 },
  { id: 'stock-b', name: '次核心票', code: '', lotShares: 100, ipoPrice: 30, allocation: 30 },
  { id: 'stock-c', name: '试探票', code: '', lotShares: 100, ipoPrice: 12, allocation: 20 },
]
const allowedLotCounts = [
  ...Array.from({ length: 10 }, (_, index) => index + 1),
  15,
  20,
  ...Array.from({ length: 16 }, (_, index) => 25 + index * 5),
  ...Array.from({ length: 10 }, (_, index) => 200 + index * 100),
  2000,
  3000,
  43483,
]

function fmt(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  if (typeof value !== 'number') return value || '-'
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 === 0 ? 0 : Math.min(digits, 2),
  })
}

function parseAccounts(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^(\S+)\s+(.+?)\s+([\d,，.]+)$/)
      const code = match?.[1] || ''
      const name = match?.[2]?.trim() || ''
      const capitalText = match?.[3] || ''
      const capital = Number(capitalText.replace(/[，,]/g, ''))
      return {
        index: index + 1,
        code,
        name,
        capital: Number.isFinite(capital) ? capital : 0,
      }
    })
}

function clampLeverage(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 1
  return Math.max(1, Math.min(10, parsed))
}

function tierLabel(tier) {
  if (!tier) return '-'
  return `${fmt(tier.threshold / 10000, 0)}万以上${fmt(tier.leverage, 0)}倍，手续费${fmt(tier.fee, 0)}元`
}

function matchTier(capital, tiers) {
  const sorted = [...tiers].sort((a, b) => Number(b.threshold || 0) - Number(a.threshold || 0))
  return sorted.find(tier => capital >= Number(tier.threshold || 0)) || sorted.at(-1) || defaultTiers.at(-1)
}

function matchAllowedLotCount(value) {
  const parsed = Math.floor(Number(value || 0))
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return [...allowedLotCounts].reverse().find(lots => lots <= parsed) || 0
}

function adjacentAllowedLotCount(current, direction) {
  const fallback = matchAllowedLotCount(current)
  const index = allowedLotCounts.findIndex(lots => lots === fallback)
  if (index < 0) return direction > 0 ? allowedLotCounts[0] : 0
  return allowedLotCounts[Math.max(0, Math.min(allowedLotCounts.length - 1, index + direction))]
}

function stockCost(stock) {
  const costPrice = Number(stock.ipoPrice || 0) * 1.01
  return {
    costPrice,
    lotCost: Number(stock.lotShares || 0) * costPrice,
  }
}

function makeManualKey(row, stock) {
  return `${row.accountKey}-${stock.id}`
}

export default function IpoTemplate() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState(defaultStocks)
  const [tiers, setTiers] = useState(defaultTiers)
  const [accountsText, setAccountsText] = useState(defaultAccounts)
  const [manualLots, setManualLots] = useState({})
  const [manualFees, setManualFees] = useState({})
  const [saving, setSaving] = useState(false)

  const allocationTotal = stocks.reduce((sum, stock) => sum + Number(stock.allocation || 0), 0) || 1

  const updateStock = (index, key, value) => {
    setStocks(current => current.map((stock, idx) => {
      if (idx !== index) return stock
      if (['lotShares', 'ipoPrice', 'allocation'].includes(key)) return { ...stock, [key]: Number(value) }
      return { ...stock, [key]: value }
    }))
  }

  const updateTier = (index, key, value) => {
    setTiers(current => current.map((tier, idx) => {
      if (idx !== index) return tier
      if (key === 'leverage') return { ...tier, leverage: clampLeverage(value) }
      return { ...tier, [key]: Number(value) }
    }))
  }

  const setManualRowLots = (row, stockPlan, value) => {
    const key = makeManualKey(row, stockPlan.stock)
    const capped = Math.min(Number(value || 0), stockPlan.maxLots)
    setManualLots(current => ({ ...current, [key]: matchAllowedLotCount(capped) }))
  }

  const stepManualRowLots = (row, stockPlan, direction) => {
    const key = makeManualKey(row, stockPlan.stock)
    setManualLots(current => {
      const base = current[key] ?? stockPlan.lots
      const nextLots = adjacentAllowedLotCount(base, direction)
      return { ...current, [key]: matchAllowedLotCount(Math.min(nextLots, stockPlan.maxLots)) }
    })
  }

  const resetManualRowLots = (row, stockPlan) => {
    const key = makeManualKey(row, stockPlan.stock)
    setManualLots(current => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const setManualRowFee = (row, value) => {
    const key = row.accountKey
    setManualFees(current => ({ ...current, [key]: Number(value) }))
  }

  const resetManualRowFee = (row) => {
    const key = row.accountKey
    setManualFees(current => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const rows = useMemo(() => {
    return parseAccounts(accountsText).map(row => {
      const accountKey = `${row.code}-${row.name}-${row.index}`
      const tier = matchTier(row.capital, tiers)
      const leverage = clampLeverage(tier?.leverage)
      const tierFee = Number(tier?.fee || 0)
      const subscriptionFee = manualFees[accountKey] ?? tierFee
      const buyingPower = row.capital * leverage
      const stockPlans = stocks.map(stock => {
        const { costPrice, lotCost } = stockCost(stock)
        const targetAmount = buyingPower * (Number(stock.allocation || 0) / allocationTotal)
        const maxLots = lotCost > 0 ? Math.floor(targetAmount / lotCost) : 0
        const autoLots = matchAllowedLotCount(maxLots)
        const planKey = makeManualKey({ accountKey }, stock)
        const lots = manualLots[planKey] ?? autoLots
        const shares = lots * Number(stock.lotShares || 0)
        const applicationAmount = lots * lotCost

        return {
          stock,
          costPrice,
          lotCost,
          targetAmount,
          maxLots,
          autoLots,
          lots,
          shares,
          applicationAmount,
        }
      })
      const usedAmount = stockPlans.reduce((sum, plan) => sum + plan.applicationAmount, 0)

      return {
        ...row,
        accountKey,
        leverage,
        subscriptionFee,
        tierFee,
        buyingPower,
        usedAmount,
        remainingPower: buyingPower - usedAmount,
        stockPlans,
        strategy: tierLabel(tier),
      }
    })
  }, [accountsText, allocationTotal, manualFees, manualLots, stocks, tiers])

  const stockTotals = stocks.map(stock => {
    const plans = rows.map(row => row.stockPlans.find(plan => plan.stock.id === stock.id)).filter(Boolean)
    return {
      stock,
      targetAmount: plans.reduce((sum, plan) => sum + plan.targetAmount, 0),
      lots: plans.reduce((sum, plan) => sum + plan.lots, 0),
      shares: plans.reduce((sum, plan) => sum + plan.shares, 0),
      applicationAmount: plans.reduce((sum, plan) => sum + plan.applicationAmount, 0),
    }
  })

  const totals = rows.reduce((sum, row) => ({
    capital: sum.capital + row.capital,
    buyingPower: sum.buyingPower + row.buyingPower,
    usedAmount: sum.usedAmount + row.usedAmount,
    remainingPower: sum.remainingPower + row.remainingPower,
    subscriptionFee: sum.subscriptionFee + row.subscriptionFee,
  }), { capital: 0, buyingPower: 0, usedAmount: 0, remainingPower: 0, subscriptionFee: 0 })

  const buildIpoNotes = (stock) => {
    const { costPrice, lotCost } = stockCost(stock)
    const applications = rows.map(row => {
      const plan = row.stockPlans.find(item => item.stock.id === stock.id)
      return {
        index: row.index,
        phone_code: row.code,
        name: row.name,
        capital: row.capital,
        broker: '',
        lots_applied: plan.lots,
        shares_applied: plan.shares,
        shares_won: 0,
        won_amount: 0,
        subscription_fee: row.subscriptionFee,
        winning_fee: 0,
        stamp_formula: '',
        stamp_duty: 0,
        sell_commission: 0,
        settlement_fee: 0,
        transaction_tax: 0,
        total_fee: row.subscriptionFee,
        cost_price: costPrice,
        sell_price: '',
        sold: '',
        sell_amount: 0,
        trading_profit: 0,
        ipo_profit: -row.subscriptionFee,
        application_amount: plan.applicationAmount,
        target_amount: plan.targetAmount,
        leverage: row.leverage,
        strategy: `${row.strategy}；三股分配 ${fmt(stock.allocation, 0)}%`,
      }
    })
    const planTotal = stockTotals.find(item => item.stock.id === stock.id)

    return {
      source: 'ipo-template',
      mode: 'three-stock-capital-plan',
      imported_at: new Date().toISOString(),
      lot_shares: Number(stock.lotShares || 0),
      ipo_price: Number(stock.ipoPrice || 0),
      cost_price: costPrice,
      lot_cost: lotCost,
      allocation_percent: Number(stock.allocation || 0),
      fee_rule: {
        sell_commission: 75,
        settlement_fee: 2,
        transaction_tax: 3,
      },
      tiers,
      applications,
      summary: {
        accounts: rows.length,
        total_capital: totals.capital,
        total_buying_power: totals.buyingPower,
        total_lots: planTotal?.lots || 0,
        total_shares_applied: planTotal?.shares || 0,
        total_application_amount: planTotal?.applicationAmount || 0,
        total_subscription_fee: totals.subscriptionFee,
        total_fee: totals.subscriptionFee,
        total_shares_won: 0,
        total_won_amount: 0,
        total_sell_amount: 0,
        trading_profit: 0,
        ipo_profit: -totals.subscriptionFee,
      },
    }
  }

  const handleConfirmImport = async () => {
    const activeStocks = stocks.filter(stock => stock.name.trim())
    if (!activeStocks.length) return alert('请先至少填写一只股票名称')
    if (!rows.length) return alert('请先输入账户资金')
    if (rows.some(row => !row.code || !row.name || row.capital <= 0)) {
      return alert('账户格式不完整，请按“手机编号 姓名 账户资金”输入')
    }
    if (!window.confirm(`确认把 ${activeStocks.length} 只股票、${rows.length} 个账户的打新计划导入 IPO 打新？`)) return

    setSaving(true)
    try {
      const created = []
      for (const stock of activeStocks) {
        const payload = {
          stock_name: stock.name.trim(),
          stock_code: stock.code.trim(),
          offer_price: Number(stock.ipoPrice || 0),
          notes: JSON.stringify(buildIpoNotes(stock)),
        }
        created.push(await api.post('/ipos', payload))
      }
      alert(`已导入 ${created.length} 只 IPO 打新`)
      if (created.length === 1 && created[0]?.id) navigate(`/admin/ipos/${created[0].id}`)
      else navigate('/admin/ipos')
    } catch (error) {
      alert(error.message || '导入失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">IPO 打新模板</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            同一账户资金可拆成三只股票，按不同资金比例分别计算认购手数。
          </p>
        </div>
      </div>

      <section className="template-panel">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">三只股票资金规划</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            默认按 50 / 30 / 20 分配；确定性最高的票放最大比例，弹性票少量试探。
          </div>
        </div>
        <div className="template-stock-grid">
          {stocks.map((stock, index) => {
            const { costPrice, lotCost } = stockCost(stock)
            const total = stockTotals[index]
            return (
              <div key={stock.id} className="template-stock-card">
                <div className="template-stock-card-title">股票 {index + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="template-field col-span-2">
                    <span>股票名称</span>
                    <input value={stock.name} onChange={e => updateStock(index, 'name', e.target.value)} placeholder="例如：创想三维" />
                  </label>
                  <label className="template-field">
                    <span>股票代码</span>
                    <input value={stock.code} onChange={e => updateStock(index, 'code', e.target.value)} placeholder="例如：03388" />
                  </label>
                  <label className="template-field">
                    <span>资金比例</span>
                    <input type="number" value={stock.allocation} onChange={e => updateStock(index, 'allocation', e.target.value)} />
                  </label>
                  <label className="template-field">
                    <span>每手股数</span>
                    <input type="number" value={stock.lotShares} onChange={e => updateStock(index, 'lotShares', e.target.value)} />
                  </label>
                  <label className="template-field">
                    <span>IPO 价格</span>
                    <input type="number" step="0.01" value={stock.ipoPrice} onChange={e => updateStock(index, 'ipoPrice', e.target.value)} />
                  </label>
                  <label className="template-field">
                    <span>成本价</span>
                    <input value={fmt(costPrice, 4)} readOnly />
                  </label>
                  <label className="template-field">
                    <span>每手成本</span>
                    <input value={fmt(lotCost, 2)} readOnly />
                  </label>
                </div>
                <div className="template-stock-stats">
                  <span>目标资金 {fmt(total?.targetAmount || 0, 0)}</span>
                  <span>实际申请 {fmt(total?.applicationAmount || 0, 0)}</span>
                  <span>总手数 {fmt(total?.lots || 0, 0)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="template-rule mt-4">
          <div>规划逻辑：先给三只股票设资金比例，再对每个账户的可认购资金按比例切分。</div>
          <div>如果一只票确定性明显更高，把比例调到 50%-60%；普通参与放 25%-35%；只是占坑或赔率不确定的票放 10%-20%。</div>
          <div>系统会按每只股票的目标资金、每手成本和招股书允许档位向下取整，避免单个账户三只股票合计超出可认购资金。</div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 mt-4">
        <section className="template-panel">
          <h2 className="font-semibold mb-3">成本规则</h2>
          <div className="template-rule">
            <div>成本价 = IPO 价格 × 1.01</div>
            <div>每行认购手数和手续费都可手动调整；调整后同步重算每只股票申请金额。</div>
            <div>卖出佣金 75 元、结算费 2 元、交易税 3 元，仅中签账户产生；未中签账户不计这些卖出费用。</div>
          </div>
        </section>

        <section className="template-panel">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <h2 className="font-semibold">账户资金输入</h2>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              每行格式：手机编号 姓名 账户资金
              <span className="ml-2">支持千分位，例如：HK001 贺理平 154,775</span>
            </div>
          </div>
          <textarea
            className="template-textarea"
            value={accountsText}
            onChange={e => setAccountsText(e.target.value)}
            spellCheck={false}
          />
        </section>
      </div>

      <section className="template-panel mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">资金分界与手续费标准</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            倍数限制 1-10；手续费可选 0、28、50、68、88、100。
          </div>
        </div>
        <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[720px] text-xs ipo-import-table">
            <thead>
              <tr>
                <th className="text-left px-2 py-2">档位</th>
                <th className="text-left px-2 py-2">资金下限</th>
                <th className="text-left px-2 py-2">融资倍数</th>
                <th className="text-left px-2 py-2">手续费</th>
                <th className="text-left px-2 py-2">规则说明</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => (
                <tr key={index}>
                  <td className="px-2 py-1.5">第 {index + 1} 档</td>
                  <td className="px-2 py-1.5">
                    <input className="template-table-input" type="number" value={tier.threshold} onChange={e => updateTier(index, 'threshold', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="template-table-input" type="number" min="1" max="10" value={tier.leverage} onChange={e => updateTier(index, 'leverage', e.target.value)} />
                  </td>
                  <td className="px-2 py-1.5">
                    <select className="template-table-input" value={tier.fee} onChange={e => updateTier(index, 'fee', e.target.value)}>
                      {feeOptions.map(fee => <option key={fee} value={fee}>{fee}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">{tierLabel(tier)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="template-panel mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">三股认购总览</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            总账户资金 {fmt(totals.capital, 0)}；可认购资金 {fmt(totals.buyingPower, 0)}；实际申请 {fmt(totals.usedAmount, 0)}
          </div>
        </div>
        <div className="template-summary-grid">
          {stockTotals.map(item => (
            <div key={item.stock.id} className="template-summary-item">
              <div className="template-summary-name">{item.stock.name || '未命名股票'}</div>
              <div>目标资金：{fmt(item.targetAmount, 0)}</div>
              <div>实际申请：{fmt(item.applicationAmount, 0)}</div>
              <div>总手数：{fmt(item.lots, 0)} 手</div>
            </div>
          ))}
          <div className="template-summary-item">
            <div className="template-summary-name">剩余可用</div>
            <div>未用额度：{fmt(totals.remainingPower, 0)}</div>
            <div>申购费合计：{fmt(totals.subscriptionFee, 0)}</div>
            <div>资金使用率：{totals.buyingPower ? fmt((totals.usedAmount / totals.buyingPower) * 100, 1) : 0}%</div>
          </div>
        </div>
      </section>

      <section className="template-panel mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">逐账户拆分表</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            每个账户三只股票分别可调手数。
          </div>
        </div>
        <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[1980px] text-xs ipo-import-table">
            <thead>
              <tr>
                <th className="text-left px-2 py-2">序号</th>
                <th className="text-left px-2 py-2">手机编号</th>
                <th className="text-left px-2 py-2">姓名</th>
                <th className="text-left px-2 py-2">账户资金</th>
                <th className="text-left px-2 py-2">融资倍数</th>
                <th className="text-left px-2 py-2">手续费</th>
                <th className="text-left px-2 py-2">可认购资金</th>
                {stocks.map(stock => (
                  <React.Fragment key={stock.id}>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}目标</th>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}手数</th>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}金额</th>
                  </React.Fragment>
                ))}
                <th className="text-left px-2 py-2">实际申请</th>
                <th className="text-left px-2 py-2">剩余额度</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={`${row.index}-${row.code}`}>
                  <td className="px-2 py-1.5">{row.index}</td>
                  <td className="px-2 py-1.5">{row.code}</td>
                  <td className="px-2 py-1.5">{row.name || '-'}</td>
                  <td className="px-2 py-1.5">{fmt(row.capital, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.leverage, 0)}</td>
                  <td className="px-2 py-1.5">
                    <div className="template-fee-control">
                      <select value={row.subscriptionFee} onChange={e => setManualRowFee(row, e.target.value)}>
                        {feeOptions.map(fee => <option key={fee} value={fee}>{fee}</option>)}
                      </select>
                      <button type="button" onClick={() => resetManualRowFee(row)}>自动</button>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">{fmt(row.buyingPower, 0)}</td>
                  {row.stockPlans.map(plan => (
                    <React.Fragment key={plan.stock.id}>
                      <td className="px-2 py-1.5">{fmt(plan.targetAmount, 0)}</td>
                      <td className="px-2 py-1.5">
                        <div className="template-lot-control">
                          <button type="button" onClick={() => stepManualRowLots(row, plan, -1)}>-</button>
                          <input type="number" value={plan.lots} onChange={e => setManualRowLots(row, plan, e.target.value)} />
                          <button type="button" onClick={() => stepManualRowLots(row, plan, 1)}>+</button>
                          <button type="button" className="template-lot-reset" onClick={() => resetManualRowLots(row, plan)}>自动</button>
                        </div>
                      </td>
                      <td className="px-2 py-1.5">{fmt(plan.applicationAmount, 0)}</td>
                    </React.Fragment>
                  ))}
                  <td className="px-2 py-1.5">{fmt(row.usedAmount, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.remainingPower, 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-2 py-2 font-semibold">合计</td>
                <td />
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.capital, 0)}</td>
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.subscriptionFee, 0)}</td>
                <td className="px-2 py-2 font-semibold">{fmt(totals.buyingPower, 0)}</td>
                {stockTotals.map(item => (
                  <React.Fragment key={item.stock.id}>
                    <td className="px-2 py-2 font-semibold">{fmt(item.targetAmount, 0)}</td>
                    <td className="px-2 py-2 font-semibold">{fmt(item.lots, 0)}</td>
                    <td className="px-2 py-2 font-semibold">{fmt(item.applicationAmount, 0)}</td>
                  </React.Fragment>
                ))}
                <td className="px-2 py-2 font-semibold">{fmt(totals.usedAmount, 0)}</td>
                <td className="px-2 py-2 font-semibold">{fmt(totals.remainingPower, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex flex-wrap justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            style={{ background: 'var(--accent)', color: '#1a1a1a' }}
          >
            {saving ? '正在导入...' : '确认无误，导入三只 IPO 打新'}
          </button>
        </div>
      </section>
    </div>
  )
}
