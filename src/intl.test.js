import assert from 'node:assert';
import test from 'node:test';
import { translate, setTransition } from './intl.js';


test('apply template', (t) => {
	setTransition('zh-CN', {
		'abc {} def {}': '甲乙丙 {} {} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.deepEqual(l10n`abc ${123} def ${345}`, ['甲乙丙 ', 123, ' ', 345, ' 丁戊卯'])
});

test('change slot order', (t) => {
	setTransition('zh-CN', {
		'abc {} def {}': '甲乙丙 {1} {0} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.equal(l10n`abc ${123} def ${345}`.toString(), '甲乙丙 345 123 丁戊卯')
});

test('slot function', (t) => {
	setTransition('zh-CN', {
		'{} def {}': '{1} {0} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.equal(l10n`${locale => locale} def ${345}`.toString(), '345 zh-CN 丁戊卯')
});

test('slot count match', (t) => {
	setTransition('zh-CN', {
		'{} def {}': '{} 丁戊卯',
		'{}matched{}': '{}{}丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	try {
		l10n`${locale => locale} def ${345}`
	} catch (err) {
		assert.equal(
			err.message,
			`translate template parts length not match. locale: zh-CN, key: {} def {}`
		)
	}

	assert.equal(l10n`${locale => locale}matched${345}`.toString(), `zh-CN345丁戊卯`)
});
