'use strict';

angular.module('tagyComponents')
    .directive('tagyCmsEditableStyle', function (EditableStyleSer,EditableMessageChannel,editableStyleItemFactory) {
        return {
            replace:false,
            restrict: 'A',
            link:function postLink(scope, element, attrs) {
                var members={};
                scope.update = function (styleItem) {
                    element.html(members.getUpdatedStyleStringWithNewValues(element.html(),styleItem))
                    EditableMessageChannel.dispatchStyleValueUpdatedEvent(styleItem)
                }


                members.getEditableStyleItemsFromCSSString = function (cssStyleString) {
                    //TODO works only with .class selectors for now
                    var currClassBody, currClassName, clNameSInd;
                    var ret = []
                    var sInd = cssStyleString.indexOf("{", 0)
                    var eInd
                    while (sInd > 0) {
                        eInd = cssStyleString.indexOf("}", sInd)
                        if (eInd < 0) break;
                        currClassBody = cssStyleString.substring(sInd + 1, eInd)
                        clNameSInd = cssStyleString.lastIndexOf("}", sInd) + 1
                        if (clNameSInd < 0)clNameSInd = 0
                        currClassName = cssStyleString.substring(clNameSInd, sInd)
                        currClassName = currClassName.replace(";", "")

                        var title = members.parseTitleFromClassNameOrBody(currClassBody, currClassName);
                        if(title){
                            ret.push(editableStyleItemFactory.create({element: element, scope: scope, className: currClassName, bodyCss: currClassBody, title: title, type: members.parseTypeFromClassName(currClassName), value: members.parseValue(currClassBody), cssProperty: members.parseCSSProperty(currClassBody)}));
                        }
                        sInd = cssStyleString.indexOf("{", eInd)
                    }
                    return  ret
                }
                members.parseTitleFromClassNameOrBody = function (classBody, className) {
                    var commentStart = '/*tagy-title:';
                    var sInd = classBody.indexOf(commentStart),eInd,title;
                    if(sInd>-1) {
                        eInd = classBody.indexOf('*/', sInd);
                        if(eInd>0) {
                            title = classBody.substring(sInd + commentStart.length, eInd);
                        }
                    }
                    if(!title && className.indexOf('tagy_')>-1) {
                        sInd = className.indexOf("_")
                        eInd = className.indexOf("_", sInd + 1)
                        title = className.substring(sInd + 1, eInd)
                        title = title.replace("-", " ")
                    }
                    return  title
                }
                members.parseTypeFromClassName = function (className) {
                    //TODO read from property name or comment like - /*tagy-title:xy, tagy-type:color*/
                    return null
                    /*if(className.indexOf('tagy-')>-1){
                     var tagyDelim = "tagy-";
                     //like .tagy-color_class-name{...}
                     var sInd = className.indexOf(tagyDelim)+tagyDelim.length;
                     return className.substring(sInd, className.indexOf('_',sInd));

                     }
                     return null;*/
                }
                members.parseValue = function (classBody) {
                    var commEnd = classBody.indexOf('*/');
                    commEnd=commEnd>0?commEnd+2:0;
                    var sInd = classBody.indexOf(":", commEnd);
                    var eInd = classBody.indexOf(";", sInd);
                    if (eInd < 0){
                        alert("no semicolon found at css editable declaration")
                    }
                    return classBody.substring(sInd + 1, eInd).trim();
                }
                members.parseCSSProperty = function (classBody) {
                    var eInd = classBody.indexOf(":");
                    var sInd = classBody.indexOf('*/');

                    return classBody.substring(sInd>-1?sInd+2:0, eInd)
                }
                members.getUpdatedStyleStringWithNewValues = function (cssStyleString, editableStyleItemObj) {
                    //TODO if there are many declarations with same selector it will find only first
                    var sStylesInd = 0
                    var eStylesInd = cssStyleString.length-1

                    var sInd = cssStyleString.indexOf(editableStyleItemObj.className)
                    if (sInd > eStylesInd)alert("TOOO LATE")
                    var eInd = cssStyleString.indexOf("}", sInd)
                    var updateStr = cssStyleString.substring(sInd, eInd);
                    //console.log("IIIUUUU", updateStr);
                    var propStart = updateStr.indexOf(editableStyleItemObj.cssProperty)
                    if (propStart > -1) {
                        var commEnd = updateStr.indexOf('*/');
                        commEnd=commEnd>0?commEnd+2:0;
                        var valueStart = updateStr.indexOf(":", commEnd) + 1;
                        var valueEnd = updateStr.indexOf(";")
                        //console.log("UUUUUCSS0000=", updateStr)
                        updateStr = updateStr.substring(0, valueStart) + editableStyleItemObj.value + updateStr.substr(valueEnd)
                        //console.log("UUUUUCSS=", markup.substr(eInd))
                        return cssStyleString.substring(0, sInd) + updateStr + cssStyleString.substr(eInd)
                    } else {
                        alert("Can't find css property to update with new value (" + editableStyleItemObj.className + editableStyleItemObj.bodyCss + ")")
                        return cssStyleString
                    }
                }


                members.getEditableStyleItemsFromCSSString( element.html())

            }
        };
    });
