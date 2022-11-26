/* eslint-disable no-useless-return */
/* eslint-disable no-undef */
const Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const apiPath = 'key0329';
const token = '0fWkelXd5wUVly8uLgIwLborQ4p2';

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

// 渲染訂單資訊
function renderTable(arr) {
  const orderPageTableContent = document.querySelector('.orderPage-table-content');

  let str = '';

  arr.forEach((item) => {
    let productStr = '';
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`;
    });

    let orderStatus = '';
    if (item.paid === true) {
      orderStatus = '已付款';
    } else {
      orderStatus = '未付款';
    }

    str += `
    <tr>
      <td>${item.id}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        ${productStr}
      </td>
      <td>${item.createdAt}</td>
      <td class="orderStatus">
        <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除" />
      </td>
    </tr>
    `;
  });
  if (orderPageTableContent) {
    orderPageTableContent.innerHTML = str;
  }
}

// 更改訂單狀態
function changeOrderItemStatus(orderId, status) {
  let newStatus;
  if (status === 'true') {
    newStatus = false;
  } else {
    newStatus = true;
  }

  axios
    .put(
      `${Url}/admin/${apiPath}/orders`,
      {
        data: {
          id: orderId,
          paid: newStatus,
        },
      },
      {
        headers: {
          Authorization: token,
        },
      },
    )
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '修改完成',
        showConfirmButton: false,
        timer: 1500,
      });
      // eslint-disable-next-line no-use-before-define
      getOrderData();
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 刪除單筆訂單
function deleteOrderItem(orderId) {
  axios
    .delete(`${Url}/admin/${apiPath}/orders/${orderId}`, {
      headers: {
        Authorization: token,
      },
    })
    .then(() => {
      Swal.fire({
        icon: 'success',
        title: '刪除完成',
        showConfirmButton: false,
        timer: 1500,
      });
      // eslint-disable-next-line no-use-before-define
      getOrderData();
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 修改訂單資訊
function updateOrderItem() {
  const orderPageTableContent = document.querySelector('.orderPage-table-content');
  if (orderPageTableContent) {
    orderPageTableContent.addEventListener('click', (e) => {
      e.preventDefault();
      const targetClass = e.target.getAttribute('class');
      const orderId = e.target.dataset.id;
      const { status } = e.target.dataset;

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
}

// 取得訂單資訊
function getOrderData() {
  axios
    .get(`${Url}/admin/${apiPath}/orders`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      const orderData = res.data.orders;
      renderTable(orderData);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    });
}

// 初始化
function adminInit() {
  getOrderData();
  updateOrderItem();
}

adminInit();
