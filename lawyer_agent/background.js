let intervalId = null;
let isCapturing = false;

//chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//  if (message.action === 'startCapture') {
//    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//      const tab = tabs[0];
//      startScreenshotCapture(tab);
//    });
//  } else if (message.action === 'stopCapture') {
//    stopScreenshotCapture();
//  } else if (message.action === 'checkCaptureStatus') {
//    sendResponse({ isCapturing: isCapturing });
//  }
//});

function startScreenshotCapture(tab) {
  if (isCapturing) return; // Если уже захватываем, не запускаем новый процесс
  isCapturing = true; // Устанавливаем состояние в true
  intervalId = setInterval(() => {
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (screenshotUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      sendScreenshot(screenshotUrl);
    });
  }, 5000);
}

function stopScreenshotCapture() {
  if (!isCapturing) return;
  isCapturing = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("Screenshot capture stopped");
  }
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: extractAndSendText
        });

        startScreenshotCapture(tab);

//        chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (screenshotUrl) => {
//            if (chrome.runtime.lastError) {
//              console.error(chrome.runtime.lastError);
//              return;
//            }
//            sendScreenshot(screenshotUrl);
//        });

    }
});


function extractAndSendText() {
    const  text = document.documentElement.innerHTML;
    if (text) {
        fetch('http://127.0.0.1:8001/upload_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });
    }
}


function sendScreenshot(screenshotUrl) {
  fetch('http://127.0.0.1:8001/upload_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: screenshotUrl }),
  });
}

