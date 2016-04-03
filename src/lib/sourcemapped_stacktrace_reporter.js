(function() {
  jasmine.getEnv().addReporter({
    jasmineDone: function() {
      var traces = document.querySelectorAll('.jasmine-stack-trace');
      for(var i = 0; i < traces.length; i++) {
        (function(node){
          sourceMappedStackTrace.mapStackTrace(node.textContent, function(stack) {
            node.textContent = node.previousSibling.textContent + '\n' + stack.join('\n');
          });
        })(traces[i]);
      }
    }
  });
})();
