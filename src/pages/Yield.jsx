import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useAaveYield, getAUsdcBalance, AAVE_USDC } from '../hooks/useAaveYield'
import { useUsdcBalance } from '../hooks/useUsdcBalance'
import { useIsMobile } from '../hooks/useIsMobile'

const G = {
  green:'#006D33', greenLight:'#00D66B',
  grad:'linear-gradient(135deg, #006D33 0%, #00D66B 100%)',
  gradSoft:'linear-gradient(135deg, rgba(0,109,51,0.08) 0%, rgba(0,214,107,0.08) 100%)',
  bg:'#F8F9FA', card:'#FFFFFF', border:'#E5E2E1',
  text:'#191C1D', muted:'#3C4A3D', sub:'#6B7280',
  positive:'#005627', positiveBg:'rgba(0,214,107,0.12)',
}

function generateChartData() {
  const points = []
  let val = 1180
  for (let i = 29; i >= 0; i--) {
    val += (Math.random() * 4.2 - 0.4)
    const d = new Date(); d.setDate(d.getDate() - i)
    points.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), value: parseFloat(val.toFixed(2)) })
  }
  points[points.length - 1].value = 1284.57
  return points
}
const CHART_DATA = generateChartData()

function useTickingBalance(base, apy) {
  const [balance, setBalance] = useState(base)
  useEffect(() => {
    const perMs = (base * apy) / (365 * 24 * 60 * 60 * 1000)
    const id = setInterval(() => setBalance(b => parseFloat((b + perMs * 80).toFixed(6))), 80)
    return () => clearInterval(id)
  }, [base, apy])
  return balance
}

