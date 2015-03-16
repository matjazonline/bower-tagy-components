'use strict';

angular.module('tagyComponents')
    .directive('htmlMarkupEditorAce', function (markupChangeIdFac,EditableStyleSer,$rootScope, EditHtmlService, EditableMessageChannel, $timeout,$q) {
        return {
            template: '<div><a ng-show="showButton!=null" class="button success" ng-click="updateHtmlPreview()"><i class="fa fa-desktop"></i> update and preview changes</a>' +
                '<div ui-ace="{showGutter: true,theme:\'twilight\',mode: \'html\',onLoad: aceLoaded,onChange: aceChanged}" ng-model="editHtml"></div></div>',
            restrict: 'E',
            scope:{
                rootRelPagePath:'@',
                showButton:'@',
                editHtml:'@',
                setUpdateHtmlAceValueFn:'='
            },
            link: function postLink(scope, element, attrs) {
                var dontUpdateOnChangeId,aceEditor,lastCursorPosition
                EditableMessageChannel.onEditableHtmlMarkupChange(scope,function(markup, changeId, markupWithEditFrameworkResources){
                    if(changeId>dontUpdateOnChangeId|| markupChangeIdFac.getMarkupChangeId(scope.editHtml)==null ) {
                        scope.editHtml=markup
                    }
                })

                scope.updateHtmlPreview=function(positionCursor){
                    if(aceEditor)lastCursorPosition=aceEditor.getCursorPosition()
                    var deferred = $q.defer();
                    if(scope.aceDirty) {
                        var mkp = markupChangeIdFac.changeMarkupChangeId(scope.editHtml)
                        dontUpdateOnChangeId = markupChangeIdFac.getCurrentChangeId(mkp)
                        var updatedPromise=EditHtmlService.editHtmlMarkup(mkp,false,scope.rootRelPagePath)
                        updatedPromise.then(function(){
                            var positionCursor=function(){
                                $timeout(function(){
                                    aceEditor.focus()
                                    if(lastCursorPosition){
                                        aceEditor.moveCursorToPosition(lastCursorPosition)
                                        aceEditor.scrollToLine(lastCursorPosition.row, true)
                                    }
                                },1000)
                            }
                            if(positionCursor==true || positionCursor==null)positionCursor()
                            deferred.resolve(positionCursor);
                        })
                    }else{
                        deferred.reject()
                    }
                    return deferred.promise
                }

                scope.aceDirty=false
                scope.aceLoaded = function(_editor) {
                    // Options
                    aceEditor=_editor
                    if(lastCursorPosition)aceEditor.moveCursorToPosition(lastCursorPosition)
                    scope.aceDirty=false
                };

                scope.aceChanged = function(e) {
                    scope.aceDirty=true
                };

                if(scope.setUpdateHtmlAceValueFn!=null){
                    scope.setUpdateHtmlAceValueFn(scope.updateHtmlPreview)
                }else{
                    if(scope.showButton!=null && scope.showButton!=false)console.log("INFO tagyComponents.html-markup-editor-ace.js - setUpdateHtmlAceValueFn not set")
                    scope.showButton=false
                }
            }
        };
    });
