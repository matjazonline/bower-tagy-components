'use strict';

angular.module('tagyComponents')
  .directive('tagyCmsItemEditor', function (EditableMessageChannel,$timeout) {
    return {
      template: '<div ng-show="isMyEditableItem()">'+
      '<h3>{{_editableItem.title}} <a href="" ng-click="showEditable(editableObject, !_editableItem.visible)"><i class="fa" ng-class="{\'fa-eye\':_editableItem.visible, \'fa-eye-slash\':!_editableItem.visible}"></i></a> <a href="" ng-click="removeEditable(editableObject)"><i class="fa fa-trash-o right" style="color: red;"></i></a> <br/><small>{{_editableItem.description}}</small></h3>' +
      '' +
      '<div  ng-if="_editableItem.type==\'image\'"><img ng-src="{{filePath}}"/>' +
      '<input ng-model="_editableItem.value">' +
      '<h5>optional link on image click:</h5>' +
      '<select ng-model="view.imageLinkProtocol" ng-options="obj.value as obj.label for obj in view.linkProtocols"></select>'+
      '<input placeholder="optional your.com/image/link/path here" ng-model="view.imageLinkUrl">' +
      '<select ng-show="!!view.imageLinkUrl" ng-model="view.imageLinkTarget" ng-options="obj.value as obj.label for obj in view.linkTargets"></select>'+
      '<button class="button success" ng-click="doneEditing()">OK</button>' +
      '</div>' +
      '<form ng-if="_editableItem.type==\'text\'">' +
      '<textarea ng-if="_editableItem.value!=null && _editableItem.editProps.backgroundImage==null" ui-tinymce="tinyMceOptions" class="form-control" ng-model="_editableItem.value"></textarea>' +
      '<div  ng-if="_editableItem.editProps.backgroundImage!=null">' +
      '<img ng-src="{{filePath}}"/>' +
      '<input ng-model="_editableItem.editProps.backgroundImage">' +
      '</div>' +
      '<div  ng-if="_editableItem.editProps.nameAttr!=null" class="row">' +
      'tag/param name:<input ng-model="_editableItem.editProps.nameAttr" placeholder="my_new_tag or my_new_param">' +
      '</div>' +
      '<div  ng-if="_editableItem.editProps.valueAttr!=null" class="row">' +
      'value: <input ng-model="_editableItem.editProps.valueAttr">' +
      '</div>' +
      '<div ng-if="_editableItem.editProps.link!=null" class="row">' +
      'link:<input ng-model="_editableItem.editProps.link">' +
      '</div>' +
      '<button class="button secondary tiny" ng-click="doneEditing()">close</button>' +
      '</form>' +
      '</div>',
      restrict: 'E',
      scope:{
        showForEditableItem:'='
        ,getFileAbsPath:"="
      },
      link: function postLink(scope, element, attrs) {
        var stopValueWatcher,stopPropsWatcher, stopUrlLink, stopTarget,stopLinkProtocolWatch=null
        var imgUrlParam = '&_tagy-cms-link=';
        var imgLinkTargetSplitStr = '|*|';
        scope.view = {};
        scope.view.linkTargets = [{label: 'new tab', value: '_blank'}, {label: 'existing tab', value: '_self'}];
        scope.view.linkProtocols = [{label: 'http://', value: 'http://'}, {label: 'https://', value: 'https://'}, {label: 'other', value: ''}];

        var addImageUrlParam=function(imgPath, linkUrl, target){
          if(linkUrl!=null){
            if(linkUrl){
              linkUrl=scope.view.imageLinkProtocol+ linkUrl
            }
            var path = imgPath + imgUrlParam  + linkUrl;
            if(target==null) {
              target = ''
            }
            path+=imgLinkTargetSplitStr+target;
            return path;
          }
          return imgPath;
        }
        var startValueWatch=function(){
          return scope.$watch("_editableItem.value", function (value, oldVal) {
            if (value != oldVal && scope._editableItem!=null) {
              //TODO select image for specific editableProp
              if(scope._editableItem.type!="image"&&scope._editableItem.editProps!=null&&scope._editableItem.editProps.backgroundImage!=null){
                scope._editableItem.editProps.backgroundImage=value
              }   else{
                EditableMessageChannel.dispatchNewValueUpdate(addImageUrlParam(value, scope.view.imageLinkUrl, scope.view.imageLinkTarget ), scope._editableItem.scope.$id)
              }

              scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(value):value

            }
          })
        }

        var startPropsWatch=function(){
          return scope.$watch("_editableItem.editProps", function (value, oldVal) {

            if (value != oldVal && scope._editableItem !=null && scope._editableItem.editProps!=null) {
              //TODO when edit UI for multiple properties this is removed (background-image, width, background repeat, ...)
              if(value.backgroundImage!=null){
                scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(value.backgroundImage):value.backgroundImage
                EditableMessageChannel.dispatchNewValueUpdate(addImageUrlParam(scope._editableItem.editProps.backgroundImage, scope.view.imageLinkUrl, scope.view.imageLinkTarget), scope._editableItem.scope.$id)
              }

              if(value.nameAttr!=null || value.valueAttr!=null){
                console.log("newVal",value.nameAttr);
                ///scope.nameAttr=value.nameAttr
                EditableMessageChannel.dispatchNewValueUpdate(scope._editableItem.editProps, scope._editableItem.scope.$id)
              }
            }
          },true)
        }

        var startlinkTargetWatch=function() {
          scope.$watch("view.imageLinkTarget", function (value, oldVal) {
            if (value != null) {
              EditableMessageChannel.dispatchNewValueUpdate(addImageUrlParam(scope._editableItem.value || scope._editableItem.editProps, scope.view.imageLinkUrl, scope.view.imageLinkTarget), scope._editableItem.scope.$id)
            }
          })
        }
        var startLinkUrlWatch=function(){
          return scope.$watch("view.imageLinkUrl", function (value, oldVal) {
            if (value!=null ) {
              EditableMessageChannel.dispatchNewValueUpdate(addImageUrlParam( scope._editableItem.value ||scope._editableItem.editProps, scope.view.imageLinkUrl, scope.view.imageLinkTarget), scope._editableItem.scope.$id)
            }
          })
        }

        var startLinkProtocolWatch=function(){
          return scope.$watch("view.imageLinkProtocol", function (value, oldVal) {
            if (value!=null ) {
              EditableMessageChannel.dispatchNewValueUpdate(addImageUrlParam( scope._editableItem.value ||scope._editableItem.editProps, scope.view.imageLinkUrl, scope.view.imageLinkTarget), scope._editableItem.scope.$id)
            }
          })
        }


        scope.filePath=''
        scope.tinyMceOptions={
          //theme_url: '/tinymce/tt.js',
          theme: "modern",
          skin: 'lightgray',
          toolbar: 'undo redo| bold italic underline fontsizeselect | alignleft aligncenter alignright alignjustify | bullist numlist | link | fullscreen code template'
          ,menubar: false,
          plugins: "link fullscreen code",
          forced_root_block:false,
          resize: "both",
          valid_elements:"+*[*]",
          convert_urls : false
          //plugins: "template",
          /*templates: [
           {title: 'Some title 1', description: 'Some desc 1', content: '<a href="#" class="">templ link</a> '}
           ]*/
        }
        scope._editableItem=null
        var currentEditableItemSet=null
        EditableMessageChannel.onUpdated(scope,function(editableItem, eventObj){
          if(scope.isMyEditableItem(scope.showForEditableItem, editableItem)){

            if(eventObj.type=="remove"){
              //scope._editableItem.destroy()
              return
            }

            //TODO why called 2x
            //console.log("UUUUUUUU",editableItem)
            //TODO just set visibility for now
            scope._editableItem.visible = editableItem.visible
          }
          /*var elm=(editableItem!=null && editableItem.element!=null)?editableItem.element:updatedElem.element

           if(elm && elm.get!=null){
           var changedEl=elm.get(0)
           if(changedEl!=null){
           var domEl=element.get(0)
           var isUnderMe=$.contains(domEl,changedEl)
           if(isUnderMe)element.attr(ATTR_NAME_EMIT_SHARED_ELEMENT_SAVE,"true")
           }
           }else{
           console.log("INFO tagy-cms-sync: can not get updated element")
           }*/
        })

        EditableMessageChannel.onEdit(scope, function (editableItem) {

          try{
            stopValueWatcher()
            stopPropsWatcher()
            stopUrlLink()
            stopTarget()
            startLinkProtocolWatch()
          }catch(e){}
          if(scope.isMyEditableItem(scope.showForEditableItem, editableItem)){
            //TODO optimize - now every editor is updated when scope._editableItem is set to the current editableItem value
            //console.log("OEEEEEE",editableItem.visible)
            scope._editableItem = editableItem
            stopValueWatcher=startValueWatch()
            stopPropsWatcher=startPropsWatch()
            stopUrlLink=startLinkUrlWatch()
            stopTarget=startlinkTargetWatch()
            stopLinkProtocolWatch=startLinkProtocolWatch()
            if (scope._editableItem) {
              scope.$emit("tagyCmsItemEditor:onEdit", element)
              if(scope._editableItem.type=="image" ||( scope._editableItem.editProps!=null && scope._editableItem.editProps.backgroundImage!=null)){
                //console.log("EDITTT val=",scope._editableItem.value,scope._editableItem.editProps.backgroundImage)
                //if(scope._editableItem.editProps)console.log("EDITTT BCKg=",scope._editableItem.editProps.backgroundImage)
                if(scope._editableItem.editProps.backgroundImage!=null)scope._editableItem.value=null

                var rRelPath=scope._editableItem.value!=null?scope._editableItem.value:scope._editableItem.editProps.backgroundImage
                // get linkUrl from image path param
                if(rRelPath.indexOf(imgUrlParam)>-1) {
                  var imageLinkUrlSplit=rRelPath.split(imgUrlParam)
                  rRelPath = imageLinkUrlSplit[0];
                  var linkSplitArr = imageLinkUrlSplit[1].split(imgLinkTargetSplitStr);
                  scope.view.imageLinkUrl = linkSplitArr[0];
                  scope.view.imageLinkTarget = linkSplitArr[1] || "_self";
                  if(!scope.view.imageLinkUrl.indexOf('http://') ){
                    scope.view.imageLinkProtocol =  'http://'
                    scope.view.imageLinkUrl = scope.view.imageLinkUrl.substring(7);
                  } else if(!scope.view.imageLinkUrl.indexOf('https://')){
                    scope.view.imageLinkProtocol =  'https://'
                    scope.view.imageLinkUrl = scope.view.imageLinkUrl.substring(8);
                  }else{
                    scope.view.imageLinkProtocol =  !scope.view.imageLinkUrl?'http://':''
                  }

                }else {
                  scope.view.imageLinkUrl = null;
                }

                if(scope._editableItem.value!=null) {
                  scope._editableItem.value = rRelPath;

                }else{
                  scope._editableItem.editProps.backgroundImage = rRelPath;
                }

                scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(rRelPath):rRelPath



                //TODO select image for specific editableProp
                EditableMessageChannel.dispatchSelectImageWaiting(scope._editableItem)
              }
              //console.log("editable onEDIT=",scope._editableItem)
            }
          }else{
            scope._editableItem=null
          }

          currentEditableItemSet=editableItem
        })



        EditableMessageChannel.onIframePreviewHtmlMarkupReset(scope,function(){
          hideEditor();
        })

        scope.doneEditing=function(){
          EditableMessageChannel.dispatchEditableItemEditConfirmed(scope._editableItem)

        }

        var hideEditor=function () {
          scope.editValue = null
          scope._editableItem=null
        }

        EditableMessageChannel.onEditableItemEditConfirmed(scope,function(editableItem){
          currentEditableItemSet=null
          if(scope._editableItem==editableItem)  {
            hideEditor();
          }
        })

        var moveCaretToEnd=function (el) {
          if (typeof el.selectionStart == "number") {
            el.selectionStart = el.selectionEnd = el.value.length;
          } else if (typeof el.createTextRange != "undefined") {
            el.focus();
            var range = el.createTextRange();
            range.collapse(false);
            range.select();
          }
        }

        scope.isMyEditableItem=function(editorForEditableObj, checkAgainstExternalEditableObj){
          if(editorForEditableObj==null)editorForEditableObj=scope.showForEditableItem
          if(checkAgainstExternalEditableObj==null)checkAgainstExternalEditableObj=currentEditableItemSet
          var ret=false
          if(editorForEditableObj==null){
            ret= checkAgainstExternalEditableObj!=null
          }else{
            ret=  checkAgainstExternalEditableObj!=null ? (checkAgainstExternalEditableObj!=null && checkAgainstExternalEditableObj.scope.$id==editorForEditableObj.scope.$id ):false
          }
          return ret
        }

        scope.showEditable=function(editableObj,val){
          EditableMessageChannel.dispatchNewValueUpdate({type:'visible',value:val}, scope._editableItem.scope.$id)
        }
        scope.removeEditable=function(editableObj){
          if(confirm("This will delete element. Continue?"))EditableMessageChannel.dispatchNewValueUpdate({type:'remove',value:true}, scope._editableItem.scope.$id)
        }
      }
    };
  });
