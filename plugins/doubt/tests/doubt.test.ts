import type { On } from 'claude-code'
import { type Engine, expect, test } from 'claude-code/testing'

const QUESTION = 'Are you sure?'
const OPTIONS = { options: { question: QUESTION } }

const ORIGIN = { kind: 'composer' } as const

const ask = (agentId?: string) => ({
  tool: 'AskUserQuestion' as const,
  ...(agentId === undefined ? {} : { agentId }),
  questions: [
    {
      question: 'Which one?',
      header: 'Pick',
      multiSelect: false,
      options: [
        { label: 'A', description: 'first' },
        { label: 'B', description: 'second' },
      ],
    },
  ],
})

// The engine beneath the mod: nothing else blocks a stop, and the dialog answers.
// `gate` stands for another Stop hook's block; the last status line is kept to read back.
const engine = (on: On, gate: () => string | undefined = () => undefined) => {
  const seen: { status?: string } = {}
  on('command.register', () => ({ value: { command: 'doubt' } }))
  on('ui.status', (_, e) => {
    seen.status = e.text
    return { value: undefined }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.end', (_, e) => ({ sessionId: e.sessionId }))
  on('prompt.submit', (_, e) => ({ text: e.text }))
  on('classic.Stop', () => {
    const block = gate()
    return block === undefined ? {} : { block }
  })
  on('tool.call', () => ({ result: { answered: true } }))

  return seen
}

const start = ($: Engine) => $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
const stop = ($: Engine, over: { agent_id?: string } = {}) => $.classic.Stop({ stop_hook_active: false, ...over })
const prompt = ($: Engine, text: string) => $.prompt.submit({ text, wait: false, origin: ORIGIN })
const command = ($: Engine, args = '') => $.command.run({ command: 'doubt', args, origin: ORIGIN, presentation: { isFullscreen: false, columns: 100 } })

test('a conversation that never turned it on is left alone', OPTIONS, async ($, on) => {
  engine(on)
  await start($)

  expect((await stop($)).block).toBeUndefined()
  expect((await $.tool.call(ask())).deny).toBeUndefined()
})

test('once on, each answer is doubted once before the turn ends', OPTIONS, async ($, on) => {
  engine(on)
  await start($)
  await command($)

  expect((await stop($)).block).toBe(QUESTION)
  // The stop after Claude answered the doubt stands.
  expect((await stop($)).block).toBeUndefined()

  await prompt($, 'next task')
  expect((await stop($)).block).toBe(QUESTION)
})

test('once on, a question to the user is doubted once before it is shown', OPTIONS, async ($, on) => {
  engine(on)
  await start($)
  await command($)

  expect((await $.tool.call(ask())).deny).toBe(QUESTION)
  expect((await $.tool.call(ask())).deny).toBeUndefined()
  // A later, different question in the same turn is doubted again.
  expect((await $.tool.call(ask())).deny).toBe(QUESTION)
})

test('a stop another hook already blocks keeps its block, and the doubt comes at the next stop', OPTIONS, async ($, on) => {
  let gate: string | undefined = 'commit first'
  engine(on, () => gate)
  await start($)
  await command($)

  expect((await stop($)).block).toBe('commit first')
  gate = undefined
  expect((await stop($)).block).toBe(QUESTION)
})

test('a subagent is never doubted', OPTIONS, async ($, on) => {
  engine(on)
  await start($)
  await command($)

  expect((await stop($, { agent_id: 'a1' })).block).toBeUndefined()
  expect((await $.tool.call(ask('a1'))).deny).toBeUndefined()
})

test('off and /clear both stop the doubting', OPTIONS, async ($, on) => {
  const seen = engine(on)
  await start($)
  await command($, 'on')
  expect(seen.status).toBe('doubt on')
  await command($, 'off')
  expect(seen.status).toBeUndefined()
  expect((await stop($)).block).toBeUndefined()

  await command($, 'on')
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })
  expect((await stop($)).block).toBeUndefined()
})
