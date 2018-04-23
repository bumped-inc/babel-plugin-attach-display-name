// @flow

const pluginTester = require('babel-plugin-tester');
const attachDisplayNamePlugin = require('./attachDisplayName');

pluginTester({
  pluginName: 'attach-display-name',
  plugin: attachDisplayNamePlugin,
  tests: {
    'does not alter function declarations': {
      code: `
        function SayHi(person) {
          return 'Hello ' + person + '!';
        }
      `,
      snapshot: false,
    },
    'does not alter consts with FunctionExpressions': {
      code: `
        const Hey = function (person) {
          return 'Hello ' + person + '!';
        };
      `,
      snapshot: false,
    },
    'does not alter consts with ArrowFunctionExpressions': {
      code: `
        const Hey = person => {
          return 'Hello ' + person + '!';
        };
      `,
      snapshot: false,
    },
    'does not alter consts with ClassExpressions': {
      code: `
        const Hey = class {
          wat() {}
        };
        const There = class Named {
          oh() {}
        };
      `,
      snapshot: false,
    },
    'does not alter consts with BooleanLiterals': {
      code: `
        const Hey = true;
        const There = false;
      `,
      snapshot: false,
    },
    'does not alter consts with NumberLiterals': {
      code: `
        const Hey = 0;
        const There = 0b01010101;
        const Big = 0o1234567;
        const Guy = 0x123456789;
      `,
      snapshot: false,
    },
    'does not alter consts with StringLiterals': {
      code: `
        const Hey = "hey";
        const There = 'there';
        const Guy = \`guy\`;
      `,
      snapshot: false,
    },
    'does not alter consts with ArrayLiterals': {
      code: `
        const Hey = [1, 2, 3];
      `,
      snapshot: false,
    },
    'does not alter consts with ObjectLiterals': {
      code: `
        const Hey = { alpha: 1, bravo: 2 };
      `,
      snapshot: false,
    },
    'does alter consts with CallExpressions': {
      code: `
        const Hey = f();
      `,
      snapshot: true,
    },
    'does alter consts with TaggedTemplateExpressions': {
      code: `
        const Hey = f\`cool template string\`;
      `,
      snapshot: true,
    },
    'does not alter camelCased consts with CallExpressions': {
      code: `
        const hey = f();
        const heyThere = f();
      `,
      snapshot: false,
    },
    'does not alter CONST_CASED consts with CallExpressions': {
      code: `
        const HEY = f();
        const HEY_THERE = f();
      `,
      snapshot: false,
    },
    'does alter PREFIXEDPascalCase consts': {
      code: `
        const BLAHHey = f();
      `,
      snapshot: true,
    },
    'does alter lets with CallExpressions': {
      code: `
        let Hey = f();
      `,
      snapshot: true,
    },
    'does alter vars with CallExpressions': {
      code: `
        var Hey = f();
      `,
      snapshot: true,
    },
    'does not act strangely with multiple consts': {
      code: `
        const Hey = f();
        const There = g();
        const Boy = h();
      `,
      snapshot: true,
    },
    'does not alter consts with operations': {
      code: `
        const Alpha = 0 + 1;
        const Bravo = "hey" + "there";
        const Charlie = true || false;
        const Delta = !true;
        const Echo = ~1;
        const Foxtrot = -2;
        const Golf = 1 % 2;
        const Hotel = 1 ^ 2;
        const India = 1 & 2;
        const Juliet = 1 * 2;
        const Kilo = 1 ** 2;
        const Mike = 1 - 2;
        const November = true && false;
        const Oscar = 1 | 2;
        const Papa = 1 >> 2;
        const Quebec = 1 >>> 2;
        const Romeo = 1 << 2;
      `,
      snapshot: false,
    },
    'does not alter consts with require calls': {
      code: `
        const Alpha = require('Alpha');
        const Bravo = require(2);
      `,
      snapshot: false,
    },
    'does not alter consts with require.requireActual calls': {
      code: `
        const Alpha = require.requireActual('Alpha');
        const Bravo = require.requireActual(2);
      `,
      snapshot: false,
    },
    'does not alter consts with require.anything calls': {
      code: `
        const Alpha = require.foo('Alpha');
        const Bravo = require.bar(2);
      `,
      snapshot: false,
    },
    'does not alter consts with __webpack_require__ calls': {
      code: `
        const Alpha = __webpack_require__('Alpha');
        const Bravo = __webpack_require__(2);
      `,
      snapshot: false,
    },
    'does not alter consts with IIFEs': {
      code: `
        const Alpha = function () {
          return 'Hello!';
        }();
        const Bravo = (() => 'Hello!')();
      `,
      snapshot: false,
    },
    'does not alter consts that are keyMirrors': {
      code: `
        const Alpha = keyMirror({ alpha: null, bravo: null });
      `,
      snapshot: false,
    },
    'does not alter consts that are getNative calls': {
      code: `
        const Alpha = getNative(root, 'Alpha');
      `,
      snapshot: false,
    },
    'does not alter consts that are requireNativeComponent calls': {
      code: `
        const Alpha = requireNativeComponent('Alpha');
      `,
      snapshot: false,
    },
    'does not alter consts that end with PropTypes': {
      code: `
        const AlphaPropTypes = makeCoolPropTypes();
      `,
      snapshot: false,
    },
    'does not alter consts that end with PropType': {
      code: `
        const AlphaPropType = makeCoolPropType();
      `,
      snapshot: false,
    },
    'does not alter consts that end with Attributes': {
      code: `
        const AlphaAttributes = makeCoolAttributes();
      `,
      snapshot: false,
    },
    'does not alter consts that are called Ctor': {
      code: `
        const Ctor = makeCtor();
      `,
      snapshot: false,
    },
    'does not alter consts that are called Constructor': {
      code: `
        const Constructor = makeConstructor();
      `,
      snapshot: false,
    },
    'does not alter consts that are called Cmp': {
      code: `
        const Cmp = makeCmp();
      `,
      snapshot: false,
    },
    'does not alter consts that are called Component': {
      code: `
        const Component = makeComponent();
      `,
      snapshot: false,
    },
    'does not alter consts that are called RealComponent': {
      code: `
        const RealComponent = makeRealComponent();
      `,
      snapshot: false,
    },
    'does not alter consts that have two characters': {
      code: `
        const Ab = cd();
      `,
      snapshot: false,
    },
    'does alter consts that are SequenceExpressions': {
      code: `
        const Alpha = (bravo(), charlie());
      `,
      snapshot: true,
    },
  },
});
