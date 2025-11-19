/**
 * @file useTable.ts
 * @description 表格数据管理的自定义Hook
 * @author Liu
 * @date 2023-05-20
 *
 * 此Hook提供了完整的表格数据管理功能，包括：
 * - 分页管理
 * - 数据排序
 * - 数据过滤
 * - 加载状态管理
 * - 自动数据加载
 *
 * 适用于各种需要表格展示数据的场景，可与Vue 3的组合式API无缝集成。
 */
import { ref, reactive, computed } from "vue";

/**
 * 表格数据项的通用接口
 * 用于定义表格中每一行的数据结构
 * 支持任意键值对形式的数据
 */
export interface TableDataItem {
  [key: string]: any;
}

/**
 * 分页参数接口
 * 用于管理表格的分页状态
 */
export interface Pagination {
  /** 当前页码 */
  current: number;
  /** 每页显示的数据条数 */
  pageSize: number;
  /** 数据总条数 */
  total: number;
}

/**
 * 排序参数接口
 * 用于管理表格的排序状态
 */
export interface SortInfo {
  /** 排序的列名 */
  columnKey: string;
  /** 排序方向：asc(升序)、desc(降序)、''(无排序) */
  order: "asc" | "desc" | "";
}

/**
 * 表格加载选项接口
 * 用于配置useTable hook的初始化参数
 * @template T 表格数据项的类型，需扩展TableDataItem接口
 */
export interface TableOptions<T extends TableDataItem> {
  /** 初始页码，默认为1 */
  defaultCurrent?: number;
  /** 初始每页条数，默认为10 */
  defaultPageSize?: number;
  /**
   * 加载数据的函数，必需参数
   * @param params 包含分页、排序和过滤信息的参数对象
   * @returns 返回Promise，解析为包含数据数组和总数的对象
   */
  fetchData: (params: {
    /** 当前页码 */
    page: number;
    /** 每页条数 */
    pageSize: number;
    /** 排序信息，可选 */
    sort?: SortInfo;
    /** 过滤条件，可选 */
    filters?: Record<string, any>;
  }) => Promise<{
    /** 数据数组 */
    data: T[];
    /** 数据总条数 */
    total: number;
  }>;
  /** 初始过滤条件，默认为空对象 */
  defaultFilters?: Record<string, any>;
  /** 是否自动加载初始数据，默认为true */
  autoLoad?: boolean;
}

