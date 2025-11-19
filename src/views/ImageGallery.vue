<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { DialogPlugin } from "tdesign-vue-next";
  import imageDbManager, { type ImageItem } from "@/utils/imageDbManager";

  // 响应式数据
  const imgList = ref<Array<ImageItem & { url: string }>>([]);
  const visible = ref(false);
  const currentPreview = ref<{ url: string; name: string } | null>(null);
  const loading = ref(false);
  const uploadProgress = ref(0);
  const errorMessage = ref("");

  const uploadInput = ref<HTMLInputElement>(null);
  // 处理文件上传
  const handleUploadImage = () => {
    uploadInput.value?.click();
  };
  const handleChangeUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const res = await imageDbManager.addImage(file);
      if (res) {
        // 刷新图片列表
        await loadImages();
      }
    }
  };

  // 加载所有图片
  const loadImages = async () => {
    loading.value = true;
    try {
      const images = await imageDbManager.getAllImages();
      // 转换为包含url的格式
      imgList.value = images.map(img => ({
        ...img,
        url: imageDbManager.arrayBufferToDataUrl(img.data, img.type),
      }));
    } catch (error) {
      console.error("加载图片失败:", error);
      errorMessage.value = "加载图片失败";
    } finally {
      loading.value = false;
    }
  };

  // 处理图片预览
  const handlePreview = (item: ImageItem & { url: string }) => {
    currentPreview.value = {
      url: item.url,
      name: item.name,
    };
    visible.value = true;
  };

  // 处理图片删除
  const handleDelete = async (item: ImageItem) => {
    const confirmDialog = DialogPlugin.confirm({
      header: "确认删除",
      body: `确定要删除图片"${item.name}"吗？`,
      confirmBtn: "确认",
      cancelBtn: "取消",
      onConfirm: async () => {
        loading.value = true;
        try {
          await imageDbManager.deleteImage(item.id);
          // 重新加载图片列表
          await loadImages();
        } catch (error) {
          console.error("删除图片失败:", error);
          errorMessage.value = "删除图片失败";
        } finally {
          loading.value = false;
          confirmDialog.destroy();
        }
      },
      onClose: () => {
        confirmDialog.destroy();
      },
    });
  };

  const handleClosePreview = () => {
    visible.value = false;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // 格式化时间
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 组件挂载时加载图片
  onMounted(() => {
    loadImages();
  });
</script>

<template>
  <div class="image-gallery">
    <h1 class="page-title">图片管理</h1>

    <!-- 错误提示 -->
    <t-message v-if="errorMessage" theme="error" :closable="true">{{ errorMessage }}</t-message>

    <!-- 上传区域 -->
    <div class="upload-section">
      <input ref="uploadInput" type="file" accept="image/*" hidden @change="handleChangeUpload" />
      <t-button theme="primary" @click="handleUploadImage">上传图片</t-button>
    </div>

    <!-- 图片列表 -->
    <div class="image-list">
      <div v-if="loading && imgList.length === 0" class="loading-container">
        <t-loading text="加载中..." />
      </div>
      <div v-else-if="imgList.length > 0" class="image-grid">
        <t-card v-for="item in imgList" :key="item.id" class="image-card">
          <div class="image-wrapper">
            <t-image :src="item.url" alt="图片" @click="handlePreview(item)" class="gallery-image" />
          </div>
          <div class="image-info">
            <p class="image-name">{{ item.name }}</p>
            <div class="image-meta">
              <span class="image-size">{{ formatFileSize(item.size) }}</span>
              <span class="image-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="image-actions">
              <t-button shape="circle" theme="primary" @click="handleDelete(item)" class="delete-btn">
                <template #icon><t-icon name="delete" /></template>
              </t-button>
            </div>
          </div>
        </t-card>
      </div>
      <t-empty v-else description="暂无图片，请上传">
        <template #extra>
          <t-button type="primary" @click="() => {}">上传第一张图片</t-button>
        </template>
      </t-empty>
    </div>

    <t-dialog
      v-model:visible="visible"
      header="图片预览"
      width="60%"
      :draggable="true"
      :on-confirm="handleClosePreview"
    >
      <t-space direction="vertical" style="width: 100%">
        <t-image
          v-if="currentPreview"
          :src="currentPreview.url"
          :alt="currentPreview.name"
          style="width: 100%"
          :preview-disabled="true"
        />
        <div v-if="currentPreview" class="preview-info">
          <p>{{ currentPreview.name }}</p>
        </div>
      </t-space>
    </t-dialog>
  </div>
</template>

<style scoped lang="scss">
  .image-gallery {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;

    .page-title {
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 24px;
      color: var(--text-primary);
    }

    .upload-section {
      margin-bottom: 32px;

      .upload-progress {
        margin-top: 16px;
        width: 300px;
        position: relative;

        .progress-text {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: var(--text-secondary);
          margin-left: 10px;
        }
      }
    }

    .image-list {
      .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
      }

      .image-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;

        .image-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          .image-wrapper {
            width: 100%;
            height: 200px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-gray-100);

            .gallery-image {
              max-width: 100%;
              max-height: 100%;
              cursor: pointer;
              transition: transform 0.3s ease;

              &:hover {
                transform: scale(1.05);
              }
            }
          }

          .image-info {
            padding: 16px;
            display: flex;
            flex-direction: column;
            flex: 1;

            .image-name {
              font-size: 16px;
              font-weight: 500;
              margin-bottom: 8px;
              color: var(--text-primary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .image-meta {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: var(--text-tertiary);
              margin-bottom: 12px;
            }

            .image-actions {
              display: flex;
              justify-content: flex-end;
              margin-top: auto;

              .delete-btn {
                background: rgba(235, 87, 87, 0.9);
                color: white;

                &:hover:not(:disabled) {
                  background: rgba(235, 87, 87, 1);
                  transform: scale(1.1);
                }
              }
            }
          }
        }
      }
    }

    .preview-info {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: var(--text-secondary);
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .image-gallery {
      padding: 16px;

      .page-title {
        font-size: 24px;
      }

      .image-list .image-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  }
</style>
