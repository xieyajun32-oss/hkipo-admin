import React, { useMemo, useState } from 'react'

const defaultAccounts = `HK001 贺理平 154775
HK002 陈灵 159246
HK003 丁玲 153875`
const feeOptions = [88, 28, 68, 0]
const defaultTiers = [
  { threshold: 100000, leverage: 10, fee: 88 },
  { threshold: 50000, leverage: 5, fee: 68 },
  { threshold: 20000, leverage: 3, fee: 28 },
  { threshold: 0, leverage: 1, fee: 0 },
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
      const parts = line.split(/[\s,\t，]+/).filter(Boolean)
      const capital = Number(parts.at(-1))
      return {
        index: index + 1,
        code: parts[0] || '',
        name: parts.slice(1, -1).join('') || '',
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

export default function IpoTemplate() {
  const [stockName, setStockName] = useState('')
  const [stockCode, setStockCode] = useState('')
  const [lotShares, setLotShares] = useState(150)
  const [ipoPrice, setIpoPrice] = useState(18.8)
  const [tiers, setTiers] = useState(defaultTiers)
  const [accountsText, setAccountsText] = useState(defaultAccounts)

  const costPrice = Number(ipoPrice || 0) * 1.01
  const lotCost = Number(lotShares || 0) * costPrice

  const updateTier = (index, key, value) => {
    setTiers(current => current.map((tier, idx) => {
      if (idx !== index) return tier
      if (key === 'leverage') return { ...tier, leverage: clampLeverage(value) }
      return { ...tier, [key]: Number(value) }
    }))
  }

  const rows = useMemo(() => {
    return parseAccounts(accountsText).map(row => {
      const tier = matchTier(row.capital, tiers)
      const leverage = clampLeverage(tier?.leverage)
      const subscriptionFee = Number(tier?.fee || 0)
      const buyingPower = row.capital * leverage
      const lots = lotCost > 0 ? Math.floor(buyingPower / lotCost) : 0
      const shares = lots * Number(lotShares || 0)

      return {
        ...row,
        leverage,
        subscriptionFee,
        buyingPower,
        lots,
        shares,
        strategy: tierLabel(tier),
      }
    })
  }, [accountsText, lotCost, lotShares, tiers])

  const totals = rows.reduce((sum, row) => ({
    capital: sum.capital + row.capital,
    buyingPower: sum.buyingPower + row.buyingPower,
    lots: sum.lots + row.lots,
    shares: sum.shares + row.shares,
    subscriptionFee: sum.subscriptionFee + row.subscriptionFee,
  }), { capital: 0, buyingPower: 0, lots: 0, shares: 0, subscriptionFee: 0 })

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">IPO 打新模板</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            按账户资金、每手股数、IPO 价格和策略自动计算认购手数。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <section className="template-panel">
          <h2 className="font-semibold mb-3">基础数据</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="template-field col-span-2">
              <span>股票名称</span>
              <input value={stockName} onChange={e => setStockName(e.target.value)} placeholder="例如：创想三维" />
            </label>
            <label className="template-field">
              <span>股票代码</span>
              <input value={stockCode} onChange={e => setStockCode(e.target.value)} placeholder="例如：03388" />
            </label>
            <label className="template-field">
              <span>每手股数</span>
              <input type="number" value={lotShares} onChange={e => setLotShares(Number(e.target.value))} />
            </label>
            <label className="template-field">
              <span>IPO 价格</span>
              <input type="number" step="0.01" value={ipoPrice} onChange={e => setIpoPrice(Number(e.target.value))} />
            </label>
            <label className="template-field">
              <span>成本价</span>
              <input value={fmt(costPrice, 4)} readOnly />
            </label>
          </div>

          <h2 className="font-semibold mt-5 mb-3">成本规则</h2>
          <div className="grid grid-cols-1 gap-2">
            <label className="template-field">
              <span>每手成本</span>
              <input value={fmt(lotCost, 2)} readOnly />
            </label>
          </div>

          <div className="template-rule mt-4">
            <div>成本价 = IPO 价格 × 1.01</div>
            <div>认购手数 = 可认购资金 ÷ 每手成本，向下取整。</div>
            <div>卖出佣金 75 元、结算费 2 元、交易税 3 元，仅中签账户产生；未中签账户不计这些卖出费用。</div>
          </div>
        </section>

        <section className="template-panel">
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <h2 className="font-semibold">账户资金输入</h2>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              每行格式：手机编号 姓名 账户资金
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
            倍数限制 1-10；手续费可选 88、28、68、0。
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
          <h2 className="font-semibold">认购手数计算表</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {stockName || '股票名称'} {stockCode ? `(${stockCode})` : ''}
          </div>
        </div>
        <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[980px] text-xs ipo-import-table">
            <thead>
              <tr>
                <th className="text-left px-2 py-2">序号</th>
                <th className="text-left px-2 py-2">手机编号</th>
                <th className="text-left px-2 py-2">姓名</th>
                <th className="text-left px-2 py-2">账户资金</th>
                <th className="text-left px-2 py-2">策略</th>
                <th className="text-left px-2 py-2">融资倍数</th>
                <th className="text-left px-2 py-2">手续费</th>
                <th className="text-left px-2 py-2">可认购资金</th>
                <th className="text-left px-2 py-2">每手成本</th>
                <th className="text-left px-2 py-2">认购手数</th>
                <th className="text-left px-2 py-2">认购股数</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={`${row.index}-${row.code}`}>
                  <td className="px-2 py-1.5">{row.index}</td>
                  <td className="px-2 py-1.5">{row.code}</td>
                  <td className="px-2 py-1.5">{row.name || '-'}</td>
                  <td className="px-2 py-1.5">{fmt(row.capital, 0)}</td>
                  <td className="px-2 py-1.5">{row.strategy}</td>
                  <td className="px-2 py-1.5">{fmt(row.leverage, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.subscriptionFee, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.buyingPower, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(lotCost, 2)}</td>
                  <td className="px-2 py-1.5 font-semibold">{fmt(row.lots, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.shares, 0)}</td>
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
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.subscriptionFee, 0)}</td>
                <td className="px-2 py-2 font-semibold">{fmt(totals.buyingPower, 0)}</td>
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.lots, 0)}</td>
                <td className="px-2 py-2 font-semibold">{fmt(totals.shares, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  )
}
