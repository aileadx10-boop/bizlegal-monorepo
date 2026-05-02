import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '@/lib/covalent'
import { calculateRisk } from '@/lib/risk-engine'
import { generatePreview } from '@/lib/ai-prompts'
import { supabaseAdmin } from '@/lib/supabase'
import { sendLeadCapture } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { wallet, network = 'ethereum', email } = await req.json()

  if (!wallet || typeof wallet !== 'string') {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }

  try {
    const [txs] = await Promise.all([getTransactions(wallet.trim(), network)])

    if (txs.length === 0) {
      return NextResponse.json({
        error: 'No on-chain data found for this address. The blockchain API may be unavailable or the wallet has no recorded transactions on this network.',
        riskScore: 0,
        riskLevel: 'Unknown',
        preview: null,
        flags: [],
        flagCount: 0,
        metrics: { totalTransactions: 0, uniqueCounterparties: 0, firstSeen: 'N/A', totalVolumeETH: 0 },
        fullReportAvailable: false,
        dataSource: 'none',
      }, { status: 200 })
    }

    const risk = calculateRisk(txs)
    const preview = await generatePreview(wallet.trim(), risk)

    // Save lead to DB
    if (email) {
      await supabaseAdmin.from('tracr_wallet_leads').insert({
        email,
        wallet_address: wallet.trim(),
        network,
        risk_score: risk.score,
        risk_level: risk.level,
        ip_address: req.headers.get('x-forwarded-for') ?? undefined,
      })

      // Send lead capture email (fire-and-forget)
      sendLeadCapture({ to: email, wallet: wallet.trim(), riskScore: risk.score, riskLevel: risk.level }).catch(console.error)
    }

    // Return partial results — full report requires payment
    return NextResponse.json({
      riskScore: risk.score,
      riskLevel: risk.level,
      preview,
      flags: risk.flags.slice(0, 3),          // show 3 free flags
      flagCount: risk.flags.length,
      metrics: {
        totalTransactions: risk.metrics.totalTransactions,
        uniqueCounterparties: risk.metrics.uniqueCounterparties,
        firstSeen: risk.metrics.firstSeen,
        totalVolumeETH: Number(risk.metrics.totalVolumeETH.toFixed(4)),
      },
      fullReportAvailable: true,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[analyze]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
