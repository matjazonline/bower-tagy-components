'use strict';

angular.module('tagyComponents')
    .directive('tagyCmsSharedId', function ( EditableMessageChannel) {
        return {
            replace:false,
            restrict: 'A',
            scope:false,
            link:{
                post:function postLink(scope, element, attrs) {
                    var ATTR_NAME_EMIT_SHARED_ELEMENT_SAVE="tagy-cms-emit-update"
                    if(element.prop("tagName")=="STYLE"){
                        //TODO optimize get <style> element where change happened
                        EditableMessageChannel.onStyleValueChange(scope,function(value){
                            element.attr(ATTR_NAME_EMIT_SHARED_ELEMENT_SAVE,"true")
                        })
                    }else{
                        EditableMessageChannel.onUpdated(scope,function(editableItem,updatedElem){
                            var elm=(editableItem!=null && editableItem.element!=null)?editableItem.element:updatedElem.element

                            if(elm && elm.get!=null){
                                var changedEl=elm.get(0)
                                if(changedEl!=null){
                                    var domEl=element.get(0)
                                    var isUnderMe=$.contains(domEl,changedEl)
                                    if(isUnderMe)element.attr(ATTR_NAME_EMIT_SHARED_ELEMENT_SAVE,"true")
                                }
                            }else{
                                console.log("INFO tagy-cms-shared-id: can not get updated element")
                            }
                        })
                    }
                }
            }
        };
    });
