export class Runes extends Array {
	toString() {
		return this.join("")
	}
}

/**
 * Parses a template string and extracts the template parts and order of slots.
 * @param {string} templateString - The template string to parse.
 * @returns {{ template: string[], order: number[] }}
 */
export function parseTemplate(templateString) {
	const order = [];
	const template = [];
	const parts = templateString.split(/({\d*})/)
	parts.forEach((part) => {
		if (part.match(/^{\d*}$/)) {
			if (part === '{}') {
				order.push(order.length)
			} else {
				// slot with order, e.g. `{2}abc{1}def{0}`
				order.push(parseInt(part.slice(1, -1), 10))
			}
		} else {
			template.push(part)
		}
	})

	return { template, order }
}

/**
 * Represents a Translation object that handles string translation based on locale and templates.
 */
export class Translation {
	/**
	 * Templates object that stores the translation templates for each locale.
	 * @type {Proxy}
	 */
	#templates = new Proxy({}, {
		get(templates, locale) {
			return new Proxy(templates[locale] || {}, {
				set(region, key, value) {
					if (typeof value !== "string") {
						throw new Error("Template must be a string.")
					}

					region[key] = parseTemplate(value)

					return true
				}
			})
		},
		set(templates, locale, regionTemplates) {
			templates[locale] = Object.entries(regionTemplates).reduce((region, [key, value]) => {
				region[key] = parseTemplate(value)

				return region
			}, {})

			return true
		}
	})

	get templates() {
		return this.#templates
	}

	set templates(value) {
		Object.entries(value).forEach(([locale, regionTemplates]) => {
			this.#templates[locale] = regionTemplates
		})

		return true
	}

	/**
	 * Translates a string based on the provided locale and strings.
	 *
	 * @param {string} locale - The locale to use for translation.
	 * @param {TemplateStringsArray | string} strings - The string or array of strings to be translated.
	 * @param {...any} parts - The dynamic parts to be inserted into the translated string.
	 * @returns {Runes} - The translated string with dynamic parts inserted.
	 * @throws {Error} - If the length of the template parts does not match the length of the template.
	 */
	translate = (locale, strings, ...parts) => {
		if (typeof strings === "string") {
			strings = strings.split("{}")
		}

		const key = strings.join("{}")
		const translation = this.#templates?.[locale]
		let { template, order } = translation?.[key] || {}
		if (!template) {
			if (import.meta?.env?.MODE === "development") {
				console.warn(`not match translate key, ${key}`, { translation, locale, strings, parts })
			}
			template = strings.slice()
			order = parts.map((_, i) => i)
		}

		if (parts.length !== template.length - 1) {
			throw new Error(`translate template parts length does not match. locale: ${locale}, key: ${key}`)
		}

		const runes = template.reduce((runes, template, idx) => {
			runes.push(template)

			const orderIdx = order[idx]
			if (orderIdx >= 0) {
				const part = parts[orderIdx]
				if (typeof part === "function") {
					runes.push(part(locale))
				} else {
					runes.push(part)
				}
			}

			return runes
		}, new Runes())

		return runes
	}
}

const translation = new Translation()

export default translation

export const l10n = translation.translate.bind(null, globalThis?.navigator?.language);
