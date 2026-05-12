# intl-template

A tiny i18n/l10n helper built on JavaScript Tagged Template Literals.

`intl-template` lets source strings stay close to your UI code while translations live in a simple locale-indexed template map.

## Installation

```bash
npm install intl-template
```

## Quick Start

```javascript
import translation, { l10n } from "intl-template"

translation.locale = "es-ES"
translation.templates["es-ES"] = {
    "hello {}": "hola {}",
}

const name = "Willow"

console.log(l10n`hello ${name}`.toString())
// => hola Willow
```

Every interpolation in a tagged template becomes `{}` in the translation key. For example, `l10n`hello ${name}`` looks up the key `"hello {}"`.

By default, translations return a `Runes` array so React nodes and other non-string values can pass through unchanged. Call `.toString()` when you need plain text, or create a `Translation` instance in `"string"` mode.

## Templates

```javascript
translation.templates["en-US"] = {
    "hello {}": "hello {}",
    "{} invited {}": "{} invited {}",
}

translation.templates["de-DE"] = {
    "hello {}": "hallo {}",
    "{} invited {}": "{1} wurde von {0} eingeladen",
}
```

Use `{}` to keep the original slot order. Use `{0}`, `{1}`, and later indexes when a locale needs a different order.

## Locale

The shared `translation` instance uses `navigator.language` when it is available, then falls back to `"en"`. You can also set the locale explicitly.

```javascript
import translation, { l10n } from "intl-template"

const browserLocale = navigator.language

translation.locale = browserLocale
translation.templates[browserLocale] = {
    "hello {}": "hola {}",
}

console.log(l10n`hello ${"Willow"}`.toString())
// => hola Willow
```

## Examples

### React

The default `"react"` mode keeps interpolated values as values, so JSX can be used inside a translation.

```jsx
import translation, { l10n } from "intl-template"

translation.locale = "es-ES"
translation.templates["es-ES"] = {
    "hello {}": "hola {}",
}

function Greeting({ name }) {
    return (
        <p>
            {l10n`hello ${<strong key="name">{name}</strong>}`}
        </p>
    )
}
```

### Slot Order

```javascript
translation.locale = "de-DE"
translation.templates["de-DE"] = {
    "{} invited {}": "{1} wurde von {0} eingeladen",
}

const inviter = "Willow"
const guest = "Jack"

console.log(l10n`${inviter} invited ${guest}`.toString())
// => Jack wurde von Willow eingeladen
```

### Nested Translations

```javascript
translation.locale = "de-DE"
translation.templates["de-DE"] = {
    "Bill": "Schmidt",
    "hello {}": "hallo {}",
}

console.log(l10n`hello ${l10n`Bill`}`.toString())
// => hallo Schmidt
```

### Function Slots

When a slot is a function, it receives the active locale.

```javascript
translation.locale = "de-DE"
translation.templates["de-DE"] = {
    "current locale: {}": "aktuelle Sprache: {}",
}

console.log(l10n`current locale: ${locale => locale}`.toString())
// => aktuelle Sprache: de-DE
```

### Call as a Function

Tagged templates and function calls use the same placeholder format.

```javascript
translation.locale = "es-ES"
translation.templates["es-ES"] = {
    "hello {}": "hola {}",
}

console.log(l10n("hello {}", "Willow").toString())
// => hola Willow
```

### String Mode

```javascript
import { Translation } from "intl-template"

const translation = new Translation("es-ES", "string")

translation.templates["es-ES"] = {
    "hello {}": "hola {}",
}

const t = translation.translate

console.log(t`hello ${"Willow"}`)
// => hola Willow
```

## API

### `translation`

The default shared `Translation` instance.

### `l10n`

A shorthand for `translation.translate`.

### `new Translation(defaultLocale, mode)`

Creates an isolated translation instance.

- `defaultLocale`: locale used by this instance.
- `mode`: `"react"` by default, or `"string"` for plain string output.

### `translation.locale`

The active locale used by `translate`.

### `translation.templates`

Locale-indexed translation templates.

```javascript
translation.templates["es-ES"] = {
    "source {}": "translated {}",
}
```

### `translation.translate(strings, ...parts)`

Translates a tagged template or a string with `{}` placeholders.
