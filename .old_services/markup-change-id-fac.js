'use strict';

angular.module('tagyComponents')
    .factory('markupChangeIdFac', function () {
        // Service logic
        //TODO use xml parse to find meta value
        var searchMetaString = '<meta name="meta-change-id" content="'
        var currChangeId = 0

        var setCurrChangeId = function (value) {
            if (angular.isNumber(parseFloat(value))) {
                currChangeId = value
            } else {
                currChangeId = 0
            }
        }
        var findStartInd = function (markup) {
            return markup.indexOf(searchMetaString)
        }
        var findEndInd = function (markup, fromInd) {
            return markup.indexOf('>', fromInd)
        }
        var getMarkupChangeId = function (markup) {
            if (markup == null)return null
            var startInd = findStartInd(markup)
            var mkpChangeId = null
            if (startInd > -1) {
                var endInd = findEndInd(markup, startInd)
                mkpChangeId = parseInt(markup.substring(startInd+searchMetaString.length,endInd))
            }
            return mkpChangeId
        }
        var makeChangeIdMetaTagString = function (changeId) {
            if (changeId == null)changeId = nextChangeId()
            return searchMetaString + changeId + '">'
        }
        var nextChangeId = function () {
            return ++currChangeId
        }
        var getCurrentChangeId = function () {
            return currChangeId
        }
        var api = {
            getCurrentChangeId: getCurrentChangeId,
            getMarkupChangeId: getMarkupChangeId,

            getMetaTagStr: makeChangeIdMetaTagString,

            changeMarkupChangeId: function (markup) {
                if(markup==null)return null
                var oldChangeId = getMarkupChangeId(markup)
                if (oldChangeId == null) {
                    var htmlTagStart = markup.indexOf("<html");
                    if (htmlTagStart > -1 ) {
                        if( markup.indexOf("<head") <0) {
                            var htmlTagEnd=markup.indexOf('>',htmlTagStart)
                            if(htmlTagEnd>-1) {
                                markup=markup.substring(0,htmlTagEnd+1)+'<head></head>'+markup.substring(htmlTagEnd+1)
                            }else{
                                console.log("INFO markup-change-id-fac.js - is html tag closed?")
                            }
                        }
                        var headOpenTagEndInd=markup.indexOf(">", markup.indexOf("<head"))+1
                            return markup.substring(0,headOpenTagEndInd)+api.getMetaTagStr()+ (markup.substring(headOpenTagEndInd))
                    } else {
                        return api.wrapMarkupInHtmlTags(markup)
                    }
                }
                return markup.replace(makeChangeIdMetaTagString(oldChangeId), makeChangeIdMetaTagString(nextChangeId()))
            },
            nextChangeId: nextChangeId,
            setCurrChangeId: setCurrChangeId
            ,wrapMarkupInHtmlTags:function(markup){
                var mkp='<!DOCTYPE html><html>' +
                    '<head>' +
                    api.getMetaTagStr()
                    +'</head><body>' +markup.toString()
                    +"</body>"
                +'</html>';
                return mkp
            }
        };
        return api
    });
