// ==UserScript==
// @name         CF notification
// @namespace    https://github.com/platelett/script
// @version      0.1
// @description  Get notified when your friend solves a problem on codeforces. 想知道你的同学有多卷吗？
// @author       platelet
// @match        https://codeforces.com/problemset/status?friends=on
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codeforces.com
// @license      MIT
// @source       https://github.com/platelett/script/blob/main/CF%20notification.js
// @grant        none
// ==/UserScript==

// Open the page https://codeforces.com/problemset/status?friends=on script takes effect.

(function() {
    'use strict';
    onload = () => {
        const interval = 1000 * 120;
        Notification.requestPermission(() => {
            if(document.querySelector("#header > div.lang-chooser > div:nth-child(2) > a:nth-child(2)").textContent == "Register") {
                alert("You are not logged in and cannot receive notifications.");
                return;
            }
            var parser = new DOMParser();
            var last = document.querySelector("#pageContent > div.datatable > div:nth-child(6) > table > tbody > tr > td.id-cell.dark.left > a").textContent;
            var running = new Set();
            var ID = setInterval(async () => {
                try {
                    var now;
                    for(var page = 1;; page++) {
                        var list = parser.parseFromString(await (await fetch("https://codeforces.com/problemset/status/page/" + page + "?friends=on")).text(), "text/html").querySelectorAll("#pageContent > div.datatable > div:nth-child(6) > table > tbody > tr:not(.first-row)");
                        if(!list.length) throw "Invalid page";
                        if(page == 1) now = list[0].children[0].textContent.trim();
                        for(var submission of list) {
                            var info = [];
                            for(var i of submission.children) if(i.children[0]) info.push(i.children[0].textContent.trim());
                            if(info[0] <= last && (!running.size || info[0] < Math.min.apply(null, [...running]))) { last = now; return; }
                            var visited = info[0] <= last;
                            if(running.has(info[0])) running.delete(info[0]), visited = false;
                            if(visited) continue;
                            if(info[4] == "Accepted") new Notification(info[2] + " has solved " + info[3] + ".");
                            if(info[4].startsWith("Running on test")) running.add(info[0]);
                        }
                    }
                } catch(err) {
                    new Notification("Error happened! Please check the console.");
                    console.log(err), clearInterval(ID);
                }
            }, interval);
        });
    }
})();
