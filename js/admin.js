//初始資料狀態
function init() {
  getOrderList();
}
init();

//圖表
function renderC3() {
  //整理物件資料
  let total = {};
  orderData.forEach((item) => {
    item.products.forEach((item) => {
      if (total[item.title] == undefined) {
        //沒有就創建；有就疊加
        total[item.title] = item.price * item.quantity;
      } else {
        total[item.title] += item.price * item.quantity;
      }
    });
  });
  //將物件資料轉為C3格式
  let newAry = Object.keys(total);
  let newData = []; //C3格式資料
  newAry.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);
  });
  //資料排序
  newData.sort((a, b) => {
    return b[1] - a[1]; //拿每個陣列內的第2比資料做比較
  });

  if (newData.length > 3) {
    //當陣列長度大於3才執行以下的程式碼
    let otherTotal = 0;
    newData.forEach((item, index) => {
      if (index > 2) {
        //如果是第三筆之後的資料執行以下的程式碼
        otherTotal += newData[index][1]; //加總
      }
    });
    newData.splice(3, newData.length - 1); //刪除newData第四筆開始的資料
    newData.push(["其他", otherTotal]); //將其他的總額加入到newData內;
  }

  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: newData,
    },
  });
}

//取得訂單資料並選染html結構
let orderData = [];
const orderList = document.querySelector(".js-orderList");
function getOrderList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders
`,
      {
        headers: {
          authorization: token, //發出request時要在headers裡帶金鑰
        },
      }
    )
    .then((response) => {
      orderData = response.data.orders;
      renderList(orderData);
      renderC3();
    });
}

function renderList(data) {
  let str = "";
  data.forEach((item) => {
    //組產品字串
    let productStr = "";
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title}*${productItem.quantity}</p>`;
    });
    //判斷訂單狀態
    let paidStatus = "";
    if (item.paid == true) {
      paidStatus = "已處理";
    } else {
      paidStatus = "未處理";
    }
    //組時間字串
    const createdTime = new Date(item.createdAt * 1000);
    const createdOrderDate = `${createdTime.getFullYear()}/${
      createdTime.getMonth() + 1
    }/${createdTime.getDate()}`;
    //組訂單字串
    str += ` <tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    <p>${productStr}</p>
                </td>
                <td>${createdOrderDate}</td>
                <td class="orderStatus">
                    <a data-status="${item.paid}" class="jsOrderStatus" data-id="${item.id}" href="#">${paidStatus}</a>
                </td>
                <td>
                    <input data-id="${item.id}" type="button" class="delSingleOrder-Btn jsOrderDelete" value="刪除">
                </td>
            </tr>`;
  });
  orderList.innerHTML = str;
}

//監聽每筆訂單(處理修改狀態及刪除訂單)
orderList.addEventListener("click", (e) => {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  if (targetClass == "delSingleOrder-Btn jsOrderDelete") {
    deleteOrder(id);
    return;
  }

  if (targetClass == "jsOrderStatus") {
    let status = e.target.getAttribute("data-status");
    changeOrderStatus(status, id);
    return;
  }
});

//修改訂單狀態
function changeOrderStatus(status, id) {
  let newStatus;
  if (status == true) {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      { data: { id: id, paid: newStatus } },
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then((response) => {
      alert("訂單狀態已成功修改");
      getOrderList();
    });
}

//刪除指定訂單
function deleteOrder(id) {
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
      {
        headers: {
          authorization: token,
        },
      }
    )
    .then((response) => {
      alert("您已刪除一筆訂單");
      getOrderList();
    });
}

//刪除全部訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", (e) => {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      { headers: { authorization: token } }
    )
    .then((response) => {
      alert(response.data.message);
      getOrderList();
    });
});
