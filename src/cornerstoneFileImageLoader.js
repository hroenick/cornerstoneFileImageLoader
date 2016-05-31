//
// This is a cornerstone image loader for DICOM P10 files.  It currently does not support compressed
// transfer syntaxes or big endian transfer syntaxes.  It will support implicit little endian transfer
// syntaxes but explicit little endian is strongly preferred to avoid any parsing issues related
// to SQ elements.
//

var cornerstoneFileImageLoader = (function ($, cornerstone, cornerstoneFileImageLoader) {

    "use strict";

    if (cornerstoneFileImageLoader === undefined) {
        cornerstoneFileImageLoader = {};
    }

    function loadImage(imageId) {

        var parsedImageId = cornerstoneWADOImageLoader.parseImageId(imageId);
        // create a deferred object
        // TODO: Consider not using jquery for deferred - maybe cujo's when library
        var deferred = $.Deferred();

        // build a url by parsing out the url scheme and frame index from the imageId
        var url = parsedImageId.url;
        url = url.substring(12);
        var file = url;
        if (file === undefined) {
            deferred.reject('unknown file path ' + url);
            return deferred;
        }

        // Read the DICOM Data
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
            // Parse the DICOM File
            var dicomPart10AsArrayBuffer = e.target.result;
            var byteArray = new Uint8Array(dicomPart10AsArrayBuffer);
            var dataSet = dicomParser.parseDicom(byteArray);
            deferred.resolve(dataSet);
        };

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4) {
                if (xmlhttp.status === 200) {
                    console.log('success: ' + file);
                    var blob = xmlhttp.response;
                    fileReader.readAsArrayBuffer(blob);
                }
                else {
                    console.err('failed: ' + file);
                    deferred.reject('failed accessing local file \"' + file + '\". (' + xmlhttp.status + ')');
                    return deferred;
                }
            }
        };
        var request = xmlhttp.open("GET", file, true);
        xmlhttp.responseType = 'blob';
        xmlhttp.request = request;
        xmlhttp.send();
        return deferred.promise();
    }

    // steam the http and https prefixes so we can use wado URL's directly
    cornerstone.registerImageLoader('localfile', loadImage);

    return cornerstoneFileImageLoader;
}($, cornerstone, cornerstoneFileImageLoader));