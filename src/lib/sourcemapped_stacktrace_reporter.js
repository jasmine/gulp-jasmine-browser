(function() {
  jasmine.getEnv().addReporter({
    jasmineDone: function() {
      var traces = document.querySelectorAll('.jasmine-stack-trace');
      for(var i = 0; i < traces.length; i++) {
        (function(node){
          sourceMappedStackTrace.mapStackTrace(node.textContent, function(stack) {
            if (stack.filter) {
              stack = stack.filter(function(line) {
                return line.match(/\.js:\d+:\d+\)$/);
              });
            }
            node.textContent = node.previousSibling.textContent + '\n' + stack.join('\n');
          });
        })(traces[i]);
      }
    }
  });
})();
