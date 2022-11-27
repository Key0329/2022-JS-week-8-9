/* eslint-disable no-useless-return */
/* eslint-disable no-undef */
const Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const apiPath = 'key0329';

// 增加千分位逗點
function toThousands(x) {
  const parts = x.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// 渲染產品列表
function renderProducts(arr) {
  const productList = document.querySelector('.productWrap');
  let str = '';

  arr.forEach((item) => {
    str += `
    <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$ ${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$ ${toThousands(item.price)}</p>
    </li>
    `;
  });

  productList.innerHTML = str;
}

// 篩選產品列表
function productFilter(arr) {
  const productSelect = document.querySelector('.productSelect');

  productSelect.addEventListener('change', (e) => {
    if (e.target.value === '全部') {
      renderProducts(arr);
    } else {
      const filterData = arr.filter((item) => item.category === e.target.value);
      renderProducts(filterData);
    }
  });
}

// 取得產品資料
function getProductData() {
  axios
    .get(`${Url}/customer/${apiPath}/products`)
    .then((res) => {
      const productData = res.data.products;
      renderProducts(productData);
      productFilter(productData);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 渲染購物車列表
function renderCart(data) {
  const shoppingCartList = document.querySelector('.shoppingCart-list');
  const totalPrice = document.querySelector('.totalPrice');
  let str = '';

  data.carts.forEach((item) => {
    str += `
      <tr>
        <td>
          <div class="cardItem-title">
            <img src="${item.product.images}" alt="" />
            <p>${item.product.title}</p>
          </div>
        </td>
        <td>NT$ ${toThousands(item.product.price)}</td>
        <td>
        <p >${item.quantity}</p>
        <a class="fs-4 text-decoration-none me-4" data-id="${
  item.id
}" data-numchange="plus" href="#"><span class="material-symbols-outlined">
        add_circle
        </span></a>
        <a class="fs-4 text-decoration-none text-danger" data-id="${
  item.id
}" data-numchange="minus" href="#"><span class="material-symbols-outlined">
        do_not_disturb_on
        </span></a>
        </td>
        <td>NT$ ${toThousands(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-deleteid="${item.id}"> clear </a>
        </td>
      </tr>
    `;
  });

  shoppingCartList.innerHTML = str;
  totalPrice.textContent = `NT$ ${toThousands(data.finalTotal)}`;
}

// 加入購物車
function addCart() {
  const productList = document.querySelector('.productWrap');
  if (productList) {
    productList.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.getAttribute('class') === 'addCardBtn') {
        const { id } = e.target.dataset;

        axios
          .post(`${Url}/customer/${apiPath}/carts`, {
            data: {
              productId: id,
              quantity: 1,
            },
          })
          .then((res) => {
            const updateCartData = res.data;
            renderCart(updateCartData);
            Swal.fire({
              icon: 'success',
              title: '已加入購物車',
              showConfirmButton: false,
              timer: 1500,
            });
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error);
          });
      }
    });
  }
}

