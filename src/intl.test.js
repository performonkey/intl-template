import assert from "node:assert"
import test from "node:test"
import { Translation, Runes } from "./intl.js"

test("template", async (t) => {
	await t.test("template slot parse", () => {
		const translation = new Translation()
		const locale = "zh-CN"
		translation.templates[locale] = {
			"{}matched{}": "{}{}丁戊卯",
		}

		Object.assign(translation.templates[locale], {
			"assign{}": "123{}"
		})

		assert.deepEqual(
			translation.templates[locale],
			{
				"{}matched{}": {
					template: ["", "", "丁戊卯"],
					order: [0, 1]
				},
				"assign{}": {
					template: ["123", ""],
					order: [0]
				}
			},
		)
	})

	await t.test("template slot order parse", () => {
		const translation = new Translation()
		const locale = "zh-CN"
		const key = "{}matched{}"
		translation.templates[locale] = {
			[key]: "{1}{0}丁戊卯",
		}

		assert.deepEqual(
			translation.templates[locale][key],
			{
				template: ["", "", "丁戊卯"],
				order: [1, 0]
			}
		)
	})
})

test("translation.translate", async (t) => {
	await t.test("apply template", () => {
		const translation = new Translation()
		translation.templates["zh-CN"] = {
			"abc {} def {}": "甲乙丙 {} {} 丁戊卯",
		}
		const l10n = translation.translate.bind(null, "zh-CN")
		assert.deepEqual(l10n`abc ${123} def ${345}`, ["甲乙丙 ", 123, " ", 345, " 丁戊卯"])
	})

	await t.test("change slot order", () => {
		const translation = new Translation()
		translation.templates["zh-CN"] = {
			"abc {} def {}": "甲乙丙 {1} {0} 丁戊卯",
		}
		const l10n = translation.translate.bind(null, "zh-CN")
		assert.equal(l10n`abc ${123} def ${345}`.toString(), "甲乙丙 345 123 丁戊卯")
	})

	await t.test("slot function", () => {
		const translation = new Translation()
		translation.templates["zh-CN"] = {
			"{} def {}": "{1} {0} 丁戊卯",
		}
		const l10n = translation.translate.bind(null, "zh-CN")
		assert.equal(l10n`${locale => locale} def ${345}`.toString(), "345 zh-CN 丁戊卯")
	})

	await t.test("slot count match", () => {
		const translation = new Translation()
		translation.templates["zh-CN"] = {
			"{} def {}": "{} 丁戊卯",
			"{}matched{}": "{}{}丁戊卯",
		}
		const l10n = translation.translate.bind(null, "zh-CN")
		try {
			l10n`${locale => locale} def ${345}`
		} catch (err) {
			assert.equal(
				err.message,
				`translate template parts length does not match. locale: zh-CN, key: {} def {}`
			)
		}

		assert.equal(l10n`${locale => locale}matched${345}`.toString(), `zh-CN345丁戊卯`)
	})

	await t.test("call as function", () => {
		const translation = new Translation()
		translation.templates["zh-CN"] = {}
		const l10n = translation.translate.bind(null, "zh-CN")
		assert.equal(l10n("{} def {} {}", 1, "a", "b").toString(), '1 def a b')
	})
})

test("Runes", async (t) => {
	assert.equal(
		new Runes('a', ' b ', 1, 2).toString(),
		'a b 12'
	)
})
