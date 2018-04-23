'use strict';

module.exports = function(babel) {
  var t = babel.types;
  var template = require('babel-template');

  var SEEN_SYMBOL = Symbol();
  var ATTACHED_SYMBOL = Symbol();
  var ATTACH_DISPLAY_NAME = '$attachDisplayName';

  var attachDisplayNameTemplate = template(`
    return function (value, name) {
      if (typeof value === 'function') {
        try {
          value.displayName = name;
        } catch (error) {
          // ignore errors
        }
      }
      return value;
    }
  `);

  function isPascalCase(name) {
    return /^[A-Z]+[a-z][A-Za-z0-9_]*$/.test(name);
  }

  var IGNORED_NAMES = ['Constructor', 'Ctor', 'Cmp'];

  function shouldWrapByName(name) {
    return (
      typeof name === 'string' &&
      name.length > 2 &&
      isPascalCase(name) &&
      IGNORED_NAMES.indexOf(name) === -1 &&
      !/PropTypes?$/.test(name) &&
      !/Attributes$/.test(name) &&
      !/Component$/.test(name)
    );
  }

  var IGNORED_FUNCTION_CALLS = [
    'require',
    '__webpack_require__',
    'keyMirror',
    'getNative', // react-native
    'requireNativeComponent', // react-native
    '_interopDefault', // babel-related, I believe
    '_interopRequireWildcard', // babel-related, I believe
  ];

  function shouldWrap(name, node) {
    if (!node || node[SEEN_SYMBOL] || !shouldWrapByName(name)) {
      return false;
    }
    // e.g. example`template thing`
    if (t.isTaggedTemplateExpression(node)) {
      return true;
    }
    if (t.isCallExpression(node)) {
      // skip require() calls and similar
      if (
        IGNORED_FUNCTION_CALLS.some(function(name) {
          return t.isIdentifier(node.callee, { name: name });
        })
      ) {
        return false;
      }
      // skip IIFEs (immediately-invoked function expressions)
      if (
        t.isFunctionExpression(node.callee) ||
        t.isArrowFunctionExpression(node.callee)
      ) {
        return false;
      }
      // require.something(), often require.requireActual()
      if (
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object, { name: 'require' })
      ) {
        return false;
      }
      // e.g. normalCall(...)
      return true;
    }
    if (t.isSequenceExpression(node)) {
      var expressions = node.expressions;
      return shouldWrap(name, expressions[expressions.length - 1]);
    }
    return false;
  }

  function getTopLevelScope(scope) {
    var parent = scope.parent;
    if (!parent) {
      return scope;
    }
    return getTopLevelScope(parent);
  }

  function addTopLevelFunctionDeclaration(path) {
    if (path.scope.hasBinding(ATTACH_DISPLAY_NAME)) {
      return;
    }
    var topScope = getTopLevelScope(path.scope);
    topScope.push({
      id: t.identifier(ATTACH_DISPLAY_NAME),
      init: attachDisplayNameTemplate({}).argument,
    });
  }

  function wrap(path, name) {
    path.node[SEEN_SYMBOL] = true;
    var replacement = t.callExpression(t.identifier(ATTACH_DISPLAY_NAME), [
      path.node,
      t.stringLiteral(name),
    ]);
    replacement[SEEN_SYMBOL] = true;
    path.replaceWith(replacement);
    addTopLevelFunctionDeclaration(path);
  }

  return {
    visitor: {
      VariableDeclaration: {
        exit: function(path, state) {
          var node = path.node;
          if (process.env.NODE_ENV === 'production') {
            return;
          }
          if (node[SEEN_SYMBOL]) {
            return;
          }
          node[SEEN_SYMBOL] = true;
          node.declarations.forEach(function(declaratorNode, index) {
            if (
              t.isIdentifier(declaratorNode.id) &&
              shouldWrap(declaratorNode.id.name, declaratorNode.init)
            ) {
              var init = path.get('declarations.' + index + '.init');
              wrap(init, declaratorNode.id.name);
            }
          });
        },
      },
    },
  };
};
