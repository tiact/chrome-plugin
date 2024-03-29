'use strict';

import './popup.css';



(function() {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions

  document.getElementById("contextMenus").onclick = function () {
    chrome.runtime.sendMessage({ 'msg': 'contextMenus' }, function (event) {
        chrome.notifications.create("menus", {
            type: 'basic',
            title: '响应通知',
            message: `收到响应，响应报文： ${event.farewell}`,
            iconUrl: 'icons/icon16.png',
        })
    })
}

  const btnColor = ['#FFCCCC', '#FFEE99', '#bed2bb', '#2e59a7', '#CCCCFF', '#F0BBFF']

const btnArr = document.getElementsByTagName('button')

for (let i = 0, len = btnArr.length; i < len; i++) {
    var btn = btnArr[i];
    btn.onclick = async (event) => {
        const index = event.target.className.split('-')[1]
        // 调用Chrome接口取出当前标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // 以当前标签页为上下文，执行函数
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            args: [{ btnColor, index }],  // // 无法访问外面的数据，args 可传递外面的数据 
            function: (event) => {
                document.body.style.backgroundColor = event.btnColor[event.index - 1]
            },
        });

    }
}


  const counterStorage = {
    get: cb => {
      chrome.storage.sync.get(['count'], result => {
        cb(result.count);
      });
    },
    set: (value, cb) => {
      chrome.storage.sync.set(
        {
          count: value,
        },
        () => {
          cb();
        }
      );
    },
  };

  function setupCounter(initialValue = 0) {
    document.getElementById('counter').innerHTML = initialValue;

    document.getElementById('incrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'INCREMENT',
      });
    });

    document.getElementById('decrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'DECREMENT',
      });
    });
  }

  function updateCounter({ type }) {
    counterStorage.get(count => {
      let newCount;

      if (type === 'INCREMENT') {
        newCount = count + 1;
      } else if (type === 'DECREMENT') {
        newCount = count - 1;
      } else {
        newCount = count;
      }

      counterStorage.set(newCount, () => {
        document.getElementById('counter').innerHTML = newCount;

        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
          const tab = tabs[0];

          chrome.tabs.sendMessage(
            tab.id,
            {
              type: 'COUNT',
              payload: {
                count: newCount,
              },
            },
            response => {
              console.log('Current count value passed to contentScript file');
            }
          );
        });
      });
    });
  }

  function restoreCounter() {
    // Restore count value
    counterStorage.get(count => {
      if (typeof count === 'undefined') {
        // Set counter value as 0
        counterStorage.set(0, () => {
          setupCounter(0);
        });
      } else {
        setupCounter(count);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', restoreCounter);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    response => {
      console.log(response.message);
    }
  );
})();
