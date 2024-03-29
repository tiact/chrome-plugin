'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});

// chrome.runtime.onMessage.addListener(callback)
// 此处的callback为必选参数，为回调函数。
// callback接收到的参数有三个，分别是message、sender和sendResponse，即消息内容、消息发送者相关信息和相应函数。
// 其中sender对象包含4个属性，分别是tab、id、url和tlsChannelId，tab是发起消息的标签
chrome.runtime.onMessage.addListener(
  function (message, sender, sendResponse) {
      if (message.msg == 'Hello') {
          sendResponse({ farewell: "goodbye" });
      } else if (message.msg == 'contextMenus') {
          // 创建自定义右键菜单
          contextMenus()
          sendResponse({ farewell: "菜单创建成功 !!!" });
      }
  }
);
contextMenus()

// 自定义右键菜单
function contextMenus() {
  chrome.contextMenus.create({
      title: "法海菜单", //菜单的名称
      id: '01', //一级菜单的id
      contexts: ['page'], // page表示页面右键就会有这个菜单，如果想要当选中文字时才会出现此右键菜单，用：selection
  });

  chrome.contextMenus.create({
      title: '大威天龙，大罗法咒，般若诸佛，般若巴嘛轰。', //菜单的名称
      id: '0101',//二级菜单的id
      parentId: '01',//表示父菜单是“右键快捷菜单”
      contexts: ['page'],
  });

  chrome.contextMenus.create({
      title: '哼！雕虫小技，竟敢班门弄斧，大威天龙!', //菜单的名称
      id: '0102',
      parentId: '01',//表示父菜单是“右键快捷菜单”
      contexts: ['page'],
  });

  chrome.contextMenus.create({
      title: '自定义选中文字跳转百度搜索', //菜单的名称
      id: '02',
      contexts: ['selection'],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId == '0101') {
          var createData = {
              url: "https://baidu.com",
              type: "popup",
              top: 200,
              left: 300,
              width: 1300,
              height: 800
          }
          // 创建（打开）一个新的浏览器窗口，可以提供大小、位置或默认 URL 等可选参数
          chrome.windows.create(createData);
      } else if (info.menuItemId == '02') {
          // 选中文字跳转百度检索
          chrome.tabs.create({ url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(info.selectionText) });
      } else if (info.menuItemId == '0102') {
          chrome.tabs.create({ url: 'https://www.csdn.net' });
      }
  })
}
