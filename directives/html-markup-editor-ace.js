'use strict';

angular.module('tagyComponents')
  .directive('htmlMarkupEditorAce', function (markupChangeIdFac,EditableStyleSer,$rootScope, EditHtmlService, EditableMessageChannel, $timeout) {
    return {
      template: '<div><a ng-show="showButton!=null" class="button success" ng-click="updateHtmlPreview()"><i class="fa fa-desktop"></i> update and preview changes</a>' +
          '<div ui-ace="{showGutter: true,theme:\'twilight\',mode: \'html\',onLoad: aceLoaded,onChange: aceChanged}" ng-model="editHtml"></div></div>',
      restrict: 'E',
        scope:{
            showButton:'@',
            editHtml:'@',
            setUpdateHtmlAceValueFn:'='
        },
      link: function postLink(scope, element, attrs) {
          var dontUpdateOnChangeId
          EditableMessageChannel.onEditableHtmlMarkupChange(scope,function(markup, changeId, markupWithEditFrameworkResources){
              if(changeId>dontUpdateOnChangeId|| markupChangeIdFac.getMarkupChangeId(scope.editHtml)==null ) {
                  scope.editHtml=markup
              }
          })

          scope.updateHtmlPreview=function(){
              if(scope.aceDirty) {
                  var mkp = markupChangeIdFac.changeMarkupChangeId(scope.editHtml)
                  dontUpdateOnChangeId = markupChangeIdFac.getCurrentChangeId(mkp)
                  EditHtmlService.editHtmlMarkup(mkp)
              }
          }

          scope.aceDirty=false
          scope.aceLoaded = function(_editor) {
              // Options
              scope.aceDirty=false
          };

          scope.aceChanged = function(e) {
              scope.aceDirty=true
          };

          scope.setUpdateHtmlAceValueFn(scope.updateHtmlPreview)
      }
    };
  });
