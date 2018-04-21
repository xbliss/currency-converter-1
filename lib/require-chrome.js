var reqBrowser = new RequireBrowser({
    getPath: (path) => {
        path = chrome.runtime.getURL(path);
        console.log("path:" + path);
        return path;
    },
});
function require(file) {
    return reqBrowser.require(file);
}