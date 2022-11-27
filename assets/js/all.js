"use strict";

/* eslint-disable no-useless-return */

/* eslint-disable no-undef */
var Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
var apiPath = 'key0329';
var token = '0fWkelXd5wUVly8uLgIwLborQ4p2'; // 渲染訂單資訊

function renderTable(arr) {
  var orderPageTableContent = document.querySelector('.orderPage-table-content');
  var str = '';
  arr.forEach(function (item) {
    // 訂單品項字串
    var productStr = '';
    item.products.forEach(function (productItem) {
      productStr += "<p>".concat(productItem.title, " x ").concat(productItem.quantity, "</p>");
    }); // 訂單狀態字串

    var orderStatus = '';

    if (item.paid === true) {
      orderStatus = '已付款';
    } else {
      orderStatus = '未付款';
    } // 訂單日期字串


    var createOrderTime = new Date(item.createdAt * 1000);
    var createOrderDate = "".concat(createOrderTime.getFullYear(), " / ").concat(createOrderTime.getMonth() + 1, " / ").concat(createOrderTime.getDate());
    str += "\n    <tr>\n      <td>".concat(item.id, "</td>\n      <td>\n        <p>").concat(item.user.name, "</p>\n        <p>").concat(item.user.tel, "</p>\n      </td>\n      <td>").concat(item.user.address, "</td>\n      <td>").concat(item.user.email, "</td>\n      <td>\n        ").concat(productStr, "\n      </td>\n      <td>").concat(createOrderDate, "</td>\n      <td class=\"orderStatus\">\n        <a href=\"#\" class=\"js-orderStatus\" data-status=\"").concat(item.paid, "\" data-id=\"").concat(item.id, "\">").concat(orderStatus, "</a>\n      </td>\n      <td>\n        <input type=\"button\" class=\"delSingleOrder-Btn\" data-id=\"").concat(item.id, "\" value=\"\u522A\u9664\" />\n      </td>\n    </tr>\n    ");
  });

  if (orderPageTableContent) {
    orderPageTableContent.innerHTML = str;
  }
} // 更改訂單狀態


function changeOrderItemStatus(orderId, status) {
  var newStatus;

  if (status === 'true') {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios.put("".concat(Url, "/admin/").concat(apiPath, "/orders"), {
    data: {
      id: orderId,
      paid: newStatus
    }
  }, {
    headers: {
      Authorization: token
    }
  }).then(function () {
    Swal.fire({
      icon: 'success',
      title: '修改完成',
      showConfirmButton: false,
      timer: 1500
    }); // eslint-disable-next-line no-use-before-define

    getOrderData();
  })["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  });
} // 刪除單筆訂單


function deleteOrderItem(orderId) {
  axios["delete"]("".concat(Url, "/admin/").concat(apiPath, "/orders/").concat(orderId), {
    headers: {
      Authorization: token
    }
  }).then(function () {
    Swal.fire({
      icon: 'success',
      title: '刪除完成',
      showConfirmButton: false,
      timer: 1500
    }); // eslint-disable-next-line no-use-before-define

    getOrderData();
  })["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  });
} // 刪除全部訂單


function deleteAllOrderItem() {
  var deleteAllOrders = document.querySelector('.js-deleteAllOrders');

  if (deleteAllOrders) {
    deleteAllOrders.addEventListener('click', function (e) {
      e.preventDefault();
      axios["delete"]("".concat(Url, "/admin/").concat(apiPath, "/orders"), {
        headers: {
          Authorization: token
        }
      }).then(function () {
        // eslint-disable-next-line no-use-before-define
        getOrderData();
        Swal.fire({
          icon: 'success',
          title: '已清除全部訂單',
          showConfirmButton: false,
          timer: 1500
        });
      })["catch"](function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        Swal.fire({
          title: '購物車已空',
          showConfirmButton: false,
          timer: 1500
        });
      });
    });
  }
} // 修改訂單資訊


function updateOrderItem() {
  var orderPageTableContent = document.querySelector('.orderPage-table-content');

  if (orderPageTableContent) {
    orderPageTableContent.addEventListener('click', function (e) {
      e.preventDefault();
      var targetClass = e.target.getAttribute('class');
      var orderId = e.target.dataset.id;
      var status = e.target.dataset.status;

      if (targetClass !== 'js-orderStatus' && targetClass !== 'delSingleOrder-Btn') {
        return;
      }

      if (targetClass === 'js-orderStatus') {
        changeOrderItemStatus(orderId, status);
      }

      if (targetClass === 'delSingleOrder-Btn') {
        deleteOrderItem(orderId);
      }
    });
  }
} // C3.js 圖表


function renderC3(data) {
  var total = {};
  data.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });
  var categoryAry = Object.keys(total);
  var newData = [];
  categoryAry.forEach(function (item) {
    var arr = [];
    arr.push(item);
    arr.push(total[item]);
    newData.push(arr);
  }); // 資料大小排序

  newData.sort(function (a, b) {
    return b[1] - a[1];
  }); // 如果筆數超過四筆，統整為其他

  if (newData.length > 3) {
    var otherTotal = 0;
    newData.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    });
    newData.splice(3, newData.length - 1);
    newData.push(['其他', otherTotal]);
  } // eslint-disable-next-line no-unused-vars, no-undef


  var chart = c3.generate({
    bindto: '#chart',
    // HTML 元素綁定
    data: {
      type: 'pie',
      columns: newData
    }
  });
} // 取得訂單資訊


