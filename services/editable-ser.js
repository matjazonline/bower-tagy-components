'use strict';

angular.module('tagyComponents')
    .service('EditableSer', function EditableSer(EditableMessageChannel, $rootScope) {
        var self = this
        var _lastUpdateComplete={value:null,scopeId:null}
        // AngularJS will instantiate a singleton by calling "new" on this function
        this.frwConst = {}
        this.frwConst.LAYOUT_FRAMEWORK_BOOTSTRAP = "bootstrapFr"
        this.frwConst.LAYOUT_FRAMEWORK_FOUNDATION = "foundationFr"
        this.layoutFramework = this.frwConst.LAYOUT_FRAMEWORK_FOUNDATION
        this.EDITABLE_BINDING_WRAP_ATTR_NAME="editable-binding-w"
        //this.ADMIN_UI_ELEM_ATTR_TO_REMOVE="tagy-cms-remove-elem-in-production"
        this._editableComponents = []

        this.registerComponent = function (editableComponent) {
            self._editableComponents.push(editableComponent)
            EditableMessageChannel.dispatchEditableComponentAdded(editableComponent, self._editableComponents)
        }

        this.unregisterComponent = function (editableComponentId) {
            var regComp=self.getRegisteredComponent(editableComponentId)
            //console.log("IFRAME UNREG COMP ",editableComponentId)
            if(regComp) {
                var ind=self._editableComponents.indexOf(regComp)
                if(ind>-1){
                    self._editableComponents.splice(ind,1)
                    EditableMessageChannel.dispatchEditableComponentRemoved(regComp, self._editableComponents)
                    //EditableMessageChannel.dispatchEditableComponentRemoved(editableComponent, self._editableComponents)
                }
            }
        }

        this.getRegisteredComponent = function (editableComponentId) {
            for (var i = 0; i < self._editableComponents.length; i++) {
                var comp = self._editableComponents[i];
                if(comp.id==editableComponentId)return comp
            }
            return null
        }

        this.unregisterComponents = function () {
            self._editableComponents = []
            EditableMessageChannel.dispatchEditableComponentAdded(null, self._editableComponents)
        }


        this.getRegisteredComponents = function () {
            return self._editableComponents
        }

        EditableMessageChannel.onNewValueUpdateEditable($rootScope, function (newValue, editableScopeId) {
            //TODO equality now not checked for editableProps object
            if(angular.equals(_lastUpdateComplete.value,newValue )&& _lastUpdateComplete.scopeId==editableScopeId)return
            //TODO if EditableSer and CrossFrameEditableService is used on same page scopeId can be same in both frames
            for (var i = 0; i < self._editableComponents.length; i++) {
                var obj = self._editableComponents[i];
                if (obj.setEditableItemNewValue(newValue, editableScopeId)) {
                    _lastUpdateComplete.scopeId=editableScopeId
                    _lastUpdateComplete.value=angular.copy(newValue)
                    return
                }
            }
        })

        var waitingOnImageSelect=null
        EditableMessageChannel.onSelectImageWaiting($rootScope,function(editableItem){
            waitingOnImageSelect=editableItem
        })
        EditableMessageChannel.onSelectedImagePath($rootScope,function(imagePath){
            if(waitingOnImageSelect!=null) waitingOnImageSelect.value=imagePath

            //waitingOnImageSelect=null
        })

        EditableMessageChannel.onEditableItemEditConfirmed($rootScope,function(){
            waitingOnImageSelect=null
        })

    });

function ViewState(states, active) {
    this.states = states
    this._active = active
}
ViewState.prototype.setActive = function (statename) {
    this._active = statename
}
ViewState.prototype.isActive = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] == this._active) return true
    }

}
