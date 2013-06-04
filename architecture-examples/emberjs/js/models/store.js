/*global Todos DS */
'use strict';

Todos.Store = DS.Store.extend({
	revision: 12,
  adapter: 'Todos.RHAdapter'
});

Todos.RHAdapter = DS.RHAdapter.extend({
	namespace: 'todos-emberjs'
});