function getOrderData() {
  axios.get("".concat(Url, "/admin/").concat(apiPath, "/orders"), {
    headers: {
      Authorization: token
    }
  }).then(function (res) {
    var orderData = res.data.orders;
    renderTable(orderData);
    renderC3(orderData);
  })["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  });
} // 初始化


function adminInit() {
  getOrderData();
  updateOrderItem();
  deleteAllOrderItem();
}

adminInit();
"use strict";
"use strict";

/* eslint-disable no-useless-return */

/* eslint-disable no-undef */
var Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
var apiPath = 'key0329'; // 增加千分位逗點

function toThousands(x) {
  var parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
} // 渲染產品列表


function renderProducts(arr) {
  var productList = document.querySelector('.productWrap');
  var str = '';
  arr.forEach(function (item) {
    str += "\n    <li class=\"productCard\">\n        <h4 class=\"productType\">\u65B0\u54C1</h4>\n        <img src=\"".concat(item.images, "\" alt=\"\">\n        <a href=\"#\" class=\"addCardBtn\" data-id=").concat(item.id, ">\u52A0\u5165\u8CFC\u7269\u8ECA</a>\n        <h3>").concat(item.title, "</h3>\n        <del class=\"originPrice\">NT$ ").concat(toThousands(item.origin_price), "</del>\n        <p class=\"nowPrice\">NT$ ").concat(toThousands(item.price), "</p>\n    </li>\n    ");
  });
  productList.innerHTML = str;
} // 篩選產品列表


function productFilter(arr) {
  var productSelect = document.querySelector('.productSelect');
  productSelect.addEventListener('change', function (e) {
    if (e.target.value === '全部') {
      renderProducts(arr);
    } else {
      var filterData = arr.filter(function (item) {
        return item.category === e.target.value;
      });
      renderProducts(filterData);
    }
  });
} // 取得產品資料


function getProductData() {
  axios.get("".concat(Url, "/customer/").concat(apiPath, "/products")).then(function (res) {
    var productData = res.data.products;
    renderProducts(productData);
    productFilter(productData);
  })["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  });
} // 渲染購物車列表


function renderCart(data) {
  var shoppingCartList = document.querySelector('.shoppingCart-list');
  var totalPrice = document.querySelector('.totalPrice');
  var str = '';
  data.carts.forEach(function (item) {
    str += "\n      <tr>\n        <td>\n          <div class=\"cardItem-title\">\n            <img src=\"".concat(item.product.images, "\" alt=\"\" />\n            <p>").concat(item.product.title, "</p>\n          </div>\n        </td>\n        <td>NT$ ").concat(toThousands(item.product.price), "</td>\n        <td>\n        <p >").concat(item.quantity, "</p>\n        <a class=\"fs-4 text-decoration-none me-4\" data-id=\"").concat(item.id, "\" data-numchange=\"plus\" href=\"#\"><span class=\"material-symbols-outlined\">\n        add_circle\n        </span></a>\n        <a class=\"fs-4 text-decoration-none text-danger\" data-id=\"").concat(item.id, "\" data-numchange=\"minus\" href=\"#\"><span class=\"material-symbols-outlined\">\n        do_not_disturb_on\n        </span></a>\n        </td>\n        <td>NT$ ").concat(toThousands(item.product.price * item.quantity), "</td>\n        <td class=\"discardBtn\">\n          <a href=\"#\" class=\"material-icons\" data-deleteid=\"").concat(item.id, "\"> clear </a>\n        </td>\n      </tr>\n    ");
  });
  shoppingCartList.innerHTML = str;
  totalPrice.textContent = "NT$ ".concat(toThousands(data.finalTotal));
} // 加入購物車


function addCart() {
  var productList = document.querySelector('.productWrap');

  if (productList) {
    productList.addEventListener('click', function (e) {
      e.preventDefault();

      if (e.target.getAttribute('class') === 'addCardBtn') {
        var id = e.target.dataset.id;
        axios.post("".concat(Url, "/customer/").concat(apiPath, "/carts"), {
          data: {
            productId: id,
            quantity: 1
          }
        }).then(function (res) {
          var updateCartData = res.data;
          renderCart(updateCartData);
          Swal.fire({
            icon: 'success',
            title: '已加入購物車',
            showConfirmButton: false,
            timer: 1500
          });
        })["catch"](function (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        });
      }
    });
  }
} // 修改購物車數量


function updateCart() {
  var shoppingCartList = document.querySelector('.shoppingCart-list');

  if (shoppingCartList) {
    shoppingCartList.addEventListener('click', function (e) {
      e.preventDefault();
      axios.get("".concat(Url, "/customer/").concat(apiPath, "/carts")).then(function (res) {
        var cartData = res.data;
        var numBtn = e.target.closest('A');

        if (e.target.nodeName !== 'SPAN') {
          return;
        }

        var cartId = numBtn.dataset.id;
        var numCheck = 1;
        cartData.carts.forEach(function (item) {
          if (item.id === cartId) {
            if (numBtn.dataset.numchange === 'plus') {
              // eslint-disable-next-line no-multi-assign, no-param-reassign
              numCheck = item.quantity += 1;
            } else if (numBtn.dataset.numchange === 'minus') {
              // eslint-disable-next-line no-multi-assign, no-param-reassign
              numCheck = item.quantity -= 1;
            }
          }
        });

        if (numCheck < 1) {
          Swal.fire({
            icon: 'error',
            title: '數量不能小於 1',
            showConfirmButton: false,
            timer: 1500
          });
          return;
        }

        var newData = {
          data: {
            id: cartId,
            quantity: numCheck
          }
        }; // eslint-disable-next-line consistent-return

        return axios.patch("".concat(Url, "/customer/").concat(apiPath, "/carts"), newData);
      }).then(function (resp) {
        var updateCartData = resp.data;
        renderCart(updateCartData);
      })["catch"](function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
    });
  }
} // 刪除全部購物車


function deleteAllCart() {
  var deleteAllCarts = document.querySelector('.js-deleteAllCarts');

  if (deleteAllCarts) {
    deleteAllCarts.addEventListener('click', function (e) {
      e.preventDefault();
      axios["delete"]("".concat(Url, "/customer/").concat(apiPath, "/carts")).then(function (res) {
        var deleteData = res.data;
        renderCart(deleteData);
        Swal.fire({
          icon: 'success',
          title: '已清空購物車',
          showConfirmButton: false,
          timer: 1500
        });
      })["catch"](function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        Swal.fire({
          title: '購物車已空',
          showConfirmButton: false,
          timer: 1500
        });
      });
    });
  }
} // 刪除特定購物車


function deleteCart() {
  var shoppingCartList = document.querySelector('.shoppingCart-list');

  if (shoppingCartList) {
    shoppingCartList.addEventListener('click', function (e) {
      e.preventDefault();

      if (e.target.nodeName !== 'A') {
        return;
      }

      var cartId = e.target.dataset.deleteid;
      axios["delete"]("".concat(Url, "/customer/").concat(apiPath, "/carts/").concat(cartId)).then(function (res) {
        var deleteData = res.data;
        renderCart(deleteData);
      })["catch"](function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
    });
  }
} // 取得購物車資料


function getCartData() {
  axios.get("".concat(Url, "/customer/").concat(apiPath, "/carts")).then(function (res) {
    var cartData = res.data;
    renderCart(cartData);
  })["catch"](function (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  });
} // 送出訂單


function submitOrder() {
  var orderInfoBtn = document.querySelector('.orderInfo-btn');

  if (orderInfoBtn) {
    orderInfoBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var customerName = document.querySelector('#customerName').value;
      var customerPhone = document.querySelector('#customerPhone').value;
      var customerEmail = document.querySelector('#customerEmail').value;
      var customerAddress = document.querySelector('#customerAddress').value;
      var tradeWay = document.querySelector('#tradeWay').value;

      if (customerName === '' || customerPhone === '' || customerEmail === '' || customerAddress === '' || tradeWay === '') {
        Swal.fire({
          title: '資訊請填寫完整',
          icon: 'error',
          confirmButtonText: '確定'
        });
        return;
      }

      var orderData = {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay
          }
        }
      };
      axios.get("".concat(Url, "/customer/").concat(apiPath, "/carts")).then(function (res) {
        var cartData = res.data.carts;

        if (cartData.length === 0) {
          Swal.fire({
            title: '請加入購物車',
            icon: 'error',
            confirmButtonText: '確定'
          });
          return;
        } // eslint-disable-next-line consistent-return


        return axios.post("".concat(Url, "/customer/").concat(apiPath, "/orders"), orderData);
      }).then(function (res) {
        if (res.data !== null) {
          Swal.fire({
            icon: 'success',
            title: '訂單送出成功',
            showConfirmButton: false,
            timer: 1500
          });
          document.querySelector('#customerName').value = '';
          document.querySelector('#customerPhone').value = '';
          document.querySelector('#customerEmail').value = '';
          document.querySelector('#customerAddress').value = '';
          document.querySelector('#tradeWay').value = 'ATM';
          getCartData();
        }
      })["catch"](function (error) {
        // eslint-disable-next-line no-console
        console.log(error);
      });
    });
  }
} // 表單驗證


