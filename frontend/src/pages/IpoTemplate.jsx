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
HK034 陈亮 56,394
HK035 吴双枝 59,355
HK036 彭昌啟 73,240
HK037 严凯玲 66,281
HK038 郑兰 64,897
HK039 旷佳丽（乙头） 700,668
HK040 杨家润 149,955
HK041 郑玉俊 106,512
HK042 旷林 478,158
HK043 候贝贝（甲尾） 552,760
HK044 赵术成（甲尾） 586,670
HK046 谢惠（甲尾） 599,927
HK047 mini（乙头） 712,551
HK048 杨文凤（甲尾） 526,903
HK049 许永红 64,000
HK050 蒋国辉 54,872
HK051 蒋佳余 106,300
HK052 刘学花 53,600
HK053 刘俊花 60,100
HK054 黄秋慧 106,222
HK055 伍玉莲 106,300
HK056 李桂萍 107,500
HK057 宋淼 106,200
HK058 何小杭 110,000
HK059 郑玉兴 107,500
HK060 孙露聪 106,400
HK061 吴遂中 107,422
HK062 熊晓燕 106,272
HK063 李琴 112,000
HK064 郑艳虹 106,272
HK065 彭海伦 109,972
HK066 彭军 107,450
HK067 周娟 10,050
HK068 苏天树 107,372
HK069 王太方 107,400
HK070 何德敏 107,400
HK071 谢崇琼 107,372
HK072 何伟 107,450
HK073 李陶琴 106,172
HK074 赵波 104,100
HK075 唐杰 112,000
HK076 欧阳志强 107,400
HK077 何佳临 107,372`

const liuliumeiTiersText = `100 4,401.96
200 8,803.90
300 13,205.85
400 17,607.80
500 22,009.75
600 26,411.71
700 30,813.65
800 35,215.60
900 39,617.56
1,000 44,019.51
1,500 66,029.25
2,000 88,039.00
2,500 110,048.76
3,000 132,058.52
3,500 154,068.27
4,000 176,078.02
4,500 198,087.76
5,000 220,097.52
6,000 264,117.02
7,000 308,136.54
8,000 352,156.03
9,000 396,175.54
10,000 440,195.04
20,000 880,390.09
30,000 1,320,585.13
40,000 1,760,780.17
50,000 2,200,975.21
60,000 2,641,170.26
70,000 3,081,365.31
80,000 3,521,560.34
90,000 3,961,755.38
100,000 4,401,950.44
150,000 6,602,925.65
200,000 8,803,900.85
250,000 11,004,876.08
300,000 13,205,851.29
350,000 15,406,826.50
400,000 17,607,801.72
450,000 19,808,776.94
573,200 25,231,979.86`

const senasicTiersText = `200 3,709.04
400 7,418.06
600 11,127.10
800 14,836.13
1,000 18,545.17
1,200 22,254.18
1,400 25,963.22
1,600 29,672.25
1,800 33,381.29
2,000 37,090.32
3,000 55,635.48
4,000 74,180.64
5,000 92,725.81
6,000 111,270.96
7,000 129,816.12
8,000 148,361.29
9,000 166,906.45
10,000 185,451.61
20,000 370,903.21
30,000 556,354.82
40,000 741,806.42
50,000 927,258.04
60,000 1,112,709.63
70,000 1,298,161.24
80,000 1,483,612.85
90,000 1,669,064.45
100,000 1,854,516.05
200,000 3,709,032.12
300,000 5,563,548.18
400,000 7,418,064.25
500,000 9,272,580.30
600,000 11,127,096.35
700,000 12,981,612.42
800,000 14,836,128.48
900,000 16,690,644.55
1,000,000 18,545,160.60
1,500,000 27,817,740.90
2,000,000 37,090,321.20
2,670,400 49,522,996.86`

const defaultStrategyPrompt = `SENASIC（6675）：发行价 18.36，每手 200 股。
4号、7号账户已退，不打。
10万以上本金全部融资打，按10倍购买力取不超过购买力的招股书最高档位，融资费 88。
10万以下本金打28套餐，对应 10手 / 2,000股 / 37,090.32港元档，手续费 28。`

const feeOptions = [0, 28, 68, 88, 50, 100]
const defaultTiers = [
  { threshold: 100000, leverage: 10, fee: 88 },
  { threshold: 0, leverage: 10, fee: 28 },
]
const stockStrategies = {
  senasic: { label: 'SENASIC策略', weight: 100, desc: '4号/7号不打；10万以上本金全部融资打；10万以下走28套餐10手' },
  liuliumei: { label: '溜溜梅策略', weight: 100, desc: '资金大于等于44.02万融资打；乙头门槛66.03万；其他账户现金申购且不收手续费' },
  full: { label: '全力打', weight: 100, desc: '优先使用当前可用额度，按招股书合法档位尽量拉满' },
  focus: { label: '重点打', weight: 55, desc: '中高仓位，适合值得重点参与的票' },
  fee68: { label: '68套餐', weight: 12, capLots: 5, fixedFee: 68, desc: '固定68元套餐，只打几手控制成本' },
  fee28: { label: '28套餐', weight: 12, capLots: 5, fixedFee: 28, desc: '固定28元套餐，只打几手控制成本' },
  free: { label: '免费餐', weight: 12, capLots: 5, fixedFee: 0, desc: '免费餐，不计申购手续费，只打几手' },
}
const defaultStocks = [
  {
    id: 'stock-a',
    name: 'SENASIC',
    code: '6675',
    lotShares: 200,
    ipoPrice: 18.36,
    strategy: 'senasic',
    rule: 'senasic_6675',
    subscriptionStart: '2026-06-09',
    subscriptionEnd: '2026-06-12 12:00',
    listingDate: '2026-06-17',
    lotOptionsText: '1,2,3,4,5,6,7,8,9,10,15,20,25,30,35,40,45,50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000,1500,2000,26704',
    applicationTiersText: senasicTiersText,
  },
]
const fallbackLotOptions = '1,2,3,4,5,6,7,8,9,10,20,40,60,80,100,200,400,600,800,1000'

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

function parseLotOptions(text) {
  const options = String(text || fallbackLotOptions)
    .split(/[,，\s]+/)
    .map(item => Number(item))
    .filter(item => Number.isFinite(item) && item > 0)
  return [...new Set(options)].sort((a, b) => a - b)
}

function parseMoney(value) {
  const parsed = Number(String(value || '').replace(/[，,]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function stockLotOptions(stock) {
  const options = parseLotOptions(stock.lotOptionsText)
  return options.length ? options : parseLotOptions(fallbackLotOptions)
}

function fallbackApplicationTiers(stock) {
  const { lotCost } = stockCost(stock)
  const lotShares = Number(stock.lotShares || 0)
  return stockLotOptions(stock)
    .map(lots => ({
      shares: lots * lotShares,
      lots,
      amount: lots * lotCost,
      source: 'estimated',
    }))
    .filter(tier => tier.shares > 0 && tier.lots > 0 && tier.amount > 0)
}

function parseApplicationTiers(text, stock) {
  const lotShares = Number(stock.lotShares || 0)
  const ipoPrice = Number(stock.ipoPrice || 0)
  const rows = []

  String(text || '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .forEach(line => {
      const numbers = line.match(/\d[\d,，]*(?:\.\d+)?/g)?.map(parseMoney).filter(Boolean) || []
      for (let index = 0; index < numbers.length - 1; index += 1) {
        const shares = numbers[index]
        const amount = numbers[index + 1]
        const looksLikeShareCount = lotShares > 0 && shares >= lotShares && shares % lotShares === 0
        const looksLikeApplicationAmount = ipoPrice > 0 ? amount >= shares * ipoPrice * 0.8 : amount > shares
        if (looksLikeShareCount && looksLikeApplicationAmount) {
          rows.push({
            shares,
            lots: shares / lotShares,
            amount,
            source: 'prospectus',
          })
          index += 1
        }
      }
    })

  const deduped = new Map()
  rows.forEach(row => {
    const previous = deduped.get(row.shares)
    if (!previous || row.amount < previous.amount) deduped.set(row.shares, row)
  })
  return [...deduped.values()].sort((a, b) => a.amount - b.amount)
}

function stockApplicationTiers(stock) {
  const parsed = parseApplicationTiers(stock.applicationTiersText, stock)
  return parsed.length ? parsed : fallbackApplicationTiers(stock)
}

function applicationTierText(stock) {
  if (stock.applicationTiersText) return stock.applicationTiersText
  return fallbackApplicationTiers(stock)
    .map(tier => `${fmt(tier.shares, 0)} ${fmt(tier.amount, 2)}`)
    .join('\n')
}

function stockTierByLots(stock, lots) {
  const parsed = Number(lots || 0)
  return stockApplicationTiers(stock).find(tier => tier.lots === parsed)
}

function matchAllowedLotCount(value, stock) {
  const options = stockApplicationTiers(stock).map(tier => tier.lots)
  const parsed = Math.floor(Number(value || 0))
  if (!Number.isFinite(parsed) || parsed <= 0) return 0
  return [...options].reverse().find(lots => lots <= parsed) || 0
}

function matchAffordableLotCount(budgetAmount, stock, maxLots = Infinity) {
  const budget = Number(budgetAmount || 0)
  if (!Number.isFinite(budget) || budget <= 0) return 0
  const tier = [...stockApplicationTiers(stock)]
    .reverse()
    .find(item => item.amount <= budget && item.lots <= maxLots)
  return tier?.lots || 0
}

function adjacentAllowedLotCount(current, direction, stock) {
  const options = stockApplicationTiers(stock).map(tier => tier.lots)
  const fallback = matchAllowedLotCount(current, stock)
  const index = options.findIndex(lots => lots === fallback)
  if (index < 0) return direction > 0 ? options[0] : 0
  return options[Math.max(0, Math.min(options.length - 1, index + direction))]
}

function stockCost(stock) {
  const costPrice = Number(stock.ipoPrice || 0) * 1.01
  return {
    costPrice,
    lotCost: Number(stock.lotShares || 0) * costPrice,
  }
}

function stockStrategy(stock) {
  return stockStrategies[stock.strategy] || stockStrategies.focus
}

function accountIpoTag(row, stock) {
  if (stock?.rule === 'senasic_6675') {
    if ([4, 7].includes(Number(row?.index || 0))) return '不打'
    if (Number(row?.capital || 0) >= 100000) return '融资'
    return '28套餐'
  }
  const capital = Number(row?.capital || 0)
  if (capital >= 660292.57) return '乙头'
  if (capital >= 440195.04) return '甲尾'
  return '现金'
}

function accountLeverage(row, tier, stock) {
  const tag = accountIpoTag(row, stock)
  if (tag === '不打') return 0
  if (stock?.rule === 'senasic_6675') return 10
  return tag === '现金' ? 1 : 10
}

function shouldSkipAccount(row, stock) {
  return stock?.rule === 'senasic_6675' && [4, 7].includes(Number(row?.index || 0))
}

function senasicAccountFeeOverride(row, stock) {
  if (stock?.rule !== 'senasic_6675') return null
  const index = Number(row?.index || 0)
  if (index === 18) return 50
  if ((index >= 34 && index <= 38) || [49, 50, 52, 53, 67].includes(index)) return 0
  return null
}

function accountDefaultFee(accountTag, row, stock) {
  const overrideFee = senasicAccountFeeOverride(row, stock)
  if (overrideFee !== null) return overrideFee
  if (accountTag === '现金' || accountTag === '不打') return 0
  if (accountTag === '28套餐') return 28
  return 88
}

function accountFeeOptions(accountTag, row, stock) {
  const overrideFee = senasicAccountFeeOverride(row, stock)
  if (overrideFee !== null) return [overrideFee]
  if (accountTag === '现金' || accountTag === '不打') return [0]
  if (accountTag === '28套餐') return [28]
  return feeOptions
}

function makeManualKey(row, stock) {
  return `${row.accountKey}-${stock.id}`
}

function extractStockConfig(text, fallback) {
  const safeText = text || ''
  const namePattern = fallback.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const blockMatch = safeText.match(new RegExp(`${namePattern}[\\s\\S]*?(?=\\n[^\\n：:]{2,20}[：:]|$)`))
  const block = blockMatch?.[0] || safeText
  const priceMatch = block.match(/发行价\s*([0-9]+(?:\.[0-9]+)?)/)
  const lotMatch = block.match(/每手\s*([0-9,，]+)\s*股/)
  const codeMatch = block.match(/(?:HK|AH)?[：:\s]*([0-9]{4,5})/)

  return {
    ...fallback,
    code: codeMatch?.[1] || fallback.code,
    ipoPrice: priceMatch ? Number(priceMatch[1]) : fallback.ipoPrice,
    lotShares: lotMatch ? Number(lotMatch[1].replace(/[，,]/g, '')) : fallback.lotShares,
  }
}

function planByRule(stock, remainingCash, accountFee, leverage = 1, reserveCash = 0, accountRow = null) {
  const strategy = stockStrategy(stock)
  const { costPrice, lotCost } = stockCost(stock)
  const activeLeverage = clampLeverage(leverage)
  const availableCash = Math.max(0, remainingCash - reserveCash)
  const remainingPower = availableCash * activeLeverage
  const affordableLots = matchAffordableLotCount(remainingPower, stock)
  const fallbackFee = strategy.fixedFee === undefined ? accountFee : strategy.fixedFee
  let targetAmount = remainingPower
  let maxLots = affordableLots
  let autoLots = matchAffordableLotCount(remainingPower, stock, affordableLots)
  let subscriptionFee = fallbackFee
  let ruleNote = strategy.desc

  if (stock.rule === 'liuliumei_6658') {
    const tag = accountIpoTag(accountRow, stock)
    const targetLotsByTag = {
      甲尾: 1000,
      乙头: 1500,
    }
    const targetLots = targetLotsByTag[tag] || affordableLots
    const targetTier = stockTierByLots(stock, targetLots)
    targetAmount = targetTier?.amount || remainingPower
    maxLots = Math.min(targetLots, affordableLots)
    autoLots = matchAffordableLotCount(remainingPower, stock, maxLots)
    subscriptionFee = tag === '现金' ? 0 : 88
    ruleNote = tag === '现金'
      ? '现金账户：不收手续费，按账户现金申购，自动落到招股书合法档位'
      : `${tag}账户：目标${fmt(targetTier?.shares || targetLots * Number(stock.lotShares || 0), 0)}股，10倍融资，资金不足则自动降到可承受合法档位`
  } else if (stock.rule === 'senasic_6675') {
    const tag = accountIpoTag(accountRow, stock)
    if (tag === '不打') {
      targetAmount = 0
      maxLots = 0
      autoLots = 0
      subscriptionFee = 0
      ruleNote = '4号/7号账户已退，不参与本轮申购'
    } else if (tag === '28套餐') {
      const fee28Lots = 10
      const fee28Tier = stockTierByLots(stock, fee28Lots)
      targetAmount = fee28Tier?.amount || fee28Lots * lotCost
      maxLots = fee28Lots
      autoLots = fee28Lots
      subscriptionFee = accountFee
      ruleNote = '10万以下本金：28套餐，按10手/2,000股/37,090.32港元档执行'
    } else {
      targetAmount = remainingPower
      maxLots = affordableLots
      autoLots = matchAffordableLotCount(remainingPower, stock, affordableLots)
      subscriptionFee = accountFee
      ruleNote = '10万以上本金：全部融资打，按10倍购买力取不超过购买力的招股书最高档位'
    }
  } else if (stock.rule === 'tianchen_full') {
    targetAmount = remainingPower
    maxLots = affordableLots
    autoLots = matchAffordableLotCount(remainingPower, stock, maxLots)
    subscriptionFee = accountFee
    ruleNote = '全力打按当前可用融资额度匹配招股书合法档位'
  } else if (stock.rule === 'longfeng_after_tianchen') {
    if (remainingCash >= 30000) {
      autoLots = matchAffordableLotCount(remainingPower, stock)
      subscriptionFee = accountFee
      ruleNote = '天辰打完后，剩余现金3万以上按招股书档位全部打龙丰'
    } else {
      const fee28Lots = 14
      const fee28Tier = stockTierByLots(stock, fee28Lots)
      targetAmount = Math.min(fee28Tier?.amount || fee28Lots * lotCost, remainingPower)
      maxLots = Math.min(fee28Lots, affordableLots)
      autoLots = matchAffordableLotCount(remainingPower, stock, maxLots)
      subscriptionFee = autoLots > 0 ? 28 : 0
      ruleNote = '天辰打完后，剩余现金3万以下按28套餐，最多14手，并落到招股书合法档位'
    }
  } else if (stock.rule === 'dajin_remaining') {
    const sevenLotsTier = stockTierByLots(stock, 7)
    const sevenLotsCost = sevenLotsTier?.amount || 7 * lotCost
    if (matchAffordableLotCount(remainingPower, stock, 7) >= 7) {
      targetAmount = sevenLotsCost
      maxLots = Math.min(7, affordableLots)
      autoLots = matchAffordableLotCount(remainingPower, stock, maxLots)
      subscriptionFee = 28
      ruleNote = '剩余额度按大金28套餐7手，并使用招股书档位金额'
    } else {
      const oneLotTier = stockTierByLots(stock, 1)
      targetAmount = oneLotTier?.amount || lotCost
      maxLots = affordableLots >= 1 ? 1 : 0
      autoLots = matchAffordableLotCount(remainingPower, stock, maxLots)
      subscriptionFee = 0
      ruleNote = '剩余额度不足7手时，大金先打一手，按招股书档位金额计算'
    }
  }

  return {
    strategy,
    costPrice,
    lotCost,
    targetAmount,
    maxLots,
    autoLots,
    subscriptionFee,
    ruleNote,
  }
}

export default function IpoTemplate() {
  const navigate = useNavigate()
  const [stocks, setStocks] = useState(defaultStocks)
  const [tiers, setTiers] = useState(defaultTiers)
  const [accountsText, setAccountsText] = useState(defaultAccounts)
  const [strategyPrompt, setStrategyPrompt] = useState(defaultStrategyPrompt)
  const [manualLots, setManualLots] = useState({})
  const [manualFees, setManualFees] = useState({})
  const [saving, setSaving] = useState(false)

  const updateStock = (index, key, value) => {
    setStocks(current => current.map((stock, idx) => {
      if (idx !== index) return stock
      if (['lotShares', 'ipoPrice'].includes(key)) return { ...stock, [key]: Number(value) }
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
    setManualLots(current => ({ ...current, [key]: matchAllowedLotCount(capped, stockPlan.stock) }))
  }

  const stepManualRowLots = (row, stockPlan, direction) => {
    const key = makeManualKey(row, stockPlan.stock)
    setManualLots(current => {
      const base = current[key] ?? stockPlan.lots
      const nextLots = adjacentAllowedLotCount(base, direction, stockPlan.stock)
      return { ...current, [key]: matchAllowedLotCount(Math.min(nextLots, stockPlan.maxLots), stockPlan.stock) }
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

  const handleGenerateFromStrategy = () => {
    setStocks(defaultStocks.map(stock => extractStockConfig(strategyPrompt, stock)))
    setAccountsText(defaultAccounts)
    setManualLots({})
    setManualFees({})
    window.requestAnimationFrame(() => {
      document.getElementById('ipo-template-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const rows = useMemo(() => {
    const primaryStock = stocks[0]
    return parseAccounts(accountsText).filter(row => !shouldSkipAccount(row, primaryStock)).map(row => {
      const accountKey = `${row.code}-${row.name}-${row.index}`
      const tier = matchTier(row.capital, tiers)
      const leverage = accountLeverage(row, tier, primaryStock)
      const accountTag = accountIpoTag(row, primaryStock)
      const tierFee = accountDefaultFee(accountTag, row, primaryStock)
      const subscriptionFee = manualFees[accountKey] ?? tierFee
      const buyingPower = row.capital * leverage
      let remainingCash = row.capital
      const stockPlans = stocks.map(stock => {
        const autoPlan = planByRule(stock, remainingCash, subscriptionFee, leverage, 0, row)
        const planKey = makeManualKey({ accountKey }, stock)
        const manualLotsValue = manualLots[planKey]
        const lots = matchAllowedLotCount(Math.min(manualLotsValue ?? autoPlan.autoLots, autoPlan.maxLots), stock)
        const applicationTier = stockTierByLots(stock, lots)
        const shares = applicationTier?.shares || lots * Number(stock.lotShares || 0)
        const applicationAmount = applicationTier?.amount || lots * autoPlan.lotCost
        const cashAmount = leverage > 0 ? applicationAmount / leverage : applicationAmount
        remainingCash = Math.max(0, remainingCash - cashAmount)

        return {
          stock,
          applicationTier,
          strategy: autoPlan.strategy,
          costPrice: autoPlan.costPrice,
          lotCost: autoPlan.lotCost,
          targetAmount: autoPlan.targetAmount,
          maxLots: autoPlan.maxLots,
          autoLots: autoPlan.autoLots,
          lots,
          shares,
          applicationAmount,
          cashAmount,
          subscriptionFee: autoPlan.subscriptionFee,
          ruleNote: autoPlan.ruleNote,
        }
      })
      const usedAmount = stockPlans.reduce((sum, plan) => sum + plan.cashAmount, 0)

      return {
        ...row,
        accountKey,
        leverage,
        subscriptionFee,
        tierFee,
        buyingPower,
        usedAmount,
        remainingPower: remainingCash,
        stockPlans,
        strategy: `${accountTag}账户；实际${leverage}倍；账户费${subscriptionFee}`,
        accountTag,
      }
    })
  }, [accountsText, manualFees, manualLots, stocks, tiers])

  const stockTotals = stocks.map(stock => {
    const plans = rows.map(row => row.stockPlans.find(plan => plan.stock.id === stock.id)).filter(Boolean)
    return {
      stock,
      targetAmount: plans.reduce((sum, plan) => sum + plan.targetAmount, 0),
      lots: plans.reduce((sum, plan) => sum + plan.lots, 0),
      shares: plans.reduce((sum, plan) => sum + plan.shares, 0),
      applicationAmount: plans.reduce((sum, plan) => sum + plan.applicationAmount, 0),
      cashAmount: plans.reduce((sum, plan) => sum + plan.cashAmount, 0),
      subscriptionFee: plans.reduce((sum, plan) => sum + plan.subscriptionFee, 0),
    }
  })

  const totalSubscriptionFee = stockTotals.reduce((sum, item) => sum + item.subscriptionFee, 0)
  const totals = rows.reduce((sum, row) => ({
    capital: sum.capital + row.capital,
    buyingPower: sum.buyingPower + row.buyingPower,
    usedAmount: sum.usedAmount + row.usedAmount,
    remainingPower: sum.remainingPower + row.remainingPower,
  }), { capital: 0, buyingPower: 0, usedAmount: 0, remainingPower: 0 })

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
        subscription_fee: plan.subscriptionFee,
        winning_fee: 0,
        stamp_formula: '',
        stamp_duty: 0,
        sell_commission: 0,
        settlement_fee: 0,
        transaction_tax: 0,
        total_fee: plan.subscriptionFee,
        cost_price: costPrice,
        sell_price: '',
        sold: '',
        sell_amount: 0,
        trading_profit: 0,
        ipo_profit: -plan.subscriptionFee,
        application_amount: plan.applicationAmount,
        target_amount: plan.targetAmount,
        prospectus_tier_shares: plan.applicationTier?.shares || plan.shares,
        prospectus_tier_amount: plan.applicationTier?.amount || plan.applicationAmount,
        leverage: row.leverage,
        strategy: `${row.strategy}；大致策略：${plan.strategy.label}`,
        allocation_rule: plan.ruleNote,
      }
    })
    const planTotal = stockTotals.find(item => item.stock.id === stock.id)

    return {
      source: 'ipo-template',
      mode: `${stock.rule || stock.strategy || 'custom'}-capital-plan`,
      imported_at: new Date().toISOString(),
      lot_shares: Number(stock.lotShares || 0),
      ipo_price: Number(stock.ipoPrice || 0),
      cost_price: costPrice,
      lot_cost: lotCost,
      strategy: stock.strategy,
      strategy_label: stockStrategy(stock).label,
      fee_rule: {
        sell_commission: 75,
        settlement_fee: 2,
        transaction_tax: 3,
      },
      application_tiers: stockApplicationTiers(stock),
      tiers,
      applications,
      summary: {
        accounts: rows.length,
        total_capital: totals.capital,
        total_buying_power: totals.buyingPower,
        total_lots: planTotal?.lots || 0,
        total_shares_applied: planTotal?.shares || 0,
        total_application_amount: planTotal?.applicationAmount || 0,
        total_subscription_fee: planTotal?.subscriptionFee || 0,
        total_fee: planTotal?.subscriptionFee || 0,
        total_shares_won: 0,
        total_won_amount: 0,
        total_sell_amount: 0,
        trading_profit: 0,
        ipo_profit: -(planTotal?.subscriptionFee || 0),
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
          subscription_start: stock.subscriptionStart || '2026-06-09',
          subscription_end: stock.subscriptionEnd || '2026-06-12 12:00',
          listing_date: stock.listingDate || '2026-06-17',
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
            已按 SENASIC（6675）预填：4号/7号不打，10万以上全部融资，10万以下28套餐。
          </p>
        </div>
      </div>

      <section className="template-panel">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">SENASIC 资金规划</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            SENASIC 已填好发行价、每手股数、完整招股书档位和默认策略。
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
                    <span>大致策略</span>
                    <select value={stock.strategy} onChange={e => updateStock(index, 'strategy', e.target.value)}>
                      {Object.entries(stockStrategies).map(([key, strategy]) => (
                        <option key={key} value={key}>{strategy.label}</option>
                      ))}
                    </select>
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
                  <label className="template-field col-span-2">
                    <span>招股书档位表（股份数 / 应付金额）</span>
                    <textarea
                      className="template-tier-textarea"
                      value={applicationTierText(stock)}
                      onChange={e => updateStock(index, 'applicationTiersText', e.target.value)}
                      spellCheck={false}
                      placeholder={'例如：\n200 19,405.85\n400 38,811.70'}
                    />
                  </label>
                </div>
                <div className="template-strategy-desc">
                  {stockStrategy(stock).desc}；已识别 {stockApplicationTiers(stock).length} 个招股书档位。
                </div>
                <div className="template-stock-stats">
                  <span>目标资金 {fmt(total?.targetAmount || 0, 0)}</span>
                  <span>占用资金 {fmt(total?.cashAmount || 0, 0)}</span>
                  <span>总手数 {fmt(total?.lots || 0, 0)}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="template-rule mt-4">
          <div>SENASIC：发行价 18.36 港元，每手 200 股，一手入场费 3,709.04 港元。</div>
          <div>4号、7号账户已退：不参与本轮申购。</div>
          <div>10万以上本金：全部融资打，按10倍购买力取不超过购买力的招股书最高档位，融资费 88。</div>
          <div>10万以下本金：28套餐，按10手 / 2,000股 / 37,090.32港元档执行，手续费 28。</div>
        </div>
        <div className="template-strategy-runner">
          <label className="template-field">
            <span>打新策略</span>
            <textarea
              className="template-strategy-input"
              value={strategyPrompt}
              onChange={e => setStrategyPrompt(e.target.value)}
              spellCheck={false}
            />
          </label>
          <button type="button" className="template-run-button" onClick={handleGenerateFromStrategy}>
            一键启动 OpenClaw 制作表格
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 mt-4">
        <section className="template-panel">
          <h2 className="font-semibold mb-3">成本规则</h2>
          <div className="template-rule">
            <div>成本价 = IPO 价格 × 1.01</div>
            <div>每行认购手数只能落到招股书档位表里存在的档位；调整后按该档位的“应付金额”重算申请金额。</div>
            <div>全力打、重点打沿用账户手续费档位；68套餐、28套餐、免费餐分别按固定费用计算。</div>
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

      <section id="ipo-template-result" className="template-panel mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">资金分界与手续费标准</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              4号/7号不打；10万以上10倍融资并收88融资费；10万以下按28套餐。
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
          <h2 className="font-semibold">认购总览</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            总账户资金 {fmt(totals.capital, 0)}；可认购资金 {fmt(totals.buyingPower, 0)}；实际占用 {fmt(totals.usedAmount, 0)}
          </div>
        </div>
        <div className="template-summary-grid">
          {stockTotals.map(item => (
            <div key={item.stock.id} className="template-summary-item">
              <div className="template-summary-name">{item.stock.name || '未命名股票'}</div>
              <div>大致策略：{stockStrategy(item.stock).label}</div>
              <div>目标资金：{fmt(item.targetAmount, 0)}</div>
              <div>认购金额：{fmt(item.applicationAmount, 0)}</div>
              <div>占用资金：{fmt(item.cashAmount, 0)}</div>
              <div>总手数：{fmt(item.lots, 0)} 手</div>
              <div>申购费：{fmt(item.subscriptionFee, 0)}</div>
            </div>
          ))}
          <div className="template-summary-item">
            <div className="template-summary-name">剩余现金</div>
            <div>未用现金：{fmt(totals.remainingPower, 0)}</div>
            <div>申购费合计：{fmt(totalSubscriptionFee, 0)}</div>
            <div>资金使用率：{totals.capital ? fmt((totals.usedAmount / totals.capital) * 100, 1) : 0}%</div>
          </div>
        </div>
      </section>

      <section className="template-panel mt-4">
        <div className="flex flex-wrap justify-between gap-2 mb-3">
          <h2 className="font-semibold">逐账户拆分表</h2>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            每个账户可调手数；自动值已按“SENASIC 10万分界 + 28套餐 + 4/7不打”生成。
          </div>
        </div>
        <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full min-w-[2200px] text-xs ipo-import-table">
            <thead>
              <tr>
                <th className="text-left px-2 py-2">序号</th>
                <th className="text-left px-2 py-2">手机编号</th>
                <th className="text-left px-2 py-2">姓名</th>
                <th className="text-left px-2 py-2">账户类型</th>
                <th className="text-left px-2 py-2">账户资金</th>
                <th className="text-left px-2 py-2">融资倍数</th>
                <th className="text-left px-2 py-2">账户费档</th>
                <th className="text-left px-2 py-2">可认购资金</th>
                {stocks.map(stock => (
                  <React.Fragment key={stock.id}>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}目标</th>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}手数</th>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}占用资金</th>
                    <th className="text-left px-2 py-2">{stock.name || '股票'}费用</th>
                  </React.Fragment>
                ))}
                <th className="text-left px-2 py-2">实际占用</th>
                <th className="text-left px-2 py-2">剩余现金</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={`${row.index}-${row.code}`}>
                  <td className="px-2 py-1.5">{row.index}</td>
                  <td className="px-2 py-1.5">{row.code}</td>
                  <td className="px-2 py-1.5">{row.name || '-'}</td>
                  <td className="px-2 py-1.5">{row.accountTag}</td>
                  <td className="px-2 py-1.5">{fmt(row.capital, 0)}</td>
                  <td className="px-2 py-1.5">{fmt(row.leverage, 0)}</td>
	                  <td className="px-2 py-1.5">
	                    <div className="template-fee-control">
	                      <select value={row.subscriptionFee} onChange={e => setManualRowFee(row, e.target.value)}>
	                        {accountFeeOptions(row.accountTag, row, stocks[0]).map(fee => <option key={fee} value={fee}>{fee}</option>)}
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
                        <div className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          {fmt(plan.shares, 0)} 股 / 档位 {fmt(plan.applicationAmount, 2)}
                        </div>
                      </td>
                      <td className="px-2 py-1.5">{fmt(plan.cashAmount, 0)}</td>
                      <td className="px-2 py-1.5">{fmt(plan.subscriptionFee, 0)}</td>
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
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.capital, 0)}</td>
                <td />
                <td />
                <td className="px-2 py-2 font-semibold">{fmt(totals.buyingPower, 0)}</td>
                {stockTotals.map(item => (
                  <React.Fragment key={item.stock.id}>
                    <td className="px-2 py-2 font-semibold">{fmt(item.targetAmount, 0)}</td>
                    <td className="px-2 py-2 font-semibold">{fmt(item.lots, 0)}</td>
                    <td className="px-2 py-2 font-semibold">{fmt(item.cashAmount, 0)}</td>
                    <td className="px-2 py-2 font-semibold">{fmt(item.subscriptionFee, 0)}</td>
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
            {saving ? '正在导入...' : '确认无误，导入 IPO 打新'}
          </button>
        </div>
      </section>
    </div>
  )
}
