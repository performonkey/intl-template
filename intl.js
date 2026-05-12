export class Runes extends Array {
	toString() {
		return this.join("")
	}
}

const SLOT_RE = /\{(\d*)\}/g
const TEMPLATE_KEY_CACHE = new WeakMap()

/**
 * Parses a template string and extracts the template parts and order of slots.
 * @param {string} templateString - The template string to parse.
 * @returns {{ template: string[], order: number[] }}
 */
export function parseTemplate(templateString) {
	const template = []
	const order = []
	let lastIndex = 0
	let match

	SLOT_RE.lastIndex = 0
	while ((match = SLOT_RE.exec(templateString)) !== null) {
		template.push(templateString.slice(lastIndex, match.index))
		// `{}` keeps original auto-numbering: index = current order length
		order.push(match[1] === "" ? order.length : +match[1])
		lastIndex = SLOT_RE.lastIndex
	}
	template.push(templateString.slice(lastIndex))

	return { template, order }
}

function compileRegionTemplates(regionTemplates) {
	const region = {}
	for (const key in regionTemplates) {
		region[key] = parseTemplate(regionTemplates[key])
	}

	return region
}

function getTemplateKey(strings) {
	if (!strings.raw) {
		return strings.join("{}")
	}

	let key = TEMPLATE_KEY_CACHE.get(strings)
	if (key === undefined) {
		key = strings.join("{}")
		TEMPLATE_KEY_CACHE.set(strings, key)
	}

	return key
}

function toTemplateString(value) {
	return value == null ? "" : value
}

/**
 * Represents a Translation object that handles string translation based on locale and templates.
 */
export class Translation {
	/** @type {"string" | "react"} */
	mode = "react"

	/**
	 * The current locale for translation.
	 * @type {string} 
	 **/
	locale = ""

	/**
	 * @param {string} defaultLocale 
	 * @param {"string" | "react"} mode 
	 */
	constructor(defaultLocale, mode = "react") {
		this.mode = mode
		this.locale = defaultLocale || globalThis?.navigator?.language || "en"
	}

	/**
	 * Templates object that stores the translation templates for each locale.
	 * @type {Proxy}
	 */
	#regions = {}

	#regionProxies = {}

	#templates = new Proxy(this.#regions, {
		get: (regions, locale) => {
			const region = regions[locale]
			if (!region) {
				return new Proxy({}, REGION_HANDLER)
			}

			let proxy = this.#regionProxies[locale]
			if (!proxy) {
				proxy = new Proxy(region, REGION_HANDLER)
				this.#regionProxies[locale] = proxy
			}

			return proxy
		},
		set: (regions, locale, regionTemplates) => {
			const region = compileRegionTemplates(regionTemplates)
			regions[locale] = region
			this.#regionProxies[locale] = new Proxy(region, REGION_HANDLER)

			return true
		}
	})

	get templates() {
		return this.#templates
	}

	set templates(value) {
		for (const locale in value) {
			this.#templates[locale] = value[locale]
		}
	}

	/**
	 * Translates a string based on the provided locale and strings.
	 *
	 * @param {TemplateStringsArray | string} strings - The string or array of strings to be translated.
	 * @param {...any} parts - The dynamic parts to be inserted into the translated string.
	 * @returns {Runes | string} - The translated string with dynamic parts inserted.
	 * @throws {Error} - If the length of the template parts does not match the length of the template.
	 */
	translate = (strings, ...parts) => {
		const locale = this.locale
		const isStringInput = typeof strings === "string"
		const key = isStringInput ? strings : getTemplateKey(strings)

		const compiled = this.#regions[locale]?.[key]
		let template
		let order
		if (compiled) {
			template = compiled.template
			order = compiled.order
		} else {
			template = isStringInput ? strings.split("{}") : strings.slice()
		}

		if (parts.length !== template.length - 1) {
			throw new Error(`translate template parts length does not match. locale: ${locale}, key: ${key}`)
		}

		const len = template.length
		if (this.mode !== "react") {
			let result = ""
			for (let idx = 0; idx < len; idx++) {
				result += template[idx]
				if (idx < parts.length) {
					const part = parts[order ? order[idx] : idx]
					result += toTemplateString(typeof part === "function" ? part(locale) : part)
				}
			}

			return result
		}

		const runes = new Runes(len + parts.length)
		let runeIdx = 0
		for (let idx = 0; idx < len; idx++) {
			runes[runeIdx++] = template[idx]
			if (idx < parts.length) {
				const part = parts[order ? order[idx] : idx]
				runes[runeIdx++] = typeof part === "function" ? part(locale) : part
			}
		}

		return runes
	}
}

const REGION_HANDLER = {
	set(region, key, value) {
		if (typeof value !== "string") {
			throw new Error("Template must be a string.")
		}
		region[key] = parseTemplate(value)
		return true
	}
}

export const translation = new Translation()

export default translation

export const l10n = translation.translate