/**
 * 表格数据管理的自定义Hook
 * 提供完整的表格数据管理功能，简化表格组件的开发
 *
 * @template T 表格数据项的类型，需扩展TableDataItem接口
 * @param options 表格配置选项
 * @returns 表格相关的状态和方法对象
 * 
 * @example
 * ```typescript
 * // 基本使用示例
 * const { tableData, loading, pagination, handlePageChange, handleSortChange } = useTable<User>({
 *   fetchData: async (params) => {
 *     // 调用API获取数据
 *     const response = await api.getUsers(params);
 *     return {
 *       data: response.list,
 *       total: response.total
 *     };
}

/**
 * @example
 * // 完整的Vue组件使用示例
 * 
 * // 1. 首先定义用户数据类型
 * interface User extends TableDataItem {
 *   id: number;
 *   name: string;
 *   email: string;
 *   role: 'admin' | 'user' | 'guest';
 *   status: 'active' | 'inactive' | 'pending';
 *   createdAt: string;
 * }
 * 
 * // 2. 创建一个API服务模块
 * const userApi = {
 *   getUsers: async (params: {
 *     page: number;
 *     pageSize: number;
 *     sort?: SortInfo;
 *     filters?: Record<string, any>;
 *   }) => {
 *     // 模拟API请求
 *     const response = await fetch('/api/users', {
 *       method: 'GET',
 *       headers: {
 *         'Content-Type': 'application/json',
 *       },
 *     });
 *     return response.json();
 *   }
 * };
 * 
 * // 3. 在Vue组件中使用useTable hook
 * // UserList.vue
 * // <template>
 * //   <div class="user-list-container">
 * //     <div class="search-bar">
 * //       <input
 * //         v-model="searchKeyword"
 * //         type="text"
 * //         placeholder="搜索用户名..."
 * //         @input="handleSearch"
 * //       />
 * //       <select v-model="statusFilter" @change="handleStatusFilter">
 * //         <option value="">全部状态</option>
 * //         <option value="active">活跃</option>
 * //         <option value="inactive">非活跃</option>
 * //         <option value="pending">待审核</option>
 * //       </select>
 * //       <button @click="handleReset">重置</button>
 * //       <button @click="handleRefresh">刷新</button>
 * //     </div>
 * // 
 * //     <div class="table-wrapper">
 * //       <table v-if="!loading">
 * //         <thead>
 * //           <tr>
 * //             <th @click="handleSort('id')">
 * //               ID {{ sortInfo.columnKey === 'id' ? (sortInfo.order === 'asc' ? '↑' : '↓') : '' }}
 * //             </th>
 * //             <th @click="handleSort('name')">
 * //               姓名 {{ sortInfo.columnKey === 'name' ? (sortInfo.order === 'asc' ? '↑' : '↓') : '' }}
 * //             </th>
 * //             <th>邮箱</th>
 * //             <th>角色</th>
 * //             <th>状态</th>
 * //             <th>创建时间</th>
 * //             <th>操作</th>
 * //           </tr>
 * //         </thead>
 * //         <tbody>
 * //           <tr v-for="user in tableData" :key="user.id">
 * //             <td>{{ user.id }}</td>
 * //             <td>{{ user.name }}</td>
 * //             <td>{{ user.email }}</td>
 * //             <td>{{ user.role }}</td>
 * //             <td>{{ user.status }}</td>
 * //             <td>{{ user.createdAt }}</td>
 * //             <td>
 * //               <button @click="editUser(user)">编辑</button>
 * //               <button @click="deleteUser(user.id)">删除</button>
 * //             </td>
 * //           </tr>
 * //         </tbody>
 * //       </table>
 * //       <div v-else class="loading">加载中...</div>
 * //       <div v-if="!loading && tableData.length === 0" class="empty">暂无数据</div>
 * //     </div>
 * // 
 * //     <div class="pagination">
 * //       <button 
 * //         :disabled="pagination.current === 1"
 * //         @click="handlePageChange(pagination.current - 1)"
 * //       >
 * //         上一页
 * //       </button>
 * //       <span>第 {{ pagination.current }} / {{ totalPages }} 页</span>
 * //       <button 
 * //         :disabled="pagination.current === totalPages"
 * //         @click="handlePageChange(pagination.current + 1)"
 * //       >
 * //         下一页
 * //       </button>
 * //       <select v-model="pagination.pageSize" @change="handlePageSizeChange(pagination.pageSize)">
 * //         <option :value="10">10条/页</option>
 * //         <option :value="20">20条/页</option>
 * //         <option :value="50">50条/页</option>
 * //       </select>
 * //     </div>
 * //   </div>
 * // </template>
 * 
 * // <script setup lang="ts">
 * // import { ref, watch } from 'vue';
 * // import { useTable, type TableDataItem, type SortInfo } from '@/hooks/useTable';
 * 
 * // // 定义用户类型
 * // interface User extends TableDataItem {
 * //   id: number;
 * //   name: string;
 * //   email: string;
 * //   role: 'admin' | 'user' | 'guest';
 * //   status: 'active' | 'inactive' | 'pending';
 * //   createdAt: string;
 * // }
 * 
 * // // 模拟API服务
 * // const userApi = {
 * //   getUsers: async (params) => {
 * //     // 实际项目中替换为真实的API调用
 * //     console.log('Fetching users with params:', params);
 * //     // 模拟数据
 * //     return {
 * //       data: Array.from({ length: params.pageSize }, (_, i) => ({
 * //         id: (params.page - 1) * params.pageSize + i + 1,
 * //         name: `User ${(params.page - 1) * params.pageSize + i + 1}`,
 * //         email: `user${(params.page - 1) * params.pageSize + i + 1}@example.com`,
 * //         role: ['admin', 'user', 'guest'][Math.floor(Math.random() * 3)] as 'admin' | 'user' | 'guest',
 * //         status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'pending',
 * //         createdAt: new Date().toISOString()
 * //       })),
 * //       total: 100
 * //     };
 * //   }
 * // };
 * 
 * // // 搜索和过滤状态
 * // const searchKeyword = ref('');
 * // const statusFilter = ref('');
 * 
 * // // 使用useTable hook
 * // const {
 * //   tableData,
 * //   loading,
 * //   pagination,
 * //   sortInfo,
 * //   totalPages,
 * //   loadData,
 * //   handlePageChange,
 * //   handlePageSizeChange,
 * //   handleSortChange,
 * //   handleFilterChange,
 * //   resetFilters,
 * //   refresh
 * // } = useTable<User>({
 * //   // 自定义初始分页
 * //   defaultCurrent: 1,
 * //   defaultPageSize: 10,
 * //   // 数据加载函数
 * //   fetchData: async (params) => {
 * //     try {
 * //       const response = await userApi.getUsers(params);
 * //       return {
 * //         data: response.data,
 * //         total: response.total
 * //       };
 * //     } catch (error) {
 * //       console.error('Failed to fetch users:', error);
 * //       return {
 * //         data: [],
 * //         total: 0
 * //       };
 * //     }
 * //   },
 * //   // 初始过滤条件
 * //   defaultFilters: {
 * //     status: statusFilter.value
 * //   },
 * //   // 自动加载数据
 * //   autoLoad: true
 * // });
 * 
 * // // 处理排序
 * // const handleSort = (column: string) => {
 * //   let order: 'asc' | 'desc' | '' = '';
 * //   if (sortInfo.columnKey === column) {
 * //     // 如果点击相同列，则切换排序方向
 * //     if (sortInfo.order === 'asc') {
 * //       order = 'desc';
 * //     } else if (sortInfo.order === 'desc') {
 * //       order = '';
 * //     } else {
 * //       order = 'asc';
 * //     }
 * //   } else {
 * //     // 如果点击不同列，则默认为升序
 * //     order = 'asc';
 * //   }
 * //   handleSortChange({ columnKey: column, order });
 * // };
 * 
 * // // 处理搜索
 * // const handleSearch = () => {
 * //   handleFilterChange({
 * //     keyword: searchKeyword.value
 * //   });
 * // };
 * 
 * // // 处理状态过滤
 * // const handleStatusFilter = () => {
 * //   handleFilterChange({
 * //     status: statusFilter.value || undefined
 * //   });
 * // };
 * 
 * // // 处理重置
 * // const handleReset = () => {
 * //   searchKeyword.value = '';
 * //   statusFilter.value = '';
 * //   resetFilters();
 * // };
 * 
 * // // 处理刷新
 * // const handleRefresh = () => {
 * //   refresh();
 * // };
 * 
 * // // 编辑用户
 * // const editUser = (user: User) => {
 * //   console.log('Edit user:', user);
 * //   // 这里可以实现编辑逻辑
 * // };
 * 
 * // // 删除用户
 * // const deleteUser = async (id: number) => {
 * //   console.log('Delete user:', id);
 * //   // 这里可以实现删除逻辑
 * //   // 删除成功后刷新表格
 * //   refresh();
 * // };
 * // </script>
 * 
 * // <style scoped>
 * // .user-list-container {
 * //   padding: 20px;
 * // }
 * // 
 * // .search-bar {
 * //   margin-bottom: 20px;
 * // }
 * // 
 * // .search-bar input,
 * // .search-bar select,
 * // .search-bar button {
 * //   margin-right: 10px;
 * //   padding: 8px;
 * // }
 * // 
 * // .table-wrapper {
 * //   margin-bottom: 20px;
 * // }
 * // 
 * // table {
 * //   width: 100%;
 * //   border-collapse: collapse;
 * // }
 * // 
 * // th, td {
 * //   border: 1px solid #ddd;
 * //   padding: 8px;
 * //   text-align: left;
 * // }
 * // 
 * // th {
 * //   background-color: #f5f5f5;
 * //   cursor: pointer;
 * // }
 * // 
 * // .loading,
 * // .empty {
 * //   text-align: center;
 * //   padding: 20px;
 * //   color: #666;
 * // }
 * // 
 * // .pagination {
 * //   display: flex;
 * //   justify-content: center;
 * //   align-items: center;
 * //   gap: 10px;
 * // }
 * // 
 * // .pagination button {
 * //   padding: 5px 10px;
 * // }
 * // 
 * // .pagination button:disabled {
 * //   opacity: 0.5;
 * //   cursor: not-allowed;
 * // }
 * // </style>
 *   }
 * });
 */
