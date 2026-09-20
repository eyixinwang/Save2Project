var extension = typeof browser !== 'undefined' ? browser : chrome;

// Handle extension installation
extension.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    extension.tabs.create({
      url: extension.runtime.getURL('welcome.html')
    });
  }
});

// Escape text before inserting it into HTML
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Handle extension icon click
extension.action.onClicked.addListener(function(tab) {
  var url = tab.url;
  var title = tab.title || 'saved_page';

  if (!url) {
    console.error('Unable to get URL');
    return;
  }

  // Create a safe filename.
  // Keep Unicode characters, Chinese characters and original spaces.
  var sanitizedTitle = title
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .trim()
    .substring(0, 120);

  if (!sanitizedTitle) {
    sanitizedTitle = 'saved_page';
  }

  var filename = sanitizedTitle + '.html';

  var safeUrl = escapeHtml(url);
  var safeTitle = escapeHtml(title);

  // Create HTML redirect file
  var content =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta http-equiv="refresh" content="0; url=' + safeUrl + '">\n' +
    '  <title>' + safeTitle + '</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <p>Redirecting to the original page...</p>\n' +
    '  <p><a href="' + safeUrl + '">Open original page</a></p>\n' +
    '</body>\n' +
    '</html>';

  var dataUrl =
    'data:text/html;charset=utf-8,' +
    encodeURIComponent(content);

  extension.downloads.download({
    url: dataUrl,
    filename: filename,
    saveAs: true
  }, function(downloadId) {
    if (extension.runtime.lastError) {
      console.error(extension.runtime.lastError);
    } else {
      console.log('Download started with ID: ' + downloadId);
    }
  });
});