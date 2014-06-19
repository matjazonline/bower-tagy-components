'use strict';

angular.module('tagyComponents')
    .service('CrossFrameEditableService', function CrossFrameEditableService(EditableStyleSer,CrossFrameConnection,editableStyleItemFactory,  editableComponentFactory, $rootScope, EditableSer, EditableMessageChannel, editableContentFactory) {
        var self = this
        var _isContentPreviewFrame = false
        var listenersInited= false

        CrossFrameConnection.onFrameConnectionSuccess($rootScope, function () {
            self.init()
            initListeners()
        })
        this.init = function (isContentPreviewFrame) {
            _isContentPreviewFrame = isContentPreviewFrame
            CrossFrameConnection.initListener()

        }

        var initListeners = function () {

            if (!_isContentPreviewFrame ) {

                EditableSer.unregisterComponents()
                CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDITABLE_COMPONENT_ADDED, function (editableComp, componentsArr) {
                    //debugger

                    EditableMessageChannel.dispatchEditableComponentAdded(editableComp,componentsArr)
                }))
                CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDITABLE_COMPONENT_REMOVED, function (editableCompVO, componentsArr) {
                    var regComp=EditableSer.getRegisteredComponent(editableCompVO.id)
                    regComp.destroy()
                }))
                CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDITABLE_COMPONENT_UPDATED, function (componentVO) {
                    //debugger
                    var currComp = editableComponentFactory.getInstance(componentVO.title, null, null, componentVO.id);
                    for (var j = 0; j < componentVO._editableContentObjects.length; j++) {
                        var currContentObj = componentVO._editableContentObjects[j];
                        var newContObj=currComp.createAndRegisterEditableContentObject(currContentObj)
                        if(newContObj==null && currContentObj.title==null)alert("Set title to editable element in "+currComp.title)
                        /*if(!currComp.contentObjTitleExists(currContentObj.title)){
                            var obj = editableContentFactory.create(currContentObj)
                            currComp.registerEditableContentObject(obj)
                        }*/
                    }
                    EditableMessageChannel.dispatchEditableComponentUpdated(currComp)
                }))

                CrossFrameConnection.invokeServiceMethod("EditableSer", "getRegisteredComponents", null).then(function (res) {
                    for (var i = 0; i < res.length; i++) {
                        var componentVO = res[i];
                        var currComp = editableComponentFactory.getInstance(componentVO.title, null, null, componentVO.id);
                        for (var j = 0; j < componentVO._editableContentObjects.length; j++) {
                            var currContentObj = componentVO._editableContentObjects[j];
                            var newContObj=currComp.createAndRegisterEditableContentObject(currContentObj)
                            if(newContObj==null && currContentObj.title==null)alert("Set title to editable element in "+currComp.title)
                            /*var obj = editableContentFactory.create(componentVO._editableContentObjects[j])
                            currComp.registerEditableContentObject(obj)*/
                        }
                    }
                })


                EditableStyleSer.unregisterStyles()
                CrossFrameConnection.invokeServiceMethod("EditableStyleSer", "getEditableStyleItems", null).then(function (res) {
                    if(res){
                        for (var i = 0; i < res.length; i++) {
                            var styleItem = res[i];
                            var currStyleItem = editableStyleItemFactory.create(styleItem);
                            currStyleItem.id=styleItem.id
                            currStyleItem.element=null
                            currStyleItem.scope=null
                        }
                    }
                })

                CrossFrameConnection.addCrossFrameEventListener(new EchoEventHandler(EditableMessageChannel.EVENT_EDIT, function (editableObj) {
                    EditableMessageChannel.dispatchEditEvent(editableObj)
                }))


                 if( !listenersInited){
                     listenersInited=true
                     //TODO in EditableMessageChannel check if handler function is already registered
                     EditableMessageChannel.onNewValueUpdateEditable($rootScope, onNewValueUpdateEditableHandler)

                     EditableMessageChannel.onStyleValueChange($rootScope, function(styleVal){
                         CrossFrameConnection.invokeServiceMethod("EditableMessageChannel", "dispatchStyleValueChange", [styleVal])

                     })
                 }
            }
        }


        var onNewValueUpdateEditableHandler=function (newValue, editableScopeId) {
            //console.log("TODO remove old onNewValueUpdateEditableHandler when frames connected")

            CrossFrameConnection.invokeServiceMethod("EditableMessageChannel", "dispatchNewValueUpdate", [newValue, editableScopeId])

        }
    })