function validateOrderForm() {
  var inputs = document.querySelectorAll('input[name],select[name]');
  var form = document.querySelector('.orderInfo-form');
  var constraints = {
    姓名: {
      presence: {
        message: '必填欄位'
      }
    },
    電話: {
      presence: {
        message: '必填欄位'
      },
      length: {
        minimum: 8,
        message: '需超過 8 碼'
      }
    },
    Email: {
      presence: {
        message: '必填欄位'
      },
      email: {
        message: '格式錯誤'
      }
    },
    寄送地址: {
      presence: {
        message: '必填欄位'
      }
    },
    交易方式: {
      presence: {
        message: '必填欄位'
      }
    }
  };
  inputs.forEach(function (item) {
    item.addEventListener('blur', function () {
      // eslint-disable-next-line no-param-reassign
      item.nextElementSibling.textContent = '';
      var errors = validate(form, constraints) || '';

      if (errors) {
        Object.keys(errors).forEach(function (keys) {
          document.querySelector("[data-message=\"".concat(keys, "\"]")).textContent = errors[keys];
        });
      }
    });
  });
} // 網頁初始化


function init() {
  getProductData();
  getCartData();
  addCart();
  deleteAllCart();
  updateCart();
  deleteCart();
  submitOrder();
  validateOrderForm();
}

init();
//# sourceMappingURL=all.js.map
