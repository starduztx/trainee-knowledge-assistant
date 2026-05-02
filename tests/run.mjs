const modules = [
  './document.test.mjs',
  './rate-limit.test.mjs'
]

let passed = 0
let failed = 0

for (const modulePath of modules) {
  const { default: tests } = await import(modulePath)

  for (const [name, fn] of tests) {
    try {
      await fn()
      passed += 1
      console.log(`ok - ${name}`)
    } catch (error) {
      failed += 1
      console.error(`not ok - ${name}`)
      console.error(error)
    }
  }
}

console.log(`\n${passed} passed, ${failed} failed`)

if (failed > 0) {
  process.exitCode = 1
}
