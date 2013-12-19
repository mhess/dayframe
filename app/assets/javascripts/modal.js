//= require bootstrap/modal
//= require util

angular.module('bootstrapModal', [])

  .provider('$modals', function(){
              var modals = {};
              var modalOuter;
              var modalContainer;
              var containerHTML = '<div class="modal fade"><div class="modal-dialog"></div></div>';

              // cfg objects = {open: function, ctrl: string }
              this.register = function(name, cfg) { modals[name] = cfg; };

              // The actual $modals service object
              var modalService = {};

              this.$get = ['$document', '$compile', '$controller', '$rootScope',
                           '$http', '$templateCache', '$window', '$q',
                function($document, $compile, $controller, $rootScope, $http, $templateCache, $window, $q) {
                  modalOuter = $(containerHTML).appendTo($document.find(this.appSelector));
                  modalContainer = modalOuter.find('.modal-dialog');
                  angular.forEach(modals,
                    function(cfg, name) {
                      cfg.close = function(val, err) {
                        modalOuter.modal('hide');
                        cfg.content.remove();
                        cfg.scope.$destroy();
                        if ( err ) cfg.deferred.reject(val);
                        else cfg.deferred.resolve(val);};
                      modalService[name] = function(args) {
                        cfg.deferred = $q.defer();
                        $http.get(cfg.tmplUrl, {cache: $templateCache})
                          .then(
                            function(resp){
                              // Create a new scope and instantiate new controller for each call
                              cfg.scope = $rootScope.$new();
                              cfg.content = $compile(resp.data)(cfg.scope);
                              $controller(cfg.ctrl, {$scope: cfg.scope, $close: cfg.close});
                              angular.extend(cfg.scope, cfg.open(args));
                              modalContainer.append(cfg.content);
                              modalOuter.modal('show');},
                            function(){$window.alert('Loading modal template failed: '+cfg.tmplUrl);});
                          return cfg.deferred.promise;};});
                  return modalService;
                }];
            });