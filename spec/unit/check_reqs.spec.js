/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/
/* jshint laxcomma:true */

var check_reqs = require("../../bin/lib/check_reqs");
var shelljs = require("shelljs");
var fs = require("fs");
var path = require("path");

describe("check_reqs", function () {
    var original_env;
    beforeAll(function() {
        original_env = Object.create(process.env);
    });
    afterEach(function() {
        Object.keys(original_env).forEach(function(k) {
            process.env[k] = original_env[k];
        });
    });
    describe("check_android", function() {
        describe("set ANDROID_HOME if not set", function() {
            beforeEach(function() {
                delete process.env.ANDROID_HOME;
            });
            describe("even if no Android binaries are on the PATH", function() {
                beforeEach(function() {
                    spyOn(shelljs, "which").and.returnValue(null);
                    spyOn(fs, "existsSync").and.returnValue(true);
                });
                it("it should set ANDROID_HOME on Windows", function(done) {
                    spyOn(check_reqs, "isWindows").and.returnValue(true);
                    process.env.LOCALAPPDATA = "windows-local-app-data";
                    process.env.ProgramFiles = "windows-program-files";
                    return check_reqs.check_android()
                    .then(function() {
                        expect(process.env.ANDROID_HOME).toContain("windows-local-app-data");
                    }).fail(function(err) {
                        expect(err).toBeUndefined();
                        console.log(err);
                    }).fin(function() {
                        delete process.env.LOCALAPPDATA;
                        delete process.env.ProgramFiles;
                        done();
                    });
                });
                it("it should set ANDROID_HOME on Darwin", function(done) {
                    spyOn(check_reqs, "isWindows").and.returnValue(false);
                    spyOn(check_reqs, "isDarwin").and.returnValue(true);
                    process.env.HOME = "home is where the heart is";
                    return check_reqs.check_android()
                    .then(function() {
                        expect(process.env.ANDROID_HOME).toContain("home is where the heart is");
                    }).fail(function(err) {
                        expect(err).toBeUndefined();
                        console.log(err);
                    }).fin(function() {
                        delete process.env.HOME;
                        done();
                    });
                });
            });
            describe("if some Android tooling exists on the PATH", function() {
                beforeEach(function() {
                    spyOn(fs, "realpathSync").and.callFake(function(path) {
                        return path;
                    });
                });
                it("should set ANDROID_HOME based on `android` command if command exists in a SDK-like directory structure", function(done) {
                    spyOn(fs, "existsSync").and.returnValue(true);
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "android") {
                            return "/android/sdk/tools/android";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        expect(process.env.ANDROID_HOME).toEqual("/android/sdk");
                        done();
                    }).fail(function(err) {
                        expect(err).toBeUndefined();
                        console.log(err);
                    });
                });
                it("should error out if `android` command exists in a non-SDK-like directory structure", function(done) {
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "android") {
                            return "/just/some/random/path/android";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        done.fail();
                    }).fail(function(err) {
                        expect(err).toBeDefined();
                        expect(err.message).toContain("update your PATH to include valid path");
                        done();
                    });
                });
                it("should set ANDROID_HOME based on `adb` command if command exists in a SDK-like directory structure", function(done) {
                    spyOn(fs, "existsSync").and.returnValue(true);
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "adb") {
                            return "/android/sdk/platform-tools/adb";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        expect(process.env.ANDROID_HOME).toEqual("/android/sdk");
                        done();
                    }).fail(function(err) {
                        expect(err).toBeUndefined();
                        console.log(err);
                    });
                });
                it("should error out if `adb` command exists in a non-SDK-like directory structure", function(done) {
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "adb") {
                            return "/just/some/random/path/adb";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        done.fail();
                    }).fail(function(err) {
                        expect(err).toBeDefined();
                        expect(err.message).toContain("update your PATH to include valid path");
                        done();
                    });
                });
                it("should set ANDROID_HOME based on `avdmanager` command if command exists in a SDK-like directory structure", function(done) {
                    spyOn(fs, "existsSync").and.returnValue(true);
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "avdmanager") {
                            return "/android/sdk/tools/bin/avdmanager";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        expect(process.env.ANDROID_HOME).toEqual("/android/sdk");
                        done();
                    }).fail(function(err) {
                        expect(err).toBeUndefined();
                        console.log(err);
                    });
                });
                it("should error out if `avdmanager` command exists in a non-SDK-like directory structure", function(done) {
                    spyOn(shelljs, "which").and.callFake(function(cmd) {
                        if (cmd == "avdmanager") {
                            return "/just/some/random/path/avdmanager";
                        } else {
                            return null;
                        }
                    });
                    return check_reqs.check_android()
                    .then(function() {
                        done.fail();
                    }).fail(function(err) {
                        expect(err).toBeDefined();
                        expect(err.message).toContain("update your PATH to include valid path");
                        done();
                    });
                });
            });
        });
        describe("set PATH for various Android binaries if not available", function() {
            beforeEach(function() {
                spyOn(shelljs, "which").and.returnValue(null);
                process.env.ANDROID_HOME = "let the children play";
                spyOn(fs, "existsSync").and.returnValue(true);
            });
            afterEach(function() {
                delete process.env.ANDROID_HOME;
            });
            it("should add tools/bin,tools,platform-tools to PATH if `avdmanager`,`android`,`adb` is not found", function(done) {
                return check_reqs.check_android()
                .then(function() {
                    expect(process.env.PATH).toContain("let the children play" + path.sep + "tools");
                    expect(process.env.PATH).toContain("let the children play" + path.sep + "platform-tools");
                    expect(process.env.PATH).toContain("let the children play" + path.sep + "tools" + path.sep + "bin");
                    done();
                }).fail(function(err) {
                    expect(err).toBeUndefined();
                    console.log(err);
                });
            });
        });
    });
});
