/*global jQuery, Handlebars */
jQuery(function ($) {
	'use strict';

  var STORAGE_ID = 'todos-jquery',
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

    var putItemSQL =
        'UPDATE "todos" SET stuff=%(stuff) WHERE id = %(id);        \n'+
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


  var Utils = {

		uuid: function () {

			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},

		pluralize: function (count, word) {

			return count === 1 ? word : word + 's';
		},

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

	var App = {
		init: function () {
      var that = this;
			this.ENTER_KEY = 13;
      Utils.get(function(r) {

        that.todos = r;
        that.render();
      });
      this.cacheElements();
      this.bindEvents();
		},
		cacheElements: function () {
			this.todoTemplate = Handlebars.compile($('#todo-template').html());
			this.footerTemplate = Handlebars.compile($('#footer-template').html());
			this.$todoApp = $('#todoapp');
			this.$newTodo = $('#new-todo');
			this.$toggleAll = $('#toggle-all');
			this.$main = $('#main');
			this.$todoList = $('#todo-list');
			this.$footer = this.$todoApp.find('#footer');
			this.$count = $('#todo-count');
			this.$clearBtn = $('#clear-completed');
		},
		bindEvents: function () {
			var list = this.$todoList;
			this.$newTodo.on('keyup', this.create);
			this.$toggleAll.on('change', this.toggleAll);
			this.$footer.on('click', '#clear-completed', this.destroyCompleted);
			list.on('change', '.toggle', this.toggle);
			list.on('dblclick', 'label', this.edit);
			list.on('keypress', '.edit', this.blurOnEnter);
			list.on('blur', '.edit', this.update);
			list.on('click', '.destroy', this.destroy);
		},
		render: function () {
			this.$todoList.html(this.todoTemplate(this.todos));
			this.$main.toggle(!!this.todos.length);
			this.$toggleAll.prop('checked', !this.activeTodoCount());
			this.renderFooter();
			Utils.put(this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.activeTodoCount();
			var footer = {
				activeTodoCount: activeTodoCount,
				activeTodoWord: Utils.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount
			};

			this.$footer.toggle(!!todoCount);
			this.$footer.html(this.footerTemplate(footer));
		},
		toggleAll: function () {
			var isChecked = $(this).prop('checked');

			$.each(App.todos, function (i, val) {
				val.completed = isChecked;
			});

			App.render();
		},
		activeTodoCount: function () {
			var count = 0;

			$.each(this.todos, function (i, val) {
				if (!val.completed) {
					count++;
				}
			});

			return count;
		},
		destroyCompleted: function () {
			var todos = App.todos;
			var l = todos.length;

			while (l--) {
				if (todos[l].completed) {
					todos.splice(l, 1);
				}
			}

			App.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding todo in the todos array
		getTodo: function (elem, callback) {
			var id = $(elem).closest('li').data('id');

			$.each(this.todos, function (i, val) {
				if (val.id === id) {
					callback.apply(App, arguments);
					return false;
				}
			});
		},
		create: function (e) {
			var $input = $(this);
			var val = $.trim($input.val());

			if (e.which !== App.ENTER_KEY || !val) {
				return;
			}

			App.todos.push({
				id: Utils.uuid(),
				title: val,
				completed: false
			});

			$input.val('');
			App.render();
		},
		toggle: function () {
			App.getTodo(this, function (i, val) {
				val.completed = !val.completed;
			});
			App.render();
		},
		edit: function () {
			$(this).closest('li').addClass('editing').find('.edit').focus();
		},
		blurOnEnter: function (e) {
			if (e.which === App.ENTER_KEY) {
				e.target.blur();
			}
		},
		update: function () {
			var val = $.trim($(this).removeClass('editing').val());

			App.getTodo(this, function (i) {
				if (val) {
					this.todos[i].title = val;
				} else {
					this.todos.splice(i, 1);
				}
				this.render();
			});
		},
		destroy: function () {
			App.getTodo(this, function (i) {
				this.todos.splice(i, 1);
				this.render();
			});
		}
	};

	App.init();
});
