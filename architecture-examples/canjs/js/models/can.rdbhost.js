(function() {

  can.Model('can.Model.Rdbhost', {

    findAll : function (params) {

      var self = this;

      return getAllTodos().then(function(todos) {

        var instances = [];

        can.each(todos, function (todo) {
          instances.push(new self(todo));
        });

        return instances;
      })
    },

    findOne : function (params) {

      var id = params.id;

      return getSpecificTodo(id).then(function(todos) {

        var instances = [];

        can.each(todos, function (todo) {
          instances.push(new self(todo));
        });

        return instances;
      })
    },

    destroy : function (id) {

      return deleteTodo(id);
    },

    create : function (attrs) {

      attrs.id = attrs.id || parseInt(100000 * Math.random(), 10);

      var data = JSON.stringify(attrs);
      return storeNewTodo(attrs.id, data)
          .then(function(json) {return attrs});
    },

    update : function (id, attrs) {

      return getSpecificTodo(id).then(function(todo) {

        can.extend(todo, attrs);
        var data = JSON.stringify(todo);
        storeExistingTodo(id, data);
      });
    }


  }, {});


  var role = "p0000001258";


  function getAllTodos() {

    var getAllTodosSQL = 'SELECT * FROM "todos-canjs";';

    return $.postData( {

      q: getAllTodosSQL,
      userName: role,
      domain: 'www.rdbhost.com',

      callback: function(resp) {

        if ( resp.row_count[0] ) {

          var ret = _.map(resp.records.rows, function(row) {

            var r = JSON.parse(row[1]);
            r.id = row[0];
            return r;
          });
          return ret;
        }
        else {

          return [];
        }
      }
    });

  }


  function getSpecificTodo(id) {

    var getTodoSQL = 'SELECT * FROM "todos-canjs" WHERE id = %s;';

    return $.postData( {

      q: getTodoSQL,
      args: [id],

      userName: role,
      domain: 'www.rdbhost.com',

      callback: function(resp) {

        if ( resp.row_count[0] ) {

          var ret = JSON.parse(resp.records.rows[0][1]);
          ret.id = resp.records.rows[0][0];
          return ret;
        }
        else {

          return [];
        }
      }
    });

  }


  function storeNewTodo(id, json) {

    var storeTodoSQL = 'INSERT INTO "todos-canjs" (id, stuff) VALUES(%s,%s);';

    return $.postData( {

      q: storeTodoSQL,
      args: [id,json],

      userName: role,
      domain: 'www.rdbhost.com',

      callback: function(resp) {

        return resp.row_count[0];
      }
    });

  }


  function storeExistingTodo(id, json) {

    var storeTodoSQL = 'UPDATE "todos-canjs" SET stuff = %s WHERE id = %s;';

    return $.postData( {

      q: storeTodoSQL,
      args: [json, id],

      userName: role,
      domain: 'www.rdbhost.com',

      callback: function(resp) {

        return resp.row_count[0];
      }
    });

  }


  function deleteTodo(id) {

    var delTodoSQL = 'DELETE FROM "todos-canjs" WHERE id = %s;';

    return $.postData( {

      q: delTodoSQL,
      args: [id],

      userName: role,
      domain: 'www.rdbhost.com',

      callback: function(resp) {

        return resp.row_count[0];
      }
    });

  }


})();
