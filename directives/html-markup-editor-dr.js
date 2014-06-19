'use strict';

angular.module('tagyComponents')
  .directive('htmlMarkupEditorDr', function (markupChangeIdFac,EditableStyleSer,$rootScope, EditHtmlService, EditableMessageChannel, $timeout) {
    return {
      template: '<div><textarea id="edit-html-iframe-markup-field" ng-model="editHtml"></textarea><a class="button success" ng-click="updateHtmlPreview()">preview markup</a></div>',
      restrict: 'E',
        scope:{
            editHtml:'@'
        },
      link: function postLink(scope, element, attrs) {
          var dontUpdateOnChangeId
          EditableMessageChannel.onEditableHtmlMarkupChange(scope,function(markup, changeId, markupWithEditFrameworkResources){
              if(changeId>dontUpdateOnChangeId|| markupChangeIdFac.getMarkupChangeId(scope.editHtml)==null ) {
                    scope.editHtml=markup
              }
          })

          scope.updateHtmlPreview=function(){
              var mkp=markupChangeIdFac.changeMarkupChangeId(scope.editHtml)
              dontUpdateOnChangeId=markupChangeIdFac.getCurrentChangeId(mkp)
              EditHtmlService.editHtmlMarkup(mkp)
          }


      }
    };
  });
