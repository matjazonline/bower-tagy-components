'use strict';

angular.module('tagyComponents')
    .directive('tagyCmsItemEditor', function (EditableMessageChannel,$timeout) {
        return {
            template: '<div ng-show="isMyEditableItem()">'+
                '<h3>{{_editableItem.title}} <br/><small>{{_editableItem.description}}</small></h3>' +
                '' +
                '<div  ng-if="_editableItem.type==\'image\'"><img ng-src="{{filePath}}"/>' +
                '<input ng-model="_editableItem.value">' +
                '<button class="button success" ng-click="doneEditing()">OK</button>' +
                '</div>' +
                '<form ng-if="_editableItem.type==\'text\'">' +
                '<textarea ng-if="_editableItem.value!=null && _editableItem.editProps.backgroundImage==null" ui-tinymce="tinyMceOptions" class="form-control" ng-model="_editableItem.value"></textarea>' +
                '<div  ng-if="_editableItem.editProps.backgroundImage!=null">' +
                '<img ng-src="{{filePath}}"/>' +
                '<input ng-model="_editableItem.editProps.backgroundImage">' +
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
                var stopValueWatcher,stopPropsWatcher=null
                var startValueWatch=function(){
                    return scope.$watch("_editableItem.value", function (value, oldVal) {
                        if (value != oldVal && scope._editableItem!=null) {
                            //TODO select image for specific editableProp
                            if(scope._editableItem.type!="image"&&scope._editableItem.editProps!=null&&scope._editableItem.editProps.backgroundImage!=null){
                                scope._editableItem.editProps.backgroundImage=value
                            }   else{
                                EditableMessageChannel.dispatchNewValueUpdate(value, scope._editableItem.scope.$id)
                            }

                            scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(value):value
                        }
                    })
                }

                var startPropsWatch=function(){
                    return scope.$watch("_editableItem.editProps", function (value, oldVal) {
                        if (value != oldVal && scope._editableItem !=null && scope._editableItem.editProps!=null) {
                            //TODO when edit UI for multiple properties this is removed (background-image, width, background repeat, ...)
                            if(value.backgroundImage!=null)scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(value.backgroundImage):value.backgroundImage
                            EditableMessageChannel.dispatchNewValueUpdate(scope._editableItem.editProps, scope._editableItem.scope.$id)
                        }
                    },true)
                }


                scope.filePath=''
                scope.tinyMceOptions={
                    theme_url: '/tinymce/tt.js',
                    theme: "modern",
                    skin: 'light',
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
                EditableMessageChannel.onEdit(scope, function (editableItem) {
                    try{
                        stopValueWatcher()
                        stopPropsWatcher()
                    }catch(e){}
                    if(scope.isMyEditableItem(scope.showForEditableItem, editableItem)){
                        //TODO optimize - now every editor is updated when scope._editableItem is set to the current editableItem value

                        scope._editableItem = editableItem
                        stopValueWatcher=startValueWatch()
                        stopPropsWatcher=startPropsWatch()
                        if (scope._editableItem) {
                            if(scope._editableItem.type=="image" ||( scope._editableItem.editProps!=null && scope._editableItem.editProps.backgroundImage!=null )){
                                //console.log("EDITTT val=",scope._editableItem.value,scope._editableItem.editProps.backgroundImage)
                                //if(scope._editableItem.editProps)console.log("EDITTT BCKg=",scope._editableItem.editProps.backgroundImage)
                                if(scope._editableItem.editProps.backgroundImage!=null)scope._editableItem.value=null
                                var rRelPath=scope._editableItem.value!=null?scope._editableItem.value:scope._editableItem.editProps.backgroundImage
                                scope.filePath=scope.getFileAbsPath?scope.getFileAbsPath(rRelPath):rRelPath
                                //TODO select image for specific editableProp
                                EditableMessageChannel.dispatchSelectImageWaiting(scope._editableItem)
                            }
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
            }
        };
    });
