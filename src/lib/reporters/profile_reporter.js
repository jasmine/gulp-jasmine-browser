function getJasmineRequireObj() {
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().profile = function(jRequire, j$) {
  j$.ProfileReporter = jRequire.ProfileReporter();
};

getJasmineRequireObj().ProfileReporter = function() {
  function ProfileReporter(options) {
    var records = {};
    var suiteRecords = {};
    var print = options.print || console.log.bind(console);
    var onComplete = options.onComplete || function() {};

    this.specStarted = function() {
      this.specStartTime = Date.now()
    };
    this.specDone = function(result) {
      var seconds = (Date.now() - this.specStartTime) / 1000;
      records[result.id] = [result, seconds];
    };
    this.suiteStarted = function(result) {
      this.suiteStartTime = Date.now();
    };
    this.suiteDone = function(result) {
      var seconds = (Date.now() - this.suiteStartTime) / 1000;
      suiteRecords[result.id] = [result, seconds];
    };

    function objectValues(object) {
      var values = [];
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          values.push(object[key]);
        }
      }
      return values;
    }

    function reportSpecTiming() {
      print('\n');
      print('10 slowest specs');
      print('\n');
      print('spec time (seconds): full spec name');
      print('\n');

      print(objectValues(records).sort(function(a, b) {
        return b[1] - a[1];
      }).slice(0, 10).map(function(record) {
        return '' + record[1] + ': ' + record[0].fullName;
      }).join('\n'));
      print('\n');
    }

    function reportSuiteTiming() {
      print('\n');
      print('10 slowest describes');
      print('\n');
      print('suite time (seconds): full describe name');
      print('\n');

      print(objectValues(suiteRecords).sort(function(a, b) {
        return b[1] - a[1];
      }).slice(0, 10).map(function(record) {
        return '' + record[1] + ': ' + record[0].fullName;
      }).join('\n'));
      print('\n');
    }

    this.jasmineDone = function() {
      reportSpecTiming();
      reportSuiteTiming();
      onComplete();
    };

    return this;
  }

  return ProfileReporter;
};
