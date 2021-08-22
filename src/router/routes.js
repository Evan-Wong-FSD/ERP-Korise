
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/BOM表',
        name: 'BOM表',
        component: () => import('pages/bomSheet/main.vue')
      },
      {
        path: '/進銷庫存記錄',
        name: '進銷庫存記錄',
        component: () => import('pages/invoiceRecord/invoiceRecord.vue')
      },
      {
        path: '/進銷項表單',
        name: '進銷項表單',
        component: () => import('pages/invoiceSheet/invoiceSheet.vue')
      },
      {
        path: '/物料清單',
        name: '物料清單',
        component: () => import('pages/materialsList/materialsList.vue')
      },
      {
        path: '/材料資料',
        name: '材料資料',
        component: () => import('pages/materialsInform/materialsInformRecord.vue')
      },
      // {
      //   path: '/材料資料表單',
      //   name: '材料資料表單',
      //   component: () => import('pages/materialsInformSheet.vue')
      // },
      {
        path: '/廠商資料',
        name: '廠商資料',
        component: () => import('pages/firmInform/firmInformRecord.vue')
      },
      // {
      //   path: '/廠商資料表單',
      //   name: '廠商資料表單',
      //   component: () => import('pages/firmInformSheet.vue')
      // },
      {
        path: '/產品種類',
        name: '產品種類',
        component: () => import('pages/ProductClassification/ProductClassification.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
