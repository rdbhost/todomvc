
/*
 *  substitute sync function that stores data to Rdbhost backend
 *
 */

Backbone.sync = function(method, model, options) {

  var callback = options.success,
      errback = options.error;

  if ( method == 'read' ) {

    if ( model.id ) {

      getSpecificTodo().done(callback)
          .fail(function(err, ermsg) { callback([]) });
    }
    else {

      getAllTodos().done(callback)
          .fail(function(err, errmsg){ callback([]) });
    }
  }

  else if ( method === 'create' ) {

    var id = model.id = model.id || model.cid,
        json = JSON.stringify(model);
    storeNewTodo(id, json).done(callback);
  }

  else if ( method === 'update' ) {

    var id = model.id,
        json = JSON.stringify(model);
    storeExistingTodo(id, json).done(callback);
  }

  else if ( method === 'delete' ) {

    deleteTodo(model.id).done(callback);
  }

  else {

    throw new Error('invalid method '+method);
  }

};


var STORAGE_ID = 'todos-angularjs',
    role = "p0000001258";


function getAllTodos() {

  var getAllTodosSQL = 'SELECT * FROM "todos-backbone";';

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


function getSpecificTodo() {

  var getTodoSQL = 'SELECT * FROM "todos-backbone" WHERE id = %s;';

  return $.postData( {

    q: getTodoSQL,
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

  var storeTodoSQL = 'INSERT INTO "todos-backbone" (id, stuff) VALUES(%s,%s);';

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

  var storeTodoSQL = 'UPDATE "todos-backbone" SET stuff = %s WHERE id = %s;';

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

  var delTodoSQL = 'DELETE FROM "todos-backbone" WHERE id = %s;';

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


//
