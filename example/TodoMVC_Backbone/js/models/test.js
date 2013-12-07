/*global Backbone */
var app = app || {};

(function () {
  'use strict';

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `completed` attributes.
  app.TestModel = Backbone.Model.extend({
    url: '/users'
  });
})();
