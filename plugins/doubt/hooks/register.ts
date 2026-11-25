import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const COMMAND = 'doubt'
const STATUS = 'doubt on'

const isOn = atom({ plugin: 'doubt', key: 'isOn' } as const, false)
const isStopDoubted = atom({ plugin: 'doubt', key: 'isStopDoubted' } as const, false)
const isAskDoubted = atom({ plugin: 'doubt', key: 'isAskDoubted' } as const, false)

export const register: Register = (on, options) => {
  const question = String(options.question ?? '').trim()

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: 'Have Claude doubt its own output before showing it, in this conversation',
      argumentHint: '[on|off]',
    })
    $.ui.status((await read($, isOn)) ? STATUS : undefined)

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg !== '' && arg !== 'on' && arg !== 'off') return { text: `Usage: /${COMMAND} [on|off]` }
    if (question === '') return { text: 'doubt has no text to ask: set it in /config.' }

    const turnOn = arg === '' ? !(await read($, isOn)) : arg === 'on'
    await update($, isOn, () => turnOn)
    $.ui.status(turnOn ? STATUS : undefined)

    return {
      text: turnOn
        ? `Doubt is on for this conversation. Claude will be asked "${question}" once before it ends a turn or asks you a question.`
        : 'Doubt is off.',
    }
  })

  // A new prompt starts a new output: both doubts are owed again.
  on('prompt.submit', async ($, e, next) => {
    await update($, isStopDoubted, () => false)
    await update($, isAskDoubted, () => false)

    return next(e)
  })

  // /clear ends the conversation while the process and its state go on.
  on('session.end', async ($, e, next) => {
    if (e.reason === 'clear') {
      await update($, isOn, () => false)
      $.ui.status(undefined)
    }

    return next(e)
  })

  on('classic.Stop', async ($, e, next) => {
    const beneath = await next(e)
    if (e.agent_id !== undefined || !(await read($, isOn))) return beneath
    // Another hook already keeps the turn going, or ends the session: the doubt waits for the stop that stands.
    if (beneath.block !== undefined || beneath.preventContinuation) return beneath
    // Work still running in the background will wake the session: this stop is a pause, not the output.
    if ((e.background_tasks?.length ?? 0) > 0) return beneath
    if (await read($, isStopDoubted)) return beneath

    await update($, isStopDoubted, () => true)

    return { ...beneath, block: question }
  })

  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    if (e.agentId !== undefined || !(await read($, isOn))) return next(e)
    if (await read($, isAskDoubted)) {
      await update($, isAskDoubted, () => false)

      return next(e)
    }

    await update($, isAskDoubted, () => true)

    return { deny: question }
  })
}
