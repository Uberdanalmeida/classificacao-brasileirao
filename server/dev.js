import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDirectory = resolve(fileURLToPath(new URL('..', import.meta.url)))
const children = [
  spawn(process.execPath, ['server/index.js'], {
    cwd: rootDirectory,
    env: { ...process.env, PORT: '3001' },
    stdio: 'inherit',
  }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], {
    cwd: rootDirectory,
    stdio: 'inherit',
  }),
]

let shuttingDown = false

function stop(code) {
  if (shuttingDown) return
  shuttingDown = true
  for (const child of children) {
    if (child.exitCode === null) child.kill()
  }
  process.exitCode = code
}

for (const child of children) {
  child.on('error', (error) => {
    console.error('Não foi possível iniciar um dos servidores de desenvolvimento:', error)
    stop(1)
  })
  child.on('exit', (code) => {
    if (!shuttingDown) stop(code || 0)
  })
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