// 修改購物車數量
function updateCart() {
  const shoppingCartList = document.querySelector('.shoppingCart-list');
  if (shoppingCartList) {
    shoppingCartList.addEventListener('click', (e) => {
      e.preventDefault();

      axios
        .get(`${Url}/customer/${apiPath}/carts`)
        .then((res) => {
          const cartData = res.data;

          const numBtn = e.target.closest('A');
          if (e.target.nodeName !== 'SPAN') {
            return;
          }

          const cartId = numBtn.dataset.id;

          let numCheck = 1;

          cartData.carts.forEach((item) => {
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
              timer: 1500,
            });
            return;
          }

          const newData = {
            data: {
              id: cartId,
              quantity: numCheck,
            },
          };

          // eslint-disable-next-line consistent-return
          return axios.patch(`${Url}/customer/${apiPath}/carts`, newData);
        })
        .then((resp) => {
          const updateCartData = resp.data;
          renderCart(updateCartData);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    });
  }
}

// 刪除全部購物車
function deleteAllCart() {
  const deleteAllCarts = document.querySelector('.js-deleteAllCarts');
  if (deleteAllCarts) {
    deleteAllCarts.addEventListener('click', (e) => {
      e.preventDefault();
      axios
        .delete(`${Url}/customer/${apiPath}/carts`)
        .then((res) => {
          const deleteData = res.data;
          renderCart(deleteData);
          Swal.fire({
            icon: 'success',
            title: '已清空購物車',
            showConfirmButton: false,
            timer: 1500,
          });
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
          Swal.fire({
            title: '購物車已空',
            showConfirmButton: false,
            timer: 1500,
          });
        });
    });
  }
}

// 刪除特定購物車
function deleteCart() {
  const shoppingCartList = document.querySelector('.shoppingCart-list');
  if (shoppingCartList) {
    shoppingCartList.addEventListener('click', (e) => {
      e.preventDefault();
      if (e.target.nodeName !== 'A') {
        return;
      }

      const cartId = e.target.dataset.deleteid;

      axios
        .delete(`${Url}/customer/${apiPath}/carts/${cartId}`)
        .then((res) => {
          const deleteData = res.data;
          renderCart(deleteData);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    });
  }
}

// 取得購物車資料
function getCartData() {
  axios
    .get(`${Url}/customer/${apiPath}/carts`)
    .then((res) => {
      const cartData = res.data;
      renderCart(cartData);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 送出訂單
function submitOrder() {
  const orderInfoBtn = document.querySelector('.orderInfo-btn');
  if (orderInfoBtn) {
    orderInfoBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const customerName = document.querySelector('#customerName').value;
      const customerPhone = document.querySelector('#customerPhone').value;
      const customerEmail = document.querySelector('#customerEmail').value;
      const customerAddress = document.querySelector('#customerAddress').value;
      const tradeWay = document.querySelector('#tradeWay').value;

      if (
        customerName === ''
        || customerPhone === ''
        || customerEmail === ''
        || customerAddress === ''
        || tradeWay === ''
      ) {
        Swal.fire({
          title: '資訊請填寫完整',
          icon: 'error',
          confirmButtonText: '確定',
        });
        return;
      }

      const orderData = {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      };

      axios
        .get(`${Url}/customer/${apiPath}/carts`)
        .then((res) => {
          const cartData = res.data.carts;
          if (cartData.length === 0) {
            Swal.fire({
              title: '請加入購物車',
              icon: 'error',
              confirmButtonText: '確定',
            });
            return;
          }

          // eslint-disable-next-line consistent-return
          return axios.post(`${Url}/customer/${apiPath}/orders`, orderData);
        })
        .then((res) => {
          if (res.data !== null) {
            Swal.fire({
              icon: 'success',
              title: '訂單送出成功',
              showConfirmButton: false,
              timer: 1500,
            });

            document.querySelector('#customerName').value = '';
            document.querySelector('#customerPhone').value = '';
            document.querySelector('#customerEmail').value = '';
            document.querySelector('#customerAddress').value = '';
            document.querySelector('#tradeWay').value = 'ATM';

            getCartData();
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    });
  }
}

// 表單驗證
function validateOrderForm() {
  const inputs = document.querySelectorAll('input[name],select[name]');
  const form = document.querySelector('.orderInfo-form');

  const constraints = {
    姓名: {
      presence: {
        message: '必填欄位',
      },
    },
    電話: {
      presence: {
        message: '必填欄位',
      },
      length: {
        minimum: 8,
        message: '需超過 8 碼',
      },
    },
    Email: {
      presence: {
        message: '必填欄位',
      },
      email: {
        message: '格式錯誤',
      },
    },
    寄送地址: {
      presence: {
        message: '必填欄位',
      },
    },
    交易方式: {
      presence: {
        message: '必填欄位',
      },
    },
  };

  inputs.forEach((item) => {
    item.addEventListener('blur', () => {
      // eslint-disable-next-line no-param-reassign
      item.nextElementSibling.textContent = '';
      const errors = validate(form, constraints) || '';

      if (errors) {
        Object.keys(errors).forEach((keys) => {
          document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        });
      }
    });
  });
}

// 網頁初始化
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
