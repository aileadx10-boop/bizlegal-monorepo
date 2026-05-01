'use client'

import { ReactNode, useState } from 'react'

interface DashboardPanelProps {
  title?: string
  subtitle?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function DashboardPanel({ title, subtitle, children, action, className = '' }: DashboardPanelProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            {title && <h3 className="text-sm font-mono uppercase tracking-wider text-white/70">{title}</h3>}
            {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}

interface InputFieldProps {
  label: string
  type?: 'text' | 'email' | 'number' | 'select' | 'textarea'
  value: string
  onChange: (val: string) => void
  placeholder?: string
  options?: { value: string; label: string }[]
  helpText?: string
  prefix?: string
  suffix?: string
}

export function InputField({ label, type = 'text', value, onChange, placeholder, options, helpText, prefix, suffix }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-mono uppercase tracking-wider text-white/50">{label}</label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0e1a]">{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all resize-none"
        />
      ) : (
        <div className="relative">
          {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">{prefix}</span>}
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-lg border border-white/10 bg-white/5 ${prefix ? 'pl-8' : 'px-4'} ${suffix ? 'pr-8' : 'px-4'} py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all`}
          />
          {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-mono">{suffix}</span>}
        </div>
      )}
      {helpText && <p className="text-xs text-white/30">{helpText}</p>}
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  showValue?: boolean
}

export function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', showValue = true }: SliderFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-white/50">{label}</label>
        {showValue && (
          <span className="text-sm font-mono font-bold text-indigo-400">
            {value}{unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-white/30 font-mono">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

interface ToggleFieldProps {
  label: string
  value: boolean
  onChange: (val: boolean) => void
  description?: string
}

export function ToggleField({ label, value, onChange, description }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <label className="text-sm font-medium text-white">{label}</label>
        {description && <p className="text-xs text-white/40 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}

interface TabGroupProps {
  tabs: { id: string; label: string; icon?: ReactNode }[]
  active: string
  onChange: (id: string) => void
}

export function TabGroup({ tabs, active, onChange }: TabGroupProps) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-indigo-500 text-white'
              : 'text-white/50 hover:text-white/70 hover:bg-white/5'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
