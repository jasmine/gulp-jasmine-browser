(function() {
  jasmine.getEnv().addReporter({
    jasmineDone: function() {
      Array.prototype.slice.call(document.querySelectorAll('.jasmine-stack-trace'), 0).forEach(function(node) {
        sourceMappedStackTrace.mapStackTrace(node.textContent, function(stack) {
          stack = stack.filter(function(line) { return line.match(/\.js:\d+:\d+\)$/); });
          node.textContent = node.previousSibling.textContent + '\n' + stack.join('\n');
          node.style.display = 'block';
        });
      });
    }
  });
})();
