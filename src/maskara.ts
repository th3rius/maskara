export interface Token {
  pattern?: RegExp;
  _default?: string;
  optional?: boolean;
  recursive?: boolean;
  transform?: (character: string) => string;
  escape?: boolean;
}

const tokens: {[token: string | number]: Token} = {
  0: {pattern: /\d/, _default: '0'},
  9: {pattern: /\d/, optional: true},
  '#': {pattern: /\d/, optional: true, recursive: true},
  A: {pattern: /[a-zA-Z0-9]/},
  S: {pattern: /[a-zA-Z]/},
  U: {
    pattern: /[a-zA-Z]/,
    transform: function (c: string) {
      return c.toLocaleUpperCase();
    },
  },
  L: {
    pattern: /[a-zA-Z]/,
    transform: function (c: string) {
      return c.toLocaleLowerCase();
    },
  },
  $: {escape: true},
};

function isEscaped(pattern: string, pos: number) {
  let count = 0;
  let i = pos - 1;
  let token: Token = {escape: true};
  while (i >= 0 && token && token.escape) {
    token = tokens[pattern.charAt(i)];
    count += token && token.escape ? 1 : 0;
    i--;
  }
  return count > 0 && count % 2 === 1;
}

function calcOptionalNumbersToUse(pattern: string, value: string) {
  const numbersInP = pattern.replace(/[^0]/g, '').length;
  const numbersInV = value.replace(/[^\d]/g, '').length;
  return numbersInV - numbersInP;
}

function concatChar(
  text: string,
  character: string,
  options: StringMaskOptions,
  token?: Token
) {
  if (token && typeof token.transform === 'function') {
    character = token.transform(character);
  }
  if (options.reverse) {
    return character + text;
  }
  return text + character;
}

function hasMoreTokens(pattern: string, pos: number, inc: number): boolean {
  const pc = pattern.charAt(pos);
  const token = tokens[pc];
  if (pc === '') {
    return false;
  }
  return token && !token.escape ? true : hasMoreTokens(pattern, pos + inc, inc);
}

function hasMoreRecursiveTokens(
  pattern: string,
  pos: number,
  inc: number
): boolean {
  const pc = pattern.charAt(pos);
  const token = tokens[pc];
  if (pc === '') {
    return false;
  }
  return token && token.recursive
    ? true
    : hasMoreRecursiveTokens(pattern, pos + inc, inc);
}

function insertChar(text: string, char: string, position: number) {
  const t = text.split('');
  t.splice(position, 0, char);
  return t.join('');
}

export interface StringMaskOptions {
  reverse?: boolean;
  useDefaults?: boolean;
}

export type ProcessableValue = string | null | undefined;

class StringMask {
  options: StringMaskOptions;
  pattern: string;

  constructor(pattern: string, opt?: StringMaskOptions) {
    this.options = opt || {};
    this.options = {
      reverse: this.options.reverse || false,
      useDefaults: this.options.useDefaults || this.options.reverse,
    };
    this.pattern = pattern;
  }

