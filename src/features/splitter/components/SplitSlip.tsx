// ============================================
// SplitSlip Component
// ============================================
// A minimal, clean downloadable bill split receipt
// Name: "SplitSlip" - Your shareable bill receipt!
// 
// Uses inline styles with hex colors for html2canvas compatibility

import { forwardRef } from 'react'
import type { UserShare, UserColor } from '@/types'

interface SplitSlipProps {
  userShares: UserShare[]
  subtotal: number
  taxAmount: number
  tipAmount: number
  grandTotal: number
  date?: Date
}

// Color mappings for users
const USER_COLORS: Record<UserColor, { accent: string; light: string }> = {
  emerald: { accent: '#10b981', light: '#d1fae5' },
  blue: { accent: '#3b82f6', light: '#dbeafe' },
  purple: { accent: '#8b5cf6', light: '#ede9fe' },
  rose: { accent: '#f43f5e', light: '#ffe4e6' },
}

export const SplitSlip = forwardRef<HTMLDivElement, SplitSlipProps>(
  function SplitSlip(
    { userShares, subtotal, taxAmount, tipAmount, grandTotal, date = new Date() },
    ref
  ) {
    const formattedDate = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    return (
      <div
        ref={ref}
        style={{
          width: '360px',
          backgroundColor: '#ffffff',
          color: '#333333',
          padding: '20px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '13px',
          lineHeight: '1.4',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981', marginBottom: '2px' }}>
            SplitSlip
          </div>
          <div style={{ fontSize: '11px', color: '#888888' }}>
            {formattedDate}
          </div>
        </div>

        {/* Grand Total */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '16px',
          backgroundColor: '#f0fdf4',
          padding: '16px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '11px', color: '#666666', marginBottom: '4px' }}>Total Bill</div>
          <div style={{ fontSize: '28px', fontWeight: '600', color: '#059669' }}>
            ₹{grandTotal.toFixed(0)}
          </div>
          <div style={{ fontSize: '11px', color: '#888888', marginTop: '2px' }}>
            Split between {userShares.length} {userShares.length === 1 ? 'person' : 'people'}
          </div>
        </div>

        {/* User Shares */}
        <div>
          {userShares.map((share, index) => {
            const colors = USER_COLORS[share.user.color]
            
            return (
              <div
                key={share.user.id}
                style={{
                  padding: '12px',
                  marginBottom: index < userShares.length - 1 ? '8px' : '0',
                  backgroundColor: colors.light,
                  borderRadius: '8px',
                  borderLeft: `3px solid ${colors.accent}`,
                }}
              >
                {/* User Name & Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500', color: '#111111' }}>{share.user.name}</span>
                  <span style={{ fontWeight: '600', color: colors.accent, fontSize: '16px' }}>
                    ₹{share.total.toFixed(0)}
                  </span>
                </div>

                {/* Items */}
                <div>
                  {share.items.map(({ item, quantity, shareAmount }) => {
                    const isRatioSplit = item.quantity === 1 && quantity < 1
                    const qtyDisplay = isRatioSplit
                      ? `${Math.round(quantity * 100)}%`
                      : quantity !== item.quantity
                        ? `${quantity % 1 === 0 ? quantity : quantity.toFixed(1)}/${item.quantity}`
                        : item.quantity > 1
                          ? `×${quantity}`
                          : ''

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: '#555555',
                          marginBottom: '2px',
                        }}
                      >
                        <span>
                          {item.name}
                          {qtyDisplay && <span style={{ color: '#888888' }}> ({qtyDisplay})</span>}
                        </span>
                        <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>₹{shareAmount.toFixed(0)}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Tax/Tip shares if applicable */}
                {(share.taxShare > 0 || share.tipShare > 0) && (
                  <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed #cccccc', fontSize: '11px', color: '#888888' }}>
                    {share.taxShare > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>+ Tax</span>
                        <span style={{ fontFamily: 'monospace' }}>₹{share.taxShare.toFixed(0)}</span>
                      </div>
                    )}
                    {share.tipShare > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>+ Tip</span>
                        <span style={{ fontFamily: 'monospace' }}>₹{share.tipShare.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #dddddd', margin: '12px 0' }} />

        {/* Bill Summary */}
        <div style={{ fontSize: '12px', color: '#666666' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'monospace' }}>₹{subtotal.toFixed(0)}</span>
          </div>
          {taxAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tax</span>
              <span style={{ fontFamily: 'monospace' }}>₹{taxAmount.toFixed(0)}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tip</span>
              <span style={{ fontFamily: 'monospace' }}>₹{tipAmount.toFixed(0)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#aaaaaa' }}>
          Generated by BillBreak
        </div>
      </div>
    )
  }
)
