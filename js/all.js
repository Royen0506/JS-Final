const productList = document.querySelector(".productWrap");
const cartList = document.querySelector(".cartList");
let productData;
let cartData;

//設定資料初始
function init() {
  getProductList();
  getCartList();
}
init();

//取得產品列表
function getProductList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
    )
    .then((response) => {
      productData = response.data.products;
      renderProductList();
    });
}

//產品列表html結構渲染
function renderProductList() {
  let str = "";
  productData.forEach((item) => {
    str += combineProductHTMLItem(item);
  });
  productList.innerHTML = str;
}
function combineProductHTMLItem(item) {
  return `<li class="productCard" ">
                <h4 class="productType">新品</h4>
                <img src="${item.images}"
                    alt="">
                <a href="#" class="addCardBtn" data-id="${
                  item.id
                }">加入購物車</a>
                <h3>${item.title}</h3>
                <del class="originPrice">NT$${numberComma(
                  item.origin_price
                )}</del>
                <p class="nowPrice">NT$${numberComma(item.price)}</p>
            </li>`;
}

//下拉選單篩選
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener("change", (e) => {
  if (e.target.value == "全部") {
    renderProductList();
    return;
  }

  let str = "";
  productData.forEach((item) => {
    if (e.target.value == item.category) {
      str += combineProductHTMLItem(item);
    }
  });
  productList.innerHTML = str;
});

//取得購物車列表並渲染html結構
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts
`
    )
    .then(function (response) {
      cartData = response.data.carts;
      const totalPrice = document.querySelector("#totalPrice");
      let str = "";
      cartData.forEach((item) => {
        str += `<tr>
          <td>
              <div class="cardItem-title">
                  <img src="${item.product.images}"alt="">
                  <p>${item.product.title}</p>
              </div>
          </td>
          <td>NT$${numberComma(item.product.price)}</td>
          <td>${item.quantity}</td>
          <td>NT$${numberComma(item.product.price * item.quantity)}</td>
          <td class="discardBtn">
              <a data-id="${item.id}" href="#" class="material-icons">
                  clear
              </a>
          </td>
      </tr>`;
      });
      cartList.innerHTML = str;
      totalPrice.textContent = response.data.finalTotal;
    });
}

//加入購物車
productList.addEventListener("click", (e) => {
  e.preventDefault(); //移除連接的預設行為
  if (e.target.getAttribute("class") != "addCardBtn") {
    return; //如果不是點到加入購物車就不執行下面的程式碼
  }

  let productId = e.target.getAttribute("data-id");
  let orderNum = 1; //計算單一產品購買的數量

  cartData.forEach((item) => {
    //針對購物車資料跑迴圈
    if (item.product.id === productId) {
      //如果購物車內有相同id則數量+1
      orderNum = item.quantity += 1;
    }
  });

  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: orderNum,
        },
      }
    )
    .then((response) => {
      alert("已加入購物車");
      getCartList(); //加入購物車後重新渲染購物車畫面
    });
});

//刪除指定訂單
cartList.addEventListener("click", (e) => {
  e.preventDefault();
  const cardId = e.target.getAttribute("data-id");
  if (cardId == null) {
    return;
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cardId}`
    )
    .then((response) => {
      alert("你已刪除一筆訂單");
      getCartList();
    });
});

//刪除所有品項
const deleteAllOrdersBtn = document.querySelector(".discardAllBtn");
deleteAllOrdersBtn.addEventListener("click", (e) => {
  e.preventDefault();
  alert("確定要刪除所有訂單嗎");
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then((response) => {
      getCartList();
      alert("已刪除所有訂單");
    })
    .catch((error) => {
      alert("購物車內無訂單，請勿重複點擊");
    });
});

//產生訂單

const orderInfoBtn = document.querySelector(".orderInfo-btn");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

orderInfoBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (cartData.length == 0) {
    alert("請將品項加入購物車");
    return;
  }

  if (
    (customerName.value == "",
    customerPhone.value == "",
    customerEmail.value == "",
    customerAddress.value == "" || tradeWay.value == "")
  ) {
    alert("請輸入對應資料");
    return;
  }

  if (isValidPhone(customerPhone.value) == false) {
    document.querySelector(`[data-message="電話"]`).textContent =
      "請輸入正確電話格式";
    return;
  } else {
    document.querySelector(`[data-message="電話"]`).textContent = "";
  }

  if (isValidEmail(customerEmail.value) == false) {
    document.querySelector(`[data-message="Email"]`).textContent =
      "請輸入正確Email格式";
    return;
  } else {
    document.querySelector(`[data-message="Email"]`).textContent = "";
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName.value,
            tel: customerPhone.value,
            email: customerEmail.value,
            address: customerAddress.value,
            payment: tradeWay.value,
          },
        },
      }
    )
    .then((response) => {
      alert("訂單已成功送出");
      customerName.value = "";
      customerPhone.value = "";
      customerEmail.value = "";
      customerAddress.value = "";
      tradeWay.value = "ATM";
      getCartList();
    });
});

//utilities js
function numberComma(num) {
  let comma = /\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g;
  return num.toString().replace(comma, ",");
}

function isValidEmail(email) {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{3})+$/;
  return emailRegex.test(email);
}

function isValidPhone(number) {
  const emailRegex = /^09[0-9]{8}$/;
  return emailRegex.test(number);
}
