/* eslint-disable no-useless-return */
/* eslint-disable no-undef */
const Url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const apiPath = 'key0329';
const token = '0fWkelXd5wUVly8uLgIwLborQ4p2';

// 渲染訂單資訊
function renderTable(arr) {
  const orderPageTableContent = document.querySelector('.orderPage-table-content');

  let str = '';

  arr.forEach((item) => {
    // 訂單品項字串
    let productStr = '';
    item.products.forEach((productItem) => {
      productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`;
    });

    // 訂單狀態字串
    let orderStatus = '';
    if (item.paid === true) {
      orderStatus = '已付款';
    } else {
      orderStatus = '未付款';
    }

    // 訂單日期字串
    const createOrderTime = new Date(item.createdAt * 1000);
    const createOrderDate = `${createOrderTime.getFullYear()} / ${
      createOrderTime.getMonth() + 1
    } / ${createOrderTime.getDate()}`;

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
      <td>${createOrderDate}</td>
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

// 刪除全部訂單
function deleteAllOrderItem() {
  const deleteAllOrders = document.querySelector('.js-deleteAllOrders');
  if (deleteAllOrders) {
    deleteAllOrders.addEventListener('click', (e) => {
      e.preventDefault();
      axios
        .delete(`${Url}/admin/${apiPath}/orders`, {
          headers: {
            Authorization: token,
          },
        })
        .then(() => {
          // eslint-disable-next-line no-use-before-define
          getOrderData();
          Swal.fire({
            icon: 'success',
            title: '已清除全部訂單',
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

// C3.js 圖表
function renderC3(data) {
  const total = {};
  data.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.category] === undefined) {
        total[productItem.category] = productItem.price * productItem.quantity;
      } else {
        total[productItem.category] += productItem.price * productItem.quantity;
      }
    });
  });

  const categoryAry = Object.keys(total);
  const newData = [];
  categoryAry.forEach((item) => {
    const arr = [];
    arr.push(item);
    arr.push(total[item]);
    newData.push(arr);
  });

  // 資料大小排序
  newData.sort((a, b) => b[1] - a[1]);

  // 如果筆數超過四筆，統整為其他
  if (newData.length > 3) {
    let otherTotal = 0;
    newData.forEach((item, index) => {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    });

    newData.splice(3, newData.length - 1);
    newData.push(['其他', otherTotal]);
  }

  // eslint-disable-next-line no-unused-vars, no-undef
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: 'pie',
      columns: newData,
    },
  });
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
      renderC3(orderData);
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
  deleteAllOrderItem();
}

adminInit();
