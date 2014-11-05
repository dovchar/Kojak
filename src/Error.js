Kojak.Error = {
    _store: [],

    onError: function () {
      window.onerror = function(msg, url, line, col, err) {
        var arr = {
          msg: msg, 
          url: url, 
          line: line,
          col: col,
          stack: err.stack
        };
        Kojak.Error._store.push(arr);
      };
    },

    get: function () {
      return Kojak.Error._store;
    },

    clean: function () {
      Kojak.Error._store = [];
    }
};

Kojak.Error.onError();