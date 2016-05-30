(function () {
  'use strict';

  /**
   * State Access rights map factory
   * @name StatePermissionMapFactory
   *
   * @param TransitionProperties {permission.TransitionProperties} Helper storing ui-router transition parameters
   * @param PermissionMap {permission.PermissionMap}
   *
   * @return {permission.StatePermissionMap}
   */
  function StatePermissionMapFactory(TransitionProperties, PermissionMap) {

    StatePermissionMap.prototype = new PermissionMap();
    StatePermissionMap.constructor = StatePermissionMap;
    StatePermissionMap.prototype.parent = PermissionMap.prototype;


    /**
     * Constructs map object instructing authorization service how to handle authorizing
     * Adding new flag override:boolean, to allow override parents permission and resolve only self
     *
     * @example
     *
     * 	$stateProvider.state('app', {
     * 		views: {
     * 			// some views
     * 		},
     * 		data: {
     * 			permissions: {
     * 				only: ['AUTHORIZED'],
     * 				redirectTo: 'login'
     * 			}
     * 		}
     * 	}).state('app.foo', {
     *      views: {
     * 		    // some foo views
     * 		},
     * 		data: {
     * 			permissions: {
     * 				only: ['FOO_ROLE'], // here will be checked AUTHORIZED and FOO_ROLE
     * 				redirectTo: 'login'
     * 			}
     * 		}
     * 	}).state('app.foo.bar', {
     * 	  views: {
     *			// some bar views
     *		},
     * 		data: {
     * 			permissions: {
     * 				only: ['ALLOW_UNAUTHORIZED'],
     * 				override: true // flag to allow override previous permissions
     *			}
     *		}
     * 	});
     *
     * @constructor StatePermissionMap
     * @extends PermissionMap
     * @memberOf permission
     */
    function StatePermissionMap() {
      this.parent.constructor.call(this);

      var toStateObject = TransitionProperties.toState.$$state(),
        toStatePath = toStateObject.path.slice().reverse(),
        override = false;

      angular.forEach(toStatePath, function (state, idx) {
        if (!override && state.areSetStatePermissions()) {
          if(!idx) { // idx === 0
            override = state.data.permissions.override || false;
          }
          var permissionMap = new PermissionMap(state.data.permissions);
          this.extendPermissionMap(permissionMap);
        }
      }, this);
    }

    /**
     * Extends permission map by pushing to it state's permissions
     * @method
     * @methodOf permission.StatePermissionMap
     *
     * @param permissionMap {permission.PermissionMap} Compensated permission map
     */
    StatePermissionMap.prototype.extendPermissionMap = function (permissionMap) {
      if (permissionMap.only.length) {
        this.only = this.only.concat([permissionMap.only]);
      }
      if (permissionMap.except.length) {
        this.except = this.except.concat([permissionMap.except]);
      }
      this.redirectTo = permissionMap.redirectTo;
    };

    return StatePermissionMap;
  }

  angular
    .module('permission')
    .factory('StatePermissionMap', StatePermissionMapFactory);
}());