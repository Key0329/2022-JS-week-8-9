/* eslint-disable no-undef */
const Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const apiPath = 'key0329';

// C3.js 圖表
// eslint-disable-next-line no-unused-vars, no-undef
const chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
    type: 'pie',
    columns: [
      ['Louvre 雙人床架', 1],
      ['Antony 雙人床架', 2],
      ['Anty 雙人床架', 3],
      ['其他', 4],
    ],
    colors: {
      'Louvre 雙人床架': '#DACBFF',
      'Antony 雙人床架': '#9D7FEA',
      'Anty 雙人床架': '#5434A7',
      其他: '#301E5F',
    },
  },
});

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
        <del class="originPrice">NT$ ${item.origin_price}</del>
        <p class="nowPrice">NT$ ${item.price}</p>
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
        <td>NT$ ${item.product.price}</td>
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
        <td>NT$ ${item.product.price * item.quantity}</td>
        <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}"> clear </a>
        </td>
      </tr>
    `;
  });

  shoppingCartList.innerHTML = str;
  totalPrice.textContent = `NT$ ${data.finalTotal}`;
}

// 加入購物車
function addCart(data) {
  const productList = document.querySelector('.productWrap');
  productList.addEventListener('click', (e) => {
    e.preventDefault();
    if (e.target.getAttribute('class') === 'addCardBtn') {
      let numCheck = 1;
      const { id } = e.target.dataset;

      data.carts.forEach((item) => {
        if (item.product.id === id) {
          // eslint-disable-next-line no-multi-assign, no-param-reassign
          numCheck = item.quantity += 1;
        }
      });

      axios
        .post(`${Url}/customer/${apiPath}/carts`, {
          data: {
            productId: e.target.dataset.id,
            quantity: numCheck,
          },
        })
        .then((res) => {
          const updateCartData = res.data;
          renderCart(updateCartData);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  });
}

// function plusCartNum() {
//   axios.patch(`${Url}/customer/${apiPath}/carts`, {
//     data: {
//       id: '購物車 ID (String)',
//       quantity: 6,
//     },
//   });
// }

// 修改購物車數量
function updateCart(data) {
  const shoppingCartList = document.querySelector('.shoppingCart-list');
  shoppingCartList.addEventListener('click', (e) => {
    e.preventDefault();
    const numBtn = e.target.closest('A');
    const cartId = numBtn.dataset.id;

    let numCheck = 1;
    if (numCheck < 1) {
      return;
    }

    data.carts.forEach((item) => {
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

    const newData = {
      data: {
        id: cartId,
        quantity: numCheck,
      },
    };

    axios
      .patch(`${Url}/customer/${apiPath}/carts`, newData)
      .then((res) => {
        const updateCartData = res.data;
        renderCart(updateCartData);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
      });
  });
}

// 取得購物車資料
function getCartData() {
  axios
    .get(`${Url}/customer/${apiPath}/carts`)
    .then((res) => {
      const cartData = res.data;
      renderCart(cartData);
      addCart(cartData);
      updateCart(cartData);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 網頁初始化
function init() {
  getProductData();
  getCartData();
}

init();
