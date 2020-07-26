# tsc-checkjs

![Travis (.org)](https://img.shields.io/travis/jikuja/tsc-checkjs)
![npm](https://img.shields.io/npm/v/tsc-checkjs)
![GitHub](https://img.shields.io/github/license/jikuja/tsc-checkjs)

Tsc-checkjs is proof-of-concept Javascript typechecker using Typescript compiler API to ignore errors generated fom dependencies.

Following sections explain installation, usage and reasoning for writing a new checker.

## Installation

Install the package

* `npm install --save-dev tsc-checkjs`

## Usage

* `tsc-checkjs <LIST OF FILES>`
* or `npx tsc-checkjs <LIST OF FILES>`

## Why wrapper is needed?

Typescript FAQ(1) states following: 
> to do so, the compiler needs the definition of a module, this could be a .ts file for your own code, or a .d.ts for an imported  definition file. If the file was found, it will be included regardless of whether it was excluded in the previous steps or not.
> 
>So to exclude a file from the compilation, you need to exclude both the file itself and all files that have an import or /// <reference path="..." /> directive to it.

In some cases unwanted errors are generated when using tsc for Javascript typechecking.

### Example of unwanted typecheck errors

Running `tsc --noImplicitAny -p jsconfig.json` in **test/ex** folder gives following output:

```
index.js:3:14 - error TS2554: Expected 0 arguments, but got 1.

3 testdata.foo(1)
               ~

node_modules/tsc-checkjs-broken-dep/index.js:3:5 - error TS2322: Type '"1"' is not assignable to type 'number'.

3     a = '1'
      ~


Found 2 errors.
```

Compiler includes **node_modules/tsc-checkjs-broken-dep/index.js** as dependency and checks it causing unwanted error message.

## Example with tsc-checkjs

The PoC code calls Typescript via compiler API and filters out errors of dependencies. Running `node ../../index.js index.js` in **test/ex** folder outputs following:

```
index.js:3:14 - error TS2554: Expected 0 arguments, but got 1.

3 testdata.foo(1)
               ~

Found 1 errors.
Filtered out 1 error entries.
Process exiting with code '1'.
```

Error caused by `node_modules/tsc-checkjs-broken-dep/index.js:3:5` is being filtered out.

Current code is modified from Typescript API example(2).

## Future plans

* Proper CLI with arguments
  * configurable ignore string(s)
  * pass compiler options to compiler (preliminary work done, document)
  * reporter selection. (works automatically now)
* [jt]sconfig.json support

## License

Copyright 2020 jikuja

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## References

(1) https://github.com/microsoft/TypeScript/wiki/FAQ#why-is-a-file-in-the-exclude-list-still-picked-up-by-the-compiler

(2) https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API