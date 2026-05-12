import test from "node:test"
import assert from "node:assert"
import { performance } from "node:perf_hooks"
import { Translation } from "./intl.js"

const DEFAULT_ITERATIONS = 200_000
const ITERATIONS = Number.parseInt(process.env.INTL_PERF_ITERATIONS || DEFAULT_ITERATIONS, 10)
const WARMUP_ITERATIONS = Math.min(20_000, Math.max(1_000, Math.floor(ITERATIONS / 10)))

function formatNumber(value) {
	return value.toLocaleString("en-US")
}

function consume(value) {
	if (typeof value === "string") {
		return value.length
	}

	if (Array.isArray(value)) {
		return value.length
	}

	return String(value).length
}

function measure(name, run) {
	for (let idx = 0; idx < WARMUP_ITERATIONS; idx++) {
		consume(run(idx))
	}

	globalThis.gc?.()
	const heapBefore = process.memoryUsage().heapUsed
	const start = performance.now()
	let checksum = 0

	for (let idx = 0; idx < ITERATIONS; idx++) {
		checksum += consume(run(idx))
	}

	const totalMs = performance.now() - start
	globalThis.gc?.()
	const heapDelta = process.memoryUsage().heapUsed - heapBefore
	const nsPerOp = totalMs * 1_000_000 / ITERATIONS
	const opsPerSec = ITERATIONS / (totalMs / 1_000)

	return {
		name,
		iterations: formatNumber(ITERATIONS),
		totalMs: totalMs.toFixed(2),
		nsPerOp: nsPerOp.toFixed(1),
		opsPerSec: formatNumber(Math.round(opsPerSec)),
		heapDeltaKB: Math.round(heapDelta / 1024),
		checksum,
	}
}

function createCompiledTranslation(mode = "react") {
	const translation = new Translation("zh-CN", mode)
	translation.templates[translation.locale] = {
		"hello {} and {}": "你好 {} 和 {}",
		"swap {} and {}": "交换 {1} 与 {0}",
		"{} def {}": "{1} {0} 丁戊卯",
	}

	return translation
}

test("translation performance", () => {
	const compiledReact = createCompiledTranslation()
	const compiledString = createCompiledTranslation("string")
	const fallbackReact = new Translation("zh-CN")
	const localeSlot = (locale) => locale

	assert.equal(compiledReact.translate`hello ${1} and ${2}`.toString(), "你好 1 和 2")
	assert.equal(compiledReact.translate`swap ${1} and ${2}`.toString(), "交换 2 与 1")
	assert.equal(compiledReact.translate`${localeSlot} def ${2}`.toString(), "2 zh-CN 丁戊卯")
	assert.equal(fallbackReact.translate`hello ${1} and ${2}`.toString(), "hello 1 and 2")
	assert.equal(fallbackReact.translate("{} def {}", 1, 2).toString(), "1 def 2")
	assert.equal(compiledString.translate`hello ${1} and ${2}`, "你好 1 和 2")

	const results = [
		measure("compiled tagged template/react", (idx) => compiledReact.translate`hello ${idx} and ${idx + 1}`),
		measure("compiled slot reorder/react", (idx) => compiledReact.translate`swap ${idx} and ${idx + 1}`),
		measure("compiled function slot/react", (idx) => compiledReact.translate`${localeSlot} def ${idx}`),
		measure("fallback tagged template/react", (idx) => fallbackReact.translate`hello ${idx} and ${idx + 1}`),
		measure("fallback string call/react", (idx) => fallbackReact.translate("{} def {}", idx, idx + 1)),
		measure("compiled tagged template/string", (idx) => compiledString.translate`hello ${idx} and ${idx + 1}`),
	]

	console.table(results)
})