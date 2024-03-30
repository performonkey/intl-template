# intel-template

A tiny i18n/l10n TTL(Tagged Template Literals) function

## Table of Contents

- [intel-template](#intel-template)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Use browser specifies locale](#use-browser-specifies-locale)
    - [Use with React](#use-with-react)
    - [Specify slot order](#specify-slot-order)
    - [Nested](#nested)
    - [Function slot](#function-slot)
    - [Call as function](#call-as-function)

## Installation

```bash
npm install intl-template
```

## Usage

```
import translation from "intl-template"

translation.templates["es-ES"] = {
    "hello {}": "hola {}"
}

const l10n = translation.translate.bind(null, "es-ES")

const name = "willow";

console.log(l10n`hello ${name}`)
// => hola willow
```

### Use browser specifies locale
```
import translation, { l10n } from "intl-template"

translation.templates["es-ES"] = {
    "hello {}": "hola {}"
}

// l10n = translation.translate.bind(null, navigator,language)

const name = "willow";

console.log(l10n`hello ${name}`)
// => hola willow
```

### Use with React

```javascript

function SomeComponent({ name }) {
    return (
        <div>
            {l10n`hello ${<b>{name}</b>}`}
        </div>
    )
}
```

### Specify slot order

```
translation.templates["de-DE"] = {
    "hello {} and {}": "hallo {1} und {0}"
}

const l10n = translation.translate.bind(null, "de-DE")

const name1 = "willow"
const name2 = "jack"

console.log(l10n`hello ${name1} and ${name2}`)
// => holla jack und willow
```

### Nested

```javascript
translation.templates["de-DE"] = {
    "bill": "schmidt",
    "hello {}": "hallo {1}"
}

const l10n = translation.translate.bind(null, "de-DE")

l10n`hello ${l10n`bill`}` // => hallo schmidt
```

### Function slot

```javascript
translation.templates["de-DE"] = {
    "bill": "schmidt",
    "hello {}": "hallo {1}"
}

const l10n = translation.translate.bind(null, "de-DE")

l10n`hello ${(locale) => 123}` // => hallo 123
```

### Call as function

```javascript
l10n("hello {}", name)
```
