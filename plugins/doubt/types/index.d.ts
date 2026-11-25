// The doubt mod's contract: the values it keeps in $.state.

declare module 'claude-code' {
  interface PluginState {
    doubt: {
      // Whether the mode is on for this conversation.
      isOn: boolean
      // Whether the output being produced for the current prompt was already doubted.
      isStopDoubted: boolean
      // Whether the pending question to the user was already doubted.
      isAskDoubted: boolean
    }
  }
}
