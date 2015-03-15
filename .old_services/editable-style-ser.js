'use strict';

angular.module('tagyComponents')
    .service('EditableStyleSer', function EditableStyleSer(EditableMessageChannel,$rootScope) {
            var self=this
        this._editableStyleItems=[]

        EditableMessageChannel.onStyleValueChange($rootScope, function(value){
            for (var i = 0; i < self._editableStyleItems.length; i++) {
                var esi = self._editableStyleItems[i];
                if(esi.update(value)) return true
            }
        })

        this.unregisterStyles=function(){
            //TODO destroy items and references
            self._editableStyleItems=[]
            EditableMessageChannel.dispatchEditableStyleItemAdded(null, self._editableStyleItems)
        }

        this.registerStyleItem=function(styleItem){
            self._editableStyleItems.push(styleItem)
            EditableMessageChannel.dispatchEditableStyleItemAdded(styleItem, self._editableStyleItems)
        }

        this.getEditableStyleItems=function(){
            return self._editableStyleItems
        }
    });
