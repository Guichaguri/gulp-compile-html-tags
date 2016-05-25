'use strict';

/*
 gulp-compile-html-tags
 Copyright (C) 2016 Guilherme Chaguri

 This library is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.

 This library is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public
 License along with this library; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
 USA
*/

const gutil = require('gulp-util');
const through = require('through2');
const asyncRegex = require('async-regex-replace');

const PLUGIN_NAME = 'gulp-compile-html-tags';

function escapeRegex(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function fileToString(file) {
    return file.contents.toString('utf8'); // For buffers only
}


/**
 * This plugin let you apply other gulp plugins inside the content of HTML tags
 * @param tags An array or string with the tags to apply
 * @param applyPlugins A function `(tag, stream)` to apply plugins. It needs to return a stream
 */
function compileHtml(tags, applyPlugins) {

    if(typeof tags === 'string') {
        tags = [tags];
    }

    if(!tags || !(tags instanceof Array) || tags.length == 0) {
        throw new gutil.PluginError(PLUGIN_NAME, 'No tags were specified!');
    }
    if(typeof applyPlugins !== 'function') {
        throw new gutil.PluginError(PLUGIN_NAME, 'No function was specified!');
    }

    return through.obj(function(file, enc, callback) {

        if(file.isStream()) {
            return callback(new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported'));
        } else if(file.isNull()) {
            return callback(null, file);
        }

        let replaceStream = through({objectMode: true, allowHalfOpen: false});
        let replStrm = replaceStream;

        for(var i = 0; i < tags.length; i++) {
            let tag = tags[i];

            if(!tag || tag.length == 0) {
                // Just ignore undefined/null elements
                continue;
            }

            var escapedTag = escapeRegex(tag);
            let regex = new RegExp('<' + escapedTag + '[\\s\\S]*?>((?:.|\\s)*?)<\\/' + escapedTag + '>', 'gmi');

            replStrm = replStrm.pipe(through.obj(function(file2, enc, replCb) {

                asyncRegex.replace(regex, fileToString(file2), function(match, code, cb) {

                    let fakeFile = file2.clone();
                    fakeFile.contents = new Buffer(code);

                    let stream = through({objectMode: true, allowHalfOpen: false});
                    let strm = stream;

                    try {
                        strm = applyPlugins(tag, strm);
                    } catch(e) {
                        cb(e);
                    }

                    if(!strm || !strm.pipe) {
                        return cb(new gutil.PluginError(PLUGIN_NAME, 'Invalid returned value'));
                    }

                    strm.pipe(through.obj(function(replacedCode, enc, cb2) {
                        if(replacedCode.isStream()) {
                            cb(new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported'));
                        } else {
                            cb(null, match.replace(code, fileToString(replacedCode)));
                        }
                        cb2(null, replacedCode); // NOOP
                    }));

                    stream.write(fakeFile);
                    stream.end();

                }, function(err, result) {

                    if(err) {
                        replCb(err);
                    } else {
                        var newFile = file2.clone();
                        newFile.contents = new Buffer(result);
                        replCb(null, newFile);
                    }

                });

            }));

        }

        replStrm.pipe(through.obj(function(finalFile, enc, cb) {
            callback(null, finalFile);
            cb(null, finalFile); // NOOP
        }));
        replaceStream.write(file);
        replaceStream.end();

    });

}

module.exports = compileHtml;