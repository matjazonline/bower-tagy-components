'use strict';

angular.module('tagyComponents')
  .directive('iframePreviewEditorDr', function ($q,$window, $timeout,markupChangeIdFac,EditableSer,$rootScope,EditableStyleSer,CrossFrameEditableService, EditHtmlService,CrossFrameConnection, EditableMessageChannel) {
    return {
      template:   '<div class="row">' +
          '             <div id="iframe-preview-target-holder" class="small-12 columns">' +
                            '<iframe id="iframe-preview-target" name="iframePreviewTarget" src="about:blank" class="iframe-previewer" frameborder="0" width="100%" height="100%" scrolling="auto" style="min-height: 800px;"></iframe>' +
                        '</div>' +
                  '</div>',
      restrict: 'E',
      scope:{
      },
      link: function postLink(scope, element, attrsattrs) {
          var currIframeDoc=null
          var dontUpdateOnChangeId=null

          EditableMessageChannel.onEditableHtmlMarkupChange(scope,function(markup, changeId, markupWithEditFrameworkResources){
              if(changeId>dontUpdateOnChangeId) {
                  setIframeMarkup(markupWithEditFrameworkResources)
                  EditableMessageChannel.dispatchIframePreviewHtmlMarkupReset(markup,changeId)
              }
          })

          var editUpdatedHandler = function (editableItem,updatedElem,noHTMLrefresh) {
              if(noHTMLrefresh==true){
                  return
              }
              var mkp=markupChangeIdFac.changeMarkupChangeId(EditHtmlService.cleanEditFrameworkCode  (getMarkup()))
              dontUpdateOnChangeId=markupChangeIdFac.getCurrentChangeId(mkp)
              EditHtmlService.editHtmlMarkup(mkp)
          };


          CrossFrameConnection.onFrameConnectionSuccess(scope,function(){
              CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDIT_UPDATED, editUpdatedHandler))
              CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDITABLE_STYLE_VALUE_UPDATED, editUpdatedHandler))
              CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_NEW_VALUE_COMPONENT_UPDATED, editUpdatedHandler))
              CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDITABLE_COMPONENT_REMOVED, editUpdatedHandler))
          })

          var getMarkup=function(){
              if(currIframeDoc==null)return null
              var mkp = EditHtmlService.getDocTypeAsString(currIframeDoc) + currIframeDoc.documentElement.outerHTML;
              return  mkp
          }

          var getCurrIframeDoc=function(){
              // firefox can't connect frames if existing iframe is used??
              var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
              var deferred=$q.defer()
              if(currIframeDoc==null ){
                  currIframeDoc = document.querySelector('#iframe-preview-target').contentWindow.document;
                  deferred.resolve(currIframeDoc)
              }    else if(!isChrome){

                  $("#iframe-preview-target").remove()
                  $("#iframe-preview-target-holder").append('<iframe id="iframe-preview-target" name="iframePreviewTarget" src="about:blank" class="iframe-previewer" frameborder="0" width="100%" height="100%" scrolling="auto" style="min-height: 800px;"></iframe>')
                  //document.defaultView is null in FF without $timeout
                  $timeout(function(){
                      currIframeDoc = document.querySelector('#iframe-preview-target').contentWindow.document;
                      deferred.resolve(currIframeDoc)
                  },0)
              }else{
                  deferred.resolve(currIframeDoc)
              }
              return deferred.promise
          }

          var setIframeMarkup=function(markup){
              var ifrDocPr=getCurrIframeDoc()
              ifrDocPr.then(function(ifrDoc){
                  if(ifrDoc!=null){
                      ifrDoc.open('text/html', 'replace');
                      ifrDoc.write(markup);
                      ifrDoc.close();
                      CrossFrameConnection.connectFrames( ifrDoc)
                  }
              })


          }
      }
    };
  });
