# maskara
[![npm version](https://badge.fury.io/js/maskara.svg)](http://badge.fury.io/js/string-mask)
[![Coverage Status](https://coveralls.io/repos/github/th3rius/maskara/badge.svg?branch=master)](https://coveralls.io/github/th3rius/maskara?branch=master)

A string formatter and validator based on masks.

## INSTALLATION

**With npm:**

```javascript
npm install --save maskara
```

**With yarn:**

```javascript
yarn add maskara
```

## SPECIAL MASK CHARACTERS

| Character | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `0`       | Any numbers                                                                |
| `9`       | Any numbers (Optional)                                                     |
| `#`       | Any numbers (recursive)                                                    |
| `A`       | Any alphanumeric character                                                 |
| `a`       | Any alphanumeric character (Optional) **Not implemented yet**              |
| `S`       | Any letter                                                                 |
| `U`       | Any letter (All lower case character will be mapped to uppercase)          |
| `L`       | Any letter (All upper case character will be mapped to lowercase)          |
| `$`       | Escape character, used to escape any of the special formatting characters. |

### Special characters types

- **Optional characters:** Used to parse characters that cold exist in the source string or not. See [Date and time](#date-and-time).

- **Recursive characters:** Used to parse patterns that repeat in the end or in the start of the source string. See [Two decimal number with thousands separators](#two-decimal-number-with-thousands-separators)

> _Note: Any character of the mask positioned after a recursive character will be handled as a non special character._

## USAGE

**Use it creating an mask instance with the Maskara contructor:**

```javascript
/**
 * - optionsObject parameter is optional in the constructor
 * - apply will return the a masked string value
 * - validate will return `true` if the string matchs the mask
 */
var mask = new Maskara('some mask', optionsObject); //optionsObject is optional
var maskedValue = mask.apply('some value string');
var isValid = mask.validate('some value string to validate');
```

**Or by the static interface:**

```javascript
/**
 * - optionsObject parameter is optional in all methods
 * - apply will return the a masked string value
 * - validate will return `true` if the string matchs the mask
 * - process will return a object: {result: <maskedValue>, valid: <isValid>}
 */
var maskedValue = Maskara.apply(
  'some value string',
  'some mask',
  optionsObject
);
var isValid = Maskara.validate(
  'some value string',
  'some mask',
  optionsObject
);
var result = Maskara.process(
  'some value string',
  'some mask',
  optionsObject
);
```

### Some masks examples

#### Number

```javascript
var formatter = new Maskara('#0');
var result = formatter.apply('123'); // 123
```

#### Two decimal number with thousands separators

```javascript
var formatter = new Maskara('#.##0,00', {reverse: true});
var result = formatter.apply('100123456'); // 1.001.234,56
result = formatter.apply('6'); // 0,06
```

#### Phone number

```javascript
var formatter = new Maskara('+00 (00) 0000-0000');
var result = formatter.apply('553122222222'); // +55 (31) 2222-2222
```

#### Percentage

```javascript
var formatter = new Maskara('#0,00%');
var result = formatter.apply('001'); // 0,01%
```

#### Brazilian CPF number

```javascript
var formatter = new Maskara('000.000.000-00');
var result = formatter.apply('12965815620'); // 129.658.156-20
```

#### Date and time

```javascript
var formatter = new Maskara('90/90/9900');
var result = formatter.apply('1187'); // 1/1/87
```

#### Convert Case

```javascript
var formatter = new Maskara('UUUUUUUUUUUUU');
var result = formatter.apply('To Upper Case'); // TO UPPER CASE
```

```javascript
var formatter = new Maskara('LLLLLLLLLLLLL');
var result = formatter.apply('To Lower Case'); // to lower case
```

#### International Bank Number

```javascript
var formatter = new Maskara('UUAA AAAA AAAA AAAA AAAA AAAA AAA');
var result = formatter.apply('FR761111900069410000AA33222');
// result: FR76 1111 BBBB 6941 0000 AA33 222
```

## CONTRIBUTING

We'd love for you to contribute to our source code! We just ask to:

- Write tests for the new feature or bug fix that you are solving
- Ensure all tests pass before send the pull-request (Use: `$ npm test`)
- Pull requests will not be merged if:
  - has not unit tests
  - reduce the code coverage

## LICENSE

Copyright (c) 2022 Gabriel de Oliveira

Licensed under the MIT license.