export function useTable<T extends TableDataItem>(options: TableOptions<T>) {
  const { defaultCurrent = 1, defaultPageSize = 10, fetchData, defaultFilters = {}, autoLoad = true } = options;

  // 表格数据
  const tableData = ref<T[]>([]);
  // 加载状态
  const loading = ref(false);
  // 分页信息
  const pagination = reactive<Pagination>({
    current: defaultCurrent,
    pageSize: defaultPageSize,
    total: 0,
  });
  // 排序信息
  const sortInfo = reactive<SortInfo>({
    columnKey: "",
    order: "",
  });
  // 过滤条件
  const filters = reactive<Record<string, any>>(defaultFilters);

  // 计算总页数
  const totalPages = computed(() => {
    return Math.ceil(pagination.total / pagination.pageSize);
  });

  /**
   * 加载表格数据的核心方法
   * @param resetPagination 是否重置分页到第一页，默认为false
   * @returns Promise<void>
   *
   * @description
   * 该方法会调用配置的fetchData函数获取数据，并根据参数决定是否重置分页。
   * 调用期间会设置loading状态为true，完成后(无论成功失败)设置为false。
   * 成功时会更新表格数据和总数，失败时会在控制台输出错误信息。
   */
  const loadData = async (resetPagination = false) => {
    try {
      // 重置分页
      if (resetPagination) {
        pagination.current = 1;
      }

      loading.value = true;

      // 调用数据获取函数
      const result = await fetchData({
        page: pagination.current,
        pageSize: pagination.pageSize,
        sort: Object.keys(sortInfo).length > 0 ? sortInfo : undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });

      // 更新数据和总数
      tableData.value = result.data;
      pagination.total = result.total;
    } catch (error) {
      console.error("Failed to load table data:", error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 处理页码变化
   * @param current 当前页码
   *
   * @description
   * 更新当前页码并重新加载数据
   * 通常与分页组件的page-change事件绑定
   */
  const handlePageChange = (current: number) => {
    pagination.current = current;
    loadData();
  };

  /**
   * 处理每页条数变化
   * @param pageSize 每页条数
   *
   * @description
   * 更新每页显示的条数，重置页码为1，并重新加载数据
   * 通常与分页组件的pageSize-change事件绑定
   */
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    loadData();
  };

  /**
   * 处理排序变化
   * @param newSortInfo 新的排序信息
   *
   * @description
   * 更新排序信息并重新加载数据，同时重置页码为1
   * 通常与表格组件的sort-change事件绑定
   */
  const handleSortChange = (newSortInfo: SortInfo) => {
    sortInfo.columnKey = newSortInfo.columnKey;
    sortInfo.order = newSortInfo.order;
    loadData(true);
  };

  /**
   * 处理过滤条件变化
   * @param newFilters 新的过滤条件对象
   *
   * @description
   * 合并新的过滤条件到现有条件中，并重新加载数据，同时重置页码为1
   * 通常用于处理搜索、筛选等功能
   */
  const handleFilterChange = (newFilters: Record<string, any>) => {
    Object.assign(filters, newFilters);
    loadData(true);
  };

  /**
   * 重置过滤条件
   *
   * @description
   * 清空当前所有过滤条件，恢复到初始的defaultFilters状态
   * 重置后会重新加载数据，并将页码重置为1
   * 通常与重置按钮绑定
   */
  const resetFilters = () => {
    Object.keys(filters).forEach(key => {
      delete filters[key];
    });
    Object.assign(filters, defaultFilters);
    loadData(true);
  };

  /**
   * 刷新表格数据
   *
   * @description
   * 在保持当前分页、排序和过滤条件的情况下重新加载数据
   * 通常与刷新按钮绑定
   */
  const refresh = () => {
    loadData();
  };

  // 自动加载初始数据
  if (autoLoad) {
    loadData();
  }

  return {
    /**
     * 表格数据数组
     * 类型: Ref<T[]>
     * 包含当前页的表格数据
     */
    tableData,

    /**
     * 加载状态
     * 类型: Ref<boolean>
     * 数据加载过程中为true，可用于显示加载动画
     */
    loading,

    /**
     * 分页信息
     * 类型: Pagination
     * 包含当前页码、每页条数和总数
     */
    pagination,

    /**
     * 排序信息
     * 类型: SortInfo
     * 包含当前排序的列和方向
     */
    sortInfo,

    /**
     * 过滤条件
     * 类型: Record<string, any>
     * 当前应用的过滤条件
     */
    filters,

    /**
     * 总页数
     * 类型: ComputedRef<number>
     * 根据总数和每页条数计算得出的总页数
     */
    totalPages,

    /**
     * 加载数据方法
     * 见loadData方法说明
     */
    loadData,

    /**
     * 处理页码变化方法
     * 见handlePageChange方法说明
     */
    handlePageChange,

    /**
     * 处理每页条数变化方法
     * 见handlePageSizeChange方法说明
     */
    handlePageSizeChange,

    /**
     * 处理排序变化方法
     * 见handleSortChange方法说明
     */
    handleSortChange,

    /**
     * 处理过滤条件变化方法
     * 见handleFilterChange方法说明
     */
    handleFilterChange,

    /**
     * 重置过滤条件方法
     * 见resetFilters方法说明
     */
    resetFilters,

    /**
     * 刷新表格数据方法
     * 见refresh方法说明
     */
    refresh,
  };
}
