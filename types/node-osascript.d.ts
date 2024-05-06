declare module 'node-osascript' {
  interface OsascriptError extends Error {
    readonly name: string
    readonly message: string
  }

  interface OsascriptResult {
    readonly status: 'ok' | 'error'
    readonly result?: any
    readonly error?: OsascriptError
  }

  type OsascriptCallback = (
    err: OsascriptError | null,
    result: OsascriptResult | null,
  ) => void

  interface OsascriptOptions {
    type?: 'JavaScript' | 'AppleScript'
    flags?: string[]
    cwd?: string
  }

  interface Osascript {
    execute(script: string, callback: OsascriptCallback): void
    executeFile(file: string, callback: OsascriptCallback): void
    executeFile(
      file: string,
      options: OsascriptOptions,
      callback: OsascriptCallback,
    ): void
  }

  const osascript: Osascript

  export = osascript
}
