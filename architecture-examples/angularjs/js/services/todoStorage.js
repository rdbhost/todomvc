/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function () {

	var STORAGE_ID = 'todos-angularjs',
      role = "p0000001258";

  function getItem(id, _callback) {

      var getItemSQL = 'SELECT stuff FROM "todos" WHERE id = %s; \n';

      return $.postData({

          userName: role,
          domain: 'www.rdbhost.com',
          args: [id],
          q: getItemSQL,
          callback: function (resp) {

            if ( resp.row_count[0] > 0 ) {

              _callback( resp.records.rows[0][0] );
            }
            else {
              _callback( JSON.stringify([]) );
            }
          }
      });
  }


  function setItem(id, item) {

    var putItemSQL = 'UPDATE "todos" SET stuff=%(stuff) WHERE id = %(id);        \n'+
                     'INSERT INTO "todos" (id,stuff) SELECT %(id), %(stuff)      \n'+
                     '  WHERE NOT EXISTS (SELECT 1 FROM "todos" WHERE id=%(id)); \n';

    return $.postData({

      userName: role,
      domain: 'www.rdbhost.com',
      q: putItemSQL,
      namedParams: { 'id': id, 'stuff': item },
      callback: function (resp) {}
    });
  }

	return {
		get: function (callback) {
      getItem(STORAGE_ID, function(r) {
        var ret = JSON.parse(r);
        callback(ret);
      });
		},

		put: function (todos) {
			setItem(STORAGE_ID, JSON.stringify(todos));
		}
	};
});
