const TRANSLATIONS = {}

export function setTransition(locale, transition) {
	return TRANSLATIONS[locale] = Object.entries(transition).reduce((obj, [key, value]) => {
		const order = [];
		const template = [];
		const parts = value.split(/({\d*})/)
		parts.forEach((part, index) => {
			if (part === '{}') {
				if (index === 0 || index === parts.length - 1) {
					template.push("")
				}
				order.push(order.length)
				return
			}
			if (part.match(/^{\d+}$/)) {
				if (index === 0 || index === parts.length - 1) {
					template.push("")
				}
				order.push(parseInt(part.slice(1, -1), 10))
				return
			}

			template.push(part)
		})

		obj[key] = { template, order }

		return obj
	}, {})
}

export function translate(locale, strings, ...parts) {
	const key = strings.join("{}")
	const translation = TRANSLATIONS?.[locale]
	let { template, order } = translation?.[key] || {}
	if (!template && import.meta?.env?.MODE === "development") {
		console.warn(`not match translate key, ${key}`, { translation, locale, strings, parts })
		template = strings.slice()
		order = parts.map((_, i) => i)
	}

	if (parts.length > 0 && template.length - 1 !== parts.length) {
		throw new Error(`translate template parts length not match. locale: ${locale}, key: ${key}`)
	}

	const ret = template.reduce((ret, template, idx) => {
		ret.push(template)
		const orderIdx = order[idx]
		if (orderIdx >= 0) {
			const part = parts[orderIdx]
			if (typeof part == "function") {
				ret.push(part(locale, translation))
			} else {
				ret.push(part)
			}
		}
		return ret
	}, [])

	const text = ret.join("")
	Object.defineProperty(ret, "toString", {
		enumerable: false,
		writable: false,
		configurable: false,
		value: () => text
	})

	return ret
}

export const l10n = translate.bind(null, globalThis?.navigator?.language)
