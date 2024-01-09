import assert from 'node:assert';
import test from 'node:test';
import { translate, setTransition } from './intl.js';


test('apply template', async (t) => {
	setTransition('zh-CN', {
		'abc {} def {}': '甲乙丙 {} {} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.deepEqual(l10n`abc ${123} def ${345}`, ['甲乙丙 ', 123, ' ', 345, ' 丁戊卯'])
});

test('change slot order', async (t) => {
	setTransition('zh-CN', {
		'abc {} def {}': '甲乙丙 {1} {0} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.equal(l10n`abc ${123} def ${345}`.toString(), '甲乙丙 345 123 丁戊卯')
});

test('slot function', async (t) => {
	setTransition('zh-CN', {
		'{} def {}': '{1} {0} 丁戊卯',
	})
	const l10n = translate.bind(null, 'zh-CN')
	assert.equal(l10n`${locale => locale} def ${345}`.toString(), '345 zh-CN 丁戊卯')
});
