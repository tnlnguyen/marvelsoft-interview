const { parallel, series, watch } = require('gulp');
const electron = require('./electron');
const hotreload = require('./hotreload');
const assets = require('./assets');
const scripts = require('./scripts');

function watchMainScripts() {
  return watch(['index.js'], series(scripts.developBuild, electron.stop, electron.start));
}

function watchRendererScripts() {
  return watch(['index.js','app/**/*.js'], series(scripts.developBuild, hotreload.reload));
}

function watchHtml() {
  return watch(
    ['app/containers/Login/Login.html'],
    series(assets.copyHtml, hotreload.inject, hotreload.reload),
  );
}

watchMainScripts.displayName = 'watch-main-scripts';
watchRendererScripts.displayName = 'watch-renderer-scripts';
watchHtml.displayName = 'watch-html';

exports.start = series(
  assets.copyHtml,
  scripts.developBuild,
  hotreload.start,
  electron.start,
  parallel(watchMainScripts, watchRendererScripts, watchHtml),
);