  process(value: ProcessableValue) {
    if (!value) {
      return {result: '', valid: false};
    }
    value = value + '';
    let pattern2 = this.pattern;
    let valid = true;
    let formatted = '';
    let valuePos = this.options.reverse ? value.length - 1 : 0;
    let patternPos = 0;
    let optionalNumbersToUse = calcOptionalNumbersToUse(pattern2, value);
    let escapeNext = false;
    const recursive: string[] = [];
    let inRecursiveMode = false;

    const steps = {
      start: this.options.reverse ? pattern2.length - 1 : 0,
      end: this.options.reverse ? -1 : pattern2.length,
      inc: this.options.reverse ? -1 : 1,
    };

    function continueCondition(options: StringMaskOptions) {
      if (
        !inRecursiveMode &&
        !recursive.length &&
        hasMoreTokens(pattern2, patternPos, steps.inc)
      ) {
        // continue in the normal iteration
        return true;
      } else if (
        !inRecursiveMode &&
        recursive.length &&
        hasMoreRecursiveTokens(pattern2, patternPos, steps.inc)
      ) {
        // continue looking for the recursive tokens
        // Note: all chars in the patterns after the
        // recursive portion will be handled as static string
        return true;
      } else if (!inRecursiveMode) {
        // start to handle the recursive portion of the pattern
        inRecursiveMode = recursive.length > 0;
      }

      if (inRecursiveMode) {
        const pc = recursive.shift();
        if (pc) {
          recursive.push(pc);
          if (options.reverse && valuePos >= 0) {
            patternPos++;
            pattern2 = insertChar(pattern2, pc, patternPos);
            return true;
          } else if (!options.reverse && valuePos < value!.length) {
            pattern2 = insertChar(pattern2, pc, patternPos);
            return true;
          }
        }
      }
      return patternPos < pattern2.length && patternPos >= 0;
    }

    /**
     * Iterate over the pattern's chars parsing/matching the input value
     * chars until the end of the pattern. If the pattern ends with recursive
     * chars the iteration will continue until the end of the input value.
     *
     * Note: The iteration must stop if an invalid char is found.
     */
    for (
      patternPos = steps.start;
      continueCondition(this.options);
      patternPos = patternPos + steps.inc
    ) {
      // Value char
      const vc = value.charAt(valuePos);
      // Pattern char to match with the value char
      const pc = pattern2.charAt(patternPos);

      let token: Token | undefined = tokens[pc];
      if (recursive.length && token && !token.recursive) {
        // In the recursive portion of the pattern: tokens
        // not recursive must be seen as static chars
        token = undefined;
      }

      // 1. Handle escape tokens in pattern
      // go to next iteration: if the pattern
      // char is an escape char or was escaped
      if (!inRecursiveMode || vc) {
        if (this.options.reverse && isEscaped(pattern2, patternPos)) {
          // pattern char is escaped, just add it and move on
          formatted = concatChar(formatted, pc, this.options, token);
          // skip escape token
          patternPos = patternPos + steps.inc;
          continue;
        } else if (!this.options.reverse && escapeNext) {
          // pattern char is escaped, just add it and move on
          formatted = concatChar(formatted, pc, this.options, token);
          escapeNext = false;
          continue;
        } else if (!this.options.reverse && token && token.escape) {
          // mark to escape the next pattern char
          escapeNext = true;
          continue;
        }
      }

      // 2. Handle recursive tokens in pattern
      // go to next iteration: if the value str is finished or
      //                       if there is a normal token in the recursive portion of the pattern
      if (!inRecursiveMode && token && token.recursive) {
        // save it to repeat in the end of the
        // pattern and handle the value char now
        recursive.push(pc);
      } else if (inRecursiveMode && !vc) {
        // in recursive mode but value is finished. Add
        // the pattern char if it is not a recursive token
        formatted = concatChar(formatted, pc, this.options, token);
        continue;
      } else if (!inRecursiveMode && recursive.length > 0 && !vc) {
        // recursiveMode not started but already
        // in the recursive portion of the pattern
        continue;
      }

      // 3. Handle the value
      // break iterations: if value is invalid for the given pattern
      if (!token) {
        // add char of the pattern
        formatted = concatChar(formatted, pc, this.options, token);
        if (!inRecursiveMode && recursive.length) {
          // save it to repeat in the end of the pattern
          recursive.push(pc);
        }
      } else if (token.optional) {
        // if token is optional, only add the value char if it matchs the token pattern
        //                       if not, move on to the next pattern char
        if (token.pattern?.test(vc) && optionalNumbersToUse) {
          formatted = concatChar(formatted, vc, this.options, token);
          valuePos = valuePos + steps.inc;
          optionalNumbersToUse--;
        } else if (recursive.length > 0 && vc) {
          valid = false;
          break;
        }
      } else if (token.pattern?.test(vc)) {
        // if token isn't optional the value char must match the token pattern
        formatted = concatChar(formatted, vc, this.options, token);
        valuePos = valuePos + steps.inc;
      } else if (!vc && token._default && this.options.useDefaults) {
        // if the token isn't optional and has a default
        // value, use it if the value is finished
        formatted = concatChar(formatted, token._default, this.options, token);
      } else {
        // the string value don't match the given pattern
        valid = false;
        break;
      }
    }

    return {result: formatted, valid: valid};
  }

  apply(value: ProcessableValue) {
    return this.process(value).result;
  }

  validate(value: ProcessableValue) {
    return this.process(value).valid;
  }

  static process(
    value: ProcessableValue,
    pattern: string,
    options?: StringMaskOptions
  ) {
    return new StringMask(pattern, options).process(value);
  }

  static apply(
    value: ProcessableValue,
    pattern: string,
    options?: StringMaskOptions
  ) {
    return new StringMask(pattern, options).apply(value);
  }

  static validate(
    value: ProcessableValue,
    pattern: string,
    options?: StringMaskOptions
  ) {
    return new StringMask(pattern, options).validate(value);
  }
}

export default StringMask;