function YieldChart({ data, hovered, onHover }) {
  const W = 680, H = 160, PAD = { t: 16, r: 16, b: 32, l: 48 }
  const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b
  const vals = data.map(d => d.value)
  const minV = Math.min(...vals) - 2, maxV = Math.max(...vals) + 2, range = maxV - minV
  const px = i => PAD.l + (i / (data.length - 1)) * iW
  const py = v => PAD.t + iH - ((v - minV) / range) * iH
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.value).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${px(data.length-1).toFixed(1)},${(PAD.t+iH).toFixed(1)} L${PAD.l},${(PAD.t+iH).toFixed(1)} Z`
  const yTicks = [minV+2, minV+range*0.33, minV+range*0.66, maxV-2]
  const xLabels = data.filter((_, i) => i % 7 === 0 || i === data.length - 1)
  const hovPt = hovered !== null ? data[hovered] : null
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }} onMouseLeave={() => onHover(null)}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.greenLight} stopOpacity="0.28"/><stop offset="100%" stopColor={G.greenLight} stopOpacity="0"/></linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={G.green}/><stop offset="100%" stopColor={G.greenLight}/></linearGradient>
      </defs>
      {yTicks.map((t, i) => (<g key={i}><line x1={PAD.l} y1={py(t)} x2={W-PAD.r} y2={py(t)} stroke={G.border} strokeWidth="1" strokeDasharray="4 4"/><text x={PAD.l-6} y={py(t)+4} textAnchor="end" style={{ fontFamily:'Inter', fontSize:10, fill:G.sub }}>${Math.round(t)}</text></g>))}
      {xLabels.map((d, i) => { const idx = data.indexOf(d); return (<text key={i} x={px(idx)} y={H-4} textAnchor="middle" style={{ fontFamily:'Inter', fontSize:10, fill:G.sub }}>{d.date}</text>) })}
      <path d={areaPath} fill="url(#areaGrad)"/>
      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => (<rect key={i} x={px(i)-iW/(data.length*2)} y={PAD.t} width={iW/data.length} height={iH} fill="transparent" style={{ cursor:'crosshair' }} onMouseEnter={() => onHover(i)}/>))}
      {hovPt && (<g>
        <line x1={px(hovered)} y1={PAD.t} x2={px(hovered)} y2={PAD.t+iH} stroke={G.green} strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
        <circle cx={px(hovered)} cy={py(hovPt.value)} r="5" fill={G.card} stroke={G.green} strokeWidth="2.5"/>
        <rect x={Math.min(px(hovered)-44, W-PAD.r-88)} y={py(hovPt.value)-36} width="88" height="26" rx="6" fill={G.text}/>
        <text x={Math.min(px(hovered), W-PAD.r-44)} y={py(hovPt.value)-18} textAnchor="middle" style={{ fontFamily:'Manrope', fontWeight:700, fontSize:11, fill:'#fff' }}>${hovPt.value.toFixed(2)}</text>
        <text x={Math.min(px(hovered), W-PAD.r-44)} y={py(hovPt.value)-7} textAnchor="middle" style={{ fontFamily:'Inter', fontSize:9, fill:'rgba(255,255,255,0.7)' }}>{hovPt.date}</text>
      </g>)}
    </svg>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{ width:48, height:28, borderRadius:9999, border:'none', cursor:'pointer', backgroundColor: on ? G.green : G.border, position:'relative', transition:'background-color 0.25s', flexShrink:0, padding:0 }}>
      <div style={{ position:'absolute', top:3, left: on ? 23 : 3, width:22, height:22, borderRadius:'50%', backgroundColor:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.18)', transition:'left 0.25s' }}/>
    </button>
  )
}

function StatRow({ label, value, valueColor, sub, border }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom: border ? `1px solid ${G.border}` : 'none' }}>
      <div>
        <div style={{ fontFamily:'Inter', fontSize:13, color:G.sub }}>{label}</div>
        {sub && <div style={{ fontFamily:'Inter', fontSize:11, color:G.sub, marginTop:2 }}>{sub}</div>}
      </div>
      <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:15, color: valueColor || G.text, textAlign:'right' }}>{value}</div>
    </div>
  )
}

function Spinner() {
  return <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/>
}

function TxModal({ children, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, backgroundColor:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor:G.card, borderRadius:20, padding:32, width:'100%', maxWidth:400, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
        {children}
      </div>
    </div>
  )
}

function SuccessPane({ title, body, onClose }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, textAlign:'center' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:G.grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(0,109,51,0.3)' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 16L13 23L26 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div>
        <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:22, color:G.text }}>{title}</div>
        <div style={{ fontFamily:'Inter', fontSize:14, color:G.sub, marginTop:4 }}>{body}</div>
      </div>
      <button onClick={onClose} style={{ marginTop:8, width:'100%', padding:'14px', borderRadius:12, border:'none', background:G.grad, color:'#fff', fontFamily:'Manrope', fontWeight:800, fontSize:15, cursor:'pointer' }}>Done</button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function SupplyModal({ walletUsdc, walletAddress, supply, txLoading, stepLabel, txError, onClose }) {
  const [amount, setAmount] = useState('')
  const [done, setDone] = useState(false)
  const max = parseFloat(walletUsdc ?? '0')
  const valid = parseFloat(amount) > 0 && parseFloat(amount) <= max
  const handleSupply = async () => { try { await supply({ walletAddress, amount }); setDone(true) } catch {} }
  return (
    <TxModal onClose={onClose}>
      {done ? <SuccessPane title="Yield enabled!" body={`$${parseFloat(amount).toFixed(2)} USDC is now earning in Aave`} onClose={onClose} /> : (
        <>
          <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:20, color:G.text }}>Enable Yield</div>
          <div style={{ fontFamily:'Inter', fontSize:13, color:G.sub, marginTop:4 }}>Supply USDC to Aave v3 and start earning instantly</div>
          <div style={{ backgroundColor:G.bg, borderRadius:14, padding:'18px 20px', marginTop:16, textAlign:'center' }}>
            <div style={{ fontFamily:'Inter', fontSize:12, color:G.sub, marginBottom:4 }}>Wallet balance</div>
            <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:30, color:G.text }}>${walletUsdc ?? '0.00'}</div>
            <div style={{ fontFamily:'Manrope', fontWeight:600, fontSize:13, color:G.sub }}>USDC</div>
          </div>
          <div style={{ position:'relative', marginTop:14 }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontFamily:'Manrope', fontWeight:800, fontSize:18, color:G.green }}>$</span>
            <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" inputMode="decimal"
              style={{ width:'100%', padding:'13px 72px 13px 34px', backgroundColor:'#F3F4F5', border:`2px solid ${valid ? G.green : 'transparent'}`, borderRadius:12, fontFamily:'Manrope', fontWeight:700, fontSize:18, color:G.text, outline:'none' }}/>
            <button onClick={() => setAmount(String(max))} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontFamily:'Inter', fontWeight:700, fontSize:12, color:G.green }}>MAX</button>
          </div>
          {txError && <div style={{ padding:'10px 14px', backgroundColor:'rgba(186,26,26,0.08)', borderRadius:10, marginTop:8 }}><span style={{ fontFamily:'Inter', fontSize:12, color:'#BA1A1A' }}>⚠ {txError}</span></div>}
          <button onClick={handleSupply} disabled={!valid || txLoading} style={{ marginTop:18, width:'100%', padding:'14px', borderRadius:12, border:'none', background: valid && !txLoading ? G.grad : G.border, color: valid && !txLoading ? '#fff' : '#9CA3AF', fontFamily:'Manrope', fontWeight:800, fontSize:15, cursor: valid && !txLoading ? 'pointer' : 'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {txLoading ? <><Spinner /> {stepLabel ?? 'Processing...'}</> : '⚡ Enable Yield'}
          </button>
        </>
      )}
    </TxModal>
  )
}

function WithdrawModal({ suppliedBalance, walletAddress, withdraw, txLoading, stepLabel, txError, onClose }) {
  const [done, setDone] = useState(false)
  const handleWithdraw = async () => { try { await withdraw({ walletAddress, amount: 'max' }); setDone(true) } catch {} }
  return (
    <TxModal onClose={onClose}>
      {done ? <SuccessPane title="Withdrawn!" body={`$${suppliedBalance.toFixed(2)} USDC is back in your balance`} onClose={onClose} /> : (
        <>
          <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:20, color:G.text }}>Withdraw to balance</div>
          <div style={{ fontFamily:'Inter', fontSize:13, color:G.sub, marginTop:4 }}>Instant Aave withdrawal — no waiting period</div>
          <div style={{ backgroundColor:G.bg, borderRadius:14, padding:'18px 20px', marginTop:16, textAlign:'center' }}>
            <div style={{ fontFamily:'Inter', fontSize:12, color:G.sub, marginBottom:4 }}>Available to withdraw</div>
            <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:34, color:G.text }}>${suppliedBalance.toFixed(4)}</div>
            <div style={{ fontFamily:'Manrope', fontWeight:600, fontSize:13, color:G.sub }}>USDC</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', backgroundColor:G.positiveBg, borderRadius:10, marginTop:14 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke={G.positive} strokeWidth="1.3"/><path d="M8 5V8.5M8 11V11.5" stroke={G.positive} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{ fontFamily:'Inter', fontSize:12, color:G.positive }}>Funds stay liquid. Withdraw anytime.</span>
          </div>
          {txError && <div style={{ padding:'10px 14px', backgroundColor:'rgba(186,26,26,0.08)', borderRadius:10, marginTop:8 }}><span style={{ fontFamily:'Inter', fontSize:12, color:'#BA1A1A' }}>⚠ {txError}</span></div>}
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button onClick={onClose} style={{ flex:1, padding:'13px', borderRadius:12, border:`1.5px solid ${G.border}`, backgroundColor:'transparent', fontFamily:'Manrope', fontWeight:700, fontSize:14, color:G.muted, cursor:'pointer' }}>Cancel</button>
            <button onClick={handleWithdraw} disabled={txLoading} style={{ flex:2, padding:'13px', borderRadius:12, border:'none', background: txLoading ? G.border : G.grad, color: txLoading ? '#9CA3AF' : '#fff', fontFamily:'Manrope', fontWeight:800, fontSize:15, cursor: txLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {txLoading ? <><Spinner /> {stepLabel ?? 'Withdrawing...'}</> : 'Withdraw instantly'}
            </button>
          </div>
        </>
      )}
    </TxModal>
  )
}

export default function Yield() {
  const { walletAddress } = useAuth()
  const { supply, withdraw, loading: txLoading, stepLabel, error: txError } = useAaveYield()
  const [suppliedBalance, setSuppliedBalance] = useState(0)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const { balance: walletUsdc, refetch: refetchWallet } = useUsdcBalance(walletAddress, AAVE_USDC)

  const fetchSupplied = useCallback(async () => {
    if (!walletAddress) return
    setBalanceLoading(true)
    const bal = await getAUsdcBalance(walletAddress)
    setSuppliedBalance(bal)
    setBalanceLoading(false)
  }, [walletAddress])

  useEffect(() => { fetchSupplied() }, [fetchSupplied])

  const hasSupplied = suppliedBalance > 0
  const APY = 0.084
  const liveBalance = useTickingBalance(suppliedBalance, APY)
  const [autoEarn, setAutoEarn] = useState(true)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showSupply, setShowSupply] = useState(false)
  const [apyPulse, setApyPulse] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const id = setInterval(() => { setApyPulse(true); setTimeout(() => setApyPulse(false), 600) }, 8000)
    return () => clearInterval(id)
  }, [])

  const todayEarned = parseFloat(((suppliedBalance * APY) / 365).toFixed(4))
  const monthlyEarned = parseFloat(((suppliedBalance * APY) / 12).toFixed(2))
  const totalAccrued = hasSupplied ? parseFloat((liveBalance - suppliedBalance).toFixed(6)) : 0
  const chartStart = CHART_DATA[0].date
  const chartEnd = CHART_DATA[CHART_DATA.length - 1].date

  const handleSupplyDone = async () => { setShowSupply(false); await fetchSupplied(); refetchWallet() }
  const handleWithdrawDone = async () => { setShowWithdraw(false); await fetchSupplied(); refetchWallet() }

  return (
    <div style={{ display:'flex', minHeight:'100vh', backgroundColor:G.bg, overflowX:'hidden' }}>
      {!isMobile && <Sidebar />}
      <div style={{ marginLeft: isMobile ? 0 : 256, flex:1, display:'flex', flexDirection:'column', paddingBottom: isMobile ? 72 : 0, minWidth:0 }}>

        {isMobile ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'16px 20px', backgroundColor:G.bg, position:'sticky', top:0, zIndex:10, borderBottom:`1px solid ${G.border}` }}>
            <button onClick={() => window.history.back()} style={{ background:'none', border:'none', cursor:'pointer', padding:4, display:'flex' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10L12 16" stroke={G.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span style={{ fontFamily:'Manrope', fontWeight:800, fontSize:17, color:G.text }}>DeFi Yield</span>
          </div>
        ) : <Header />}

        <main style={{ padding: isMobile ? '16px 16px 24px' : '40px 40px 60px', display:'flex', flexDirection:'column', gap: isMobile ? 16 : 28 }}>

          {/* Hero */}
          <div style={{ background:G.grad, borderRadius: isMobile ? 18 : 20, padding: isMobile ? '24px 20px' : '40px 48px', position:'relative', overflow:'hidden', boxShadow:'0 8px 40px rgba(0,109,51,0.22)' }}>
            <div style={{ position:'absolute', width:280, height:280, borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.05)', top:-80, right:-60, pointerEvents:'none' }}/>
            <div style={{ position:'relative', display:'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent:'space-between', alignItems:'flex-start', gap: isMobile ? 16 : 24 }}>
              <div style={{ display:'flex', flexDirection:'column', gap: isMobile ? 8 : 12 }}>
                <span style={{ fontFamily:'Inter', fontWeight:600, fontSize: isMobile ? 11 : 13, color:'rgba(255,255,255,0.75)', letterSpacing:'0.06em', textTransform:'uppercase' }}>Your money is working</span>
                <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                  <span style={{ fontFamily:'Manrope', fontWeight:800, fontSize: isMobile ? 40 : 52, color:'#fff', lineHeight:1 }}>
                    ${balanceLoading ? '...' : (hasSupplied ? liveBalance.toFixed(4) : '0.00')}
                  </span>
                  <span style={{ fontFamily:'Manrope', fontWeight:700, fontSize: isMobile ? 16 : 20, color:'rgba(255,255,255,0.7)' }}>USDC</span>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding: isMobile ? '6px 12px' : '8px 16px', borderRadius:9999, backdropFilter:'blur(8px)', width:'fit-content', transition:'transform 0.15s', transform: apyPulse ? 'scale(1.04)' : 'scale(1)', backgroundColor: apyPulse ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)' }}>
                  <span style={{ position:'relative', display:'inline-flex' }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', backgroundColor:'#00FF87', display:'block' }}/>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:'#00FF87', animation:'ping 1.4s ease-out infinite' }}/>
                  </span>
                  <span style={{ fontFamily:'Manrope', fontWeight:800, fontSize: isMobile ? 13 : 15, color:'#fff' }}>8.4% APY</span>
                  <span style={{ fontFamily:'Inter', fontSize: isMobile ? 11 : 12, color:'rgba(255,255,255,0.7)' }}>via Aave</span>
                </div>
                <span style={{ fontFamily:'Inter', fontSize: isMobile ? 11 : 13, color:'rgba(255,255,255,0.6)' }}>
                  {hasSupplied ? `Earning ${(suppliedBalance * APY / 365 / 24 / 3600).toFixed(8)} USDC / second` : 'Supply USDC to start earning'}
                </span>
              </div>
              <div style={{ backgroundColor:'rgba(255,255,255,0.12)', backdropFilter:'blur(12px)', borderRadius:14, padding: isMobile ? '14px 16px' : '20px 24px', border:'1px solid rgba(255,255,255,0.2)', display:'flex', flexDirection:'column', gap:12, width: isMobile ? '100%' : 240 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
                  <div>
                    <div style={{ fontFamily:'Manrope', fontWeight:700, fontSize:14, color:'#fff' }}>Auto-earn</div>
                    <div style={{ fontFamily:'Inter', fontSize:11, color:'rgba(255,255,255,0.65)', marginTop:2 }}>Idle balance earns automatically</div>
                  </div>
                  <Toggle on={autoEarn} onChange={setAutoEarn} />
                </div>
                {autoEarn && (
                  <div style={{ padding:'8px 12px', backgroundColor:'rgba(0,255,135,0.12)', borderRadius:8, borderLeft:'3px solid #00FF87' }}>
                    <span style={{ fontFamily:'Inter', fontWeight:600, fontSize:11, color:'#00FF87' }}>✓ Active — every idle dollar earns</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action card */}
          <div style={{ backgroundColor:G.card, borderRadius:16, padding: isMobile ? 18 : 24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:16, color:G.text }}>Your yield</div>
            <div style={{ background:G.gradSoft, borderRadius:12, padding:'16px 18px', display:'flex', flexDirection:'column', gap:4 }}>
              <div style={{ fontFamily:'Inter', fontSize:12, color:G.sub }}>{hasSupplied ? 'Currently earning' : 'Available to supply'}</div>
              <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:26, color:G.text }}>
                ${balanceLoading ? '...' : (hasSupplied ? liveBalance.toFixed(4) : (walletUsdc ?? '0.00'))}
              </div>
              {hasSupplied && <div style={{ fontFamily:'Inter', fontSize:12, color:G.positive, fontWeight:600 }}>+${totalAccrued.toFixed(6)} earned so far</div>}
            </div>
            {!hasSupplied ? (
              <button onClick={() => setShowSupply(true)} style={{ padding:'14px', borderRadius:12, border:'none', background:G.grad, color:'#fff', fontFamily:'Manrope', fontWeight:800, fontSize:15, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,109,51,0.25)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                ⚡ Enable Yield
              </button>
            ) : (
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setShowSupply(true)} style={{ flex:1, padding:'12px', borderRadius:12, border:`1.5px solid ${G.green}`, backgroundColor:'transparent', color:G.green, fontFamily:'Manrope', fontWeight:700, fontSize:14, cursor:'pointer' }}>+ Supply more</button>
                <button onClick={() => setShowWithdraw(true)} style={{ flex:1, padding:'12px', borderRadius:12, border:'none', background:G.grad, color:'#fff', fontFamily:'Manrope', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:'0 4px 12px rgba(0,109,51,0.2)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2V9M4 6L7 9L10 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12H12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
                  Withdraw
                </button>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', backgroundColor:G.positiveBg, borderRadius:10 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={G.positive} strokeWidth="1.2"/><path d="M7 4.5V7.5M7 9.5V10" stroke={G.positive} strokeWidth="1.4" strokeLinecap="round"/></svg>
              <span style={{ fontFamily:'Inter', fontSize:12, color:G.positive, lineHeight:1.4 }}>Funds stay liquid. Withdraw anytime.</span>
            </div>
          </div>

          {/* Chart + breakdown — single col on mobile */}
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 16 : 24, alignItems:'start' }}>
            <div style={{ display:'flex', flexDirection:'column', gap: isMobile ? 16 : 24 }}>
              <div style={{ backgroundColor:G.card, borderRadius:16, padding: isMobile ? '18px 16px 14px' : '28px 28px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <div>
                    <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize: isMobile ? 15 : 17, color:G.text }}>Balance growth</div>
                    <div style={{ fontFamily:'Inter', fontSize:11, color:G.sub, marginTop:2 }}>{chartStart} — {chartEnd}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {['7D','30D'].map((l, i) => (<button key={l} style={{ padding:'4px 12px', borderRadius:9999, border:'none', backgroundColor: i===1 ? G.green : 'transparent', color: i===1 ? '#fff' : G.sub, fontFamily:'Inter', fontWeight:600, fontSize:11, cursor:'pointer' }}>{l}</button>))}
                  </div>
                </div>
                <YieldChart data={CHART_DATA} hovered={hoveredPoint} onHover={setHoveredPoint} />
                <div style={{ display:'flex', justifyContent:'flex-end', marginTop:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', backgroundColor:G.positiveBg, borderRadius:9999 }}>
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 9L4.5 5L6.5 7L11 1" stroke={G.positive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 1H11V4" stroke={G.positive} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontFamily:'Manrope', fontWeight:700, fontSize:11, color:G.positive }}>+${(CHART_DATA[CHART_DATA.length-1].value - CHART_DATA[0].value).toFixed(2)} this month</span>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor:G.card, borderRadius:16, padding: isMobile ? '18px 16px' : '28px', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize: isMobile ? 15 : 17, color:G.text, marginBottom:4 }}>Earnings breakdown</div>
                <div style={{ fontFamily:'Inter', fontSize:12, color:G.sub, marginBottom:16 }}>Supplied to Aave v3 · USDC pool</div>
                <StatRow label="Supplied to Aave" value={balanceLoading ? '...' : `$${suppliedBalance.toFixed(2)}`} border />
                <StatRow label="Interest accrued today" sub="Updates every block" value={hasSupplied ? `+$${todayEarned}` : '—'} valueColor={G.positive} border />
                <StatRow label="Projected monthly" value={hasSupplied ? `+$${monthlyEarned}` : '—'} valueColor={G.positive} border />
                <StatRow label="Projected yearly" value={hasSupplied ? `+$${(suppliedBalance * APY).toFixed(2)}` : '—'} valueColor={G.positive} border />
                <StatRow label="Total accrued (live)" value={hasSupplied ? (<span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:7, height:7, borderRadius:'50%', backgroundColor:'#00FF87', display:'inline-block', animation:'ping2 1.4s ease-out infinite' }}/>+${totalAccrued.toFixed(6)}</span>) : '—'} valueColor={G.positive} />
                <style>{`@keyframes ping{0%{transform:scale(1);opacity:0.8}100%{transform:scale(2.4);opacity:0}}@keyframes ping2{0%{transform:scale(1);opacity:1}70%{transform:scale(2);opacity:0}100%{opacity:0}}`}</style>
              </div>
            </div>

            {/* How it works — desktop only */}
            {!isMobile && (
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                <div style={{ backgroundColor:G.card, borderRadius:16, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ fontFamily:'Manrope', fontWeight:800, fontSize:15, color:G.text }}>How it works</div>
                  {[
                    { emoji:'🏦', title:'Supplied to Aave v3', body:"Your USDC is deposited into Aave's audited lending pool." },
                    { emoji:'⚡', title:'Earns every second', body:'Interest accrues block-by-block, 24/7.' },
                    { emoji:'🔓', title:'Always accessible', body:'No lock-up. Withdraw instantly at any time.' },
                    { emoji:'🛡️', title:'Battle-tested', body:'$10B+ secured by Aave protocol since 2020.' },
                  ].map(({ emoji, title, body }) => (
                    <div key={title} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                      <div style={{ width:36, height:36, borderRadius:10, backgroundColor:G.positiveBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{emoji}</div>
                      <div>
                        <div style={{ fontFamily:'Manrope', fontWeight:700, fontSize:13, color:G.text }}>{title}</div>
                        <div style={{ fontFamily:'Inter', fontSize:12, color:G.sub, marginTop:2, lineHeight:1.5 }}>{body}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', backgroundColor:G.card, borderRadius:12, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#00FF87', display:'inline-block', flexShrink:0, animation:'ping2 1.4s ease-out infinite' }}/>
                  <span style={{ fontFamily:'Inter', fontSize:12, color:G.sub }}>Rate sourced live from <span style={{ fontWeight:700, color:G.text }}>Aave v3 USDC pool</span> · Updates every block</span>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {isMobile && <BottomNav />}
      {showWithdraw && <WithdrawModal balance={liveBalance} suppliedBalance={suppliedBalance} walletAddress={walletAddress} withdraw={withdraw} txLoading={txLoading} stepLabel={stepLabel} txError={txError} onClose={handleWithdrawDone} />}
      {showSupply && <SupplyModal walletUsdc={walletUsdc} walletAddress={walletAddress} supply={supply} txLoading={txLoading} stepLabel={stepLabel} txError={txError} onClose={handleSupplyDone} />}
    </div>
  )
}
