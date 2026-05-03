'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Button from '@/components/ui/Button'
import { storage, getTodayString, generateId } from '@/lib/storage'
import { getDefaultMorningRoutine, getDefaultEveningRoutine } from '@/lib/scrollEngine'
import type { Routine, RoutineItem } from '@/lib/types'

export default function RoutinePage() {
  const router = useRouter()
  const [routine, setRoutine] = useState<Routine | null>(null)
  const [newItem, setNewItem] = useState({ morning: '', evening: '' })
  const [tab, setTab] = useState<'morning' | 'evening'>('morning')
  const today = getTodayString()

  useEffect(() => {
    const u = storage.getUser()
    if (!u) { router.push('/onboarding'); return }
    if (!u.isPaid) { router.push('/unlock'); return }

    let r = storage.getRoutine(today)
    if (!r) {
      r = {
        userId: u.id, date: today,
        morning: getDefaultMorningRoutine(u.lifePathNumber),
        evening: getDefaultEveningRoutine(u.lifePathNumber),
        morningCompleted: false, eveningCompleted: false,
      }
    }
    setRoutine(r)
  }, [router, today])

  const toggleItem = (type: 'morning' | 'evening', id: string) => {
    if (!routine) return
    const updated = {
      ...routine,
      [type]: routine[type].map(item => item.id === id ? { ...item, completed: !item.completed } : item),
    }
    const allMorning = updated.morning.every(i => i.completed)
    const allEvening = updated.evening.every(i => i.completed)
    updated.morningCompleted = allMorning
    updated.eveningCompleted = allEvening
    setRoutine(updated)
    storage.saveRoutine(updated)
  }

  const addItem = (type: 'morning' | 'evening') => {
    if (!routine || !newItem[type].trim()) return
    const item: RoutineItem = { id: generateId(), label: newItem[type], completed: false, order: routine[type].length }
    const updated = { ...routine, [type]: [...routine[type], item] }
    setRoutine(updated)
    storage.saveRoutine(updated)
    setNewItem(n => ({ ...n, [type]: '' }))
  }

  const removeItem = (type: 'morning' | 'evening', id: string) => {
    if (!routine) return
    const updated = { ...routine, [type]: routine[type].filter(i => i.id !== id) }
    setRoutine(updated)
    storage.saveRoutine(updated)
  }

  if (!routine) return null

  const items = routine[tab]
  const completed = items.filter(i => i.completed).length
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0

  return (
    <div className="bg-scroll-black min-h-screen flex">
      <Sidebar isPaid />
      <div className="flex-1">
        <Header isPaid />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <div className="mb-8">
            <p className="text-scroll-gold/60 text-xs tracking-widest uppercase mb-1">Routine Builder</p>
            <h1 className="font-serif text-3xl">Daily Rituals</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {(['morning', 'evening'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-2 rounded-lg text-sm capitalize transition-all ${
                  tab === t ? 'bg-scroll-gold text-scroll-black font-semibold' : 'scroll-card text-scroll-bone-dim hover:text-scroll-bone'
                }`}>
                {t} {t === 'morning' && routine.morningCompleted ? '✓' : ''}{t === 'evening' && routine.eveningCompleted ? '✓' : ''}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-scroll-bone-dim mb-2">
              <span>{completed} of {items.length} complete</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-scroll-border rounded-full">
              <div className="h-1 bg-scroll-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 scroll-card p-4">
                <button onClick={() => toggleItem(tab, item.id)}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    item.completed ? 'bg-scroll-gold border-scroll-gold text-scroll-black text-xs' : 'border-scroll-border'
                  }`}>
                  {item.completed && '✓'}
                </button>
                <span className={`flex-1 text-sm ${item.completed ? 'line-through text-scroll-bone-dim/40' : 'text-scroll-bone-dim'}`}>
                  {item.label}
                </span>
                <button onClick={() => removeItem(tab, item.id)}
                  className="text-scroll-bone-dim/30 hover:text-red-400 text-xs transition-colors">✕</button>
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="flex gap-3">
            <input
              className="flex-1 bg-scroll-card border border-scroll-border rounded-lg px-4 py-3 text-scroll-bone text-sm outline-none focus:border-scroll-gold"
              placeholder={`Add ${tab} routine item...`}
              value={newItem[tab]}
              onChange={e => setNewItem(n => ({ ...n, [tab]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && addItem(tab)}
            />
            <Button variant="ghost" onClick={() => addItem(tab)}>Add</Button>
          </div>

          {progress === 100 && (
            <div className="mt-8 scroll-card-gold p-6 text-center animate-fade-in">
              <p className="text-scroll-gold font-serif text-lg">✦ {tab === 'morning' ? 'Morning' : 'Evening'} ritual complete.</p>
              <p className="text-scroll-bone-dim text-sm mt-2">This compounds. Every day.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
