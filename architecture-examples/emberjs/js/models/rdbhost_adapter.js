(function() {
  /*global jQuery*/

  var get = Ember.get, set = Ember.set, merge = Ember.merge;



  /**
   The REST adapter allows your store to communicate with an HTTP server by
   transmitting JSON via XHR. Most Ember.js apps that consume a JSON API
   should use the REST adapter.

   This adapter is designed around the idea that the JSON exchanged with
   the server should be conventional.

   ## JSON Structure

   The REST adapter expects the JSON returned from your server to follow
   these conventions.

   ### Object Root

   The JSON payload should be an object that contains the record inside a
   root property. For example, in response to a `GET` request for
   `/posts/1`, the JSON should look like this:

   ```js
   {
     "post": {
       title: "I'm Running to Reform the W3C's Tag",
       author: "Yehuda Katz"
     }
   }
   ```

   ### Conventional Names

   Attribute names in your JSON payload should be the underscored versions of
   the attributes in your Ember.js models.

   For example, if you have a `Person` model:

   ```js
   App.Person = DS.Model.extend({
    firstName: DS.attr('string'),
    lastName: DS.attr('string'),
    occupation: DS.attr('string')
  });
   ```

   The JSON returned should look like this:

   ```js
   {
     "person": {
       "first_name": "Barack",
       "last_name": "Obama",
       "occupation": "President"
     }
   }
   ```
   */

  DS.RHAdapter = DS.Adapter.extend({

    bulkCommit: false,
    since: 'since',

    serializer: DS.JSONSerializer,

    init: function() {
      this._super.apply(this, arguments);
    },

    createRecord: function(store, type, record) {

      record.id = record.clientId;
      var data = this.serialize(record, { includeId: true }),
          json0 = JSON.stringify(data);

      var that = this;
      storeNewTodo(record.id, json0).then(function(json) {
          Ember.run(that, function(){
            that.didCreateRecord(store, type, record, json);
          });
      });
    },

    updateRecord: function(store, type, record) {

      var id = get(record, 'id').toString(),

          data = this.serialize(record),
          json0 = JSON.stringify(data);
          that = this;

      storeExistingTodo(id, json0).then(function(json) {
          Ember.run(that, function(){
            that.didSaveRecord(store, type, record, json);
          });
      });
    },

    deleteRecord: function(store, type, record) {

      var id = get(record, 'id').toString();
      var that = this;

      deleteTodo(id).then(function(json) {
        Ember.run(that, function(){
          that.didSaveRecord(store, type, record, json);
        });
      });
    },

    findAll: function(store, type, since) {

      var that = this;
      getAllTodos().then(function(json) {

          var root = 'todos',
              json2 = {};
          json2[root] = json;
          Ember.run(that, function(){
            that.didFindAll(store, type, json2);
          });
      });
    },


    /**
     @private

     This method serializes a list of IDs using `serializeId`

     @returns {Array} an array of serialized IDs
     */
    serializeIds: function(ids) {
      var serializer = get(this, 'serializer');

      return Ember.EnumerableUtils.map(ids, function(id) {
        return serializer.serializeId(id);
      });
    },

    didError: function(store, type, record, xhr) {
      if (xhr.status === 422) {
        var data = JSON.parse(xhr.responseText);
        store.recordWasInvalid(record, data['errors']);
      } else {
        this._super.apply(this, arguments);
      }
    },

/*
    ajax: function(url, type, hash) {
      hash.url = url;
      hash.type = type;
      hash.dataType = 'json';
      hash.contentType = 'application/json; charset=utf-8';
      hash.context = this;

      if (hash.data && type !== 'GET') {
        hash.data = JSON.stringify(hash.data);
      }

      jQuery.ajax(hash);
    },
*/

    url: "",


/*
    rootForType: function(type) {
      var serializer = get(this, 'serializer');
      return serializer.rootForType(type);
    },
*/


    pluralize: function(string) {
      var serializer = get(this, 'serializer');
      return serializer.pluralize(string);
    }

/*
    buildURL: function(record, suffix) {
      var url = [this.url];

      Ember.assert("Namespace URL (" + this.namespace + ") must not start with slash", !this.namespace || this.namespace.toString().charAt(0) !== "/");
      Ember.assert("Record URL (" + record + ") must not start with slash", !record || record.toString().charAt(0) !== "/");
      Ember.assert("URL suffix (" + suffix + ") must not start with slash", !suffix || suffix.toString().charAt(0) !== "/");

      if (this.namespace !== undefined) {
        url.push(this.namespace);
      }

      url.push(this.pluralize(record));
      if (suffix !== undefined) {
        url.push(suffix);
      }

      return url.join("/");
    },
*/

/*
    sinceQuery: function(since) {
      var query = {};
      query[get(this, 'since')] = since;
      return since ? query : null;
    }
*/
  });


  var role = "p0000001258";


  function getAllTodos() {

    var getAllTodosSQL = 'SELECT * FROM "todos-emberjs";';

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

    var getTodoSQL = 'SELECT * FROM "todos-emberjs" WHERE id = %s;';

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

    var storeTodoSQL = 'INSERT INTO "todos-emberjs" (id, stuff) VALUES(%s,%s);';

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

    var storeTodoSQL = 'UPDATE "todos-emberjs" SET stuff = %s WHERE id = %s;';

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

    var delTodoSQL = 'DELETE FROM "todos-emberjs" WHERE id = %s;';

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

