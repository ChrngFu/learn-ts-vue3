<template>
  <div class="game-2048-container">
    <div class="game-header">
      <h1 class="game-title">2048</h1>
      <div class="game-info">
        <div class="score-container">
          <div class="score-label">得分</div>
          <div class="score-value">{{ score }}</div>
        </div>
        <div class="best-container">
          <div class="score-label">最高分</div>
          <div class="score-value">{{ bestScore }}</div>
        </div>
        <button class="restart-button" @click="restartGame">重新开始</button>
      </div>
    </div>
    
    <div class="game-grid-container">
      <div class="game-grid">
        <div
          v-for="(cell, index) in flattenedGrid"
          :key="index"
          class="game-cell"
          :class="{
            [`tile-${cell.value}`]: cell.value > 0,
            'tile-new': cell.isNew,
            'tile-merged': cell.merged
          }"
        >
          {{ cell.value || '' }}
        </div>
      </div>
    </div>
    
    <div class="game-controls">
      <div class="game-instructions">
        <p>使用方向键或滑动来移动方块</p>
        <p>相同数字的方块合并后会相加</p>
        <p>尝试得到2048分!</p>
      </div>
      
      <div v-if="gameOver" class="game-over-overlay">
        <div class="game-over-message">
          <h2>{{ hasWon ? '恭喜你赢了!' : '游戏结束' }}</h2>
          <button class="restart-button" @click="restartGame">再玩一次</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useThemeManager } from '../hooks/useThemeManager';

// 游戏状态
const gridSize = 4;
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const hasWon = ref(false);

interface Cell {
  value: number;
  isNew: boolean;
  merged: boolean;
}

// 初始化4x4网格
const initGrid = (): Cell[][] => {
  const grid: Cell[][] = [];
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = { value: 0, isNew: false, merged: false };
    }
  }
  return grid;
};

const grid = ref<Cell[][]>(initGrid());

// 计算属性：扁平化网格用于渲染
const flattenedGrid = computed(() => {
  const result: Cell[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      result.push(grid.value[y][x]);
    }
  }
  return result;
});

// 生成新数字（2或4）
const generateNewNumber = () => {
  const emptyCells: { x: number; y: number }[] = [];
  
  // 找出所有空单元格
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid.value[y][x].value === 0) {
        emptyCells.push({ x, y });
      }
    }
  }
  
  if (emptyCells.length === 0) return false;
  
  // 随机选择一个空单元格
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  
  // 90%概率生成2，10%概率生成4
  grid.value[randomCell.y][randomCell.x].value = Math.random() < 0.9 ? 2 : 4;
  grid.value[randomCell.y][randomCell.x].isNew = true;
  
  // 100ms后移除新方块的动画标记
  setTimeout(() => {
    grid.value[randomCell.y][randomCell.x].isNew = false;
  }, 100);
  
  return true;
};

// 清除所有合并标记
const clearFlags = () => {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      grid.value[y][x].merged = false;
      grid.value[y][x].isNew = false;
    }
  }
};

// 检查游戏是否结束
const checkGameOver = () => {
  // 检查是否有空单元格
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid.value[y][x].value === 0) {
        return false; // 还有空单元格，游戏继续
      }
    }
  }
  
  // 检查是否有可以合并的相邻单元格
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize - 1; x++) {
      if (grid.value[y][x].value === grid.value[y][x + 1].value) {
        return false; // 水平方向有可合并的单元格
      }
    }
  }
  
  for (let y = 0; y < gridSize - 1; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid.value[y][x].value === grid.value[y + 1][x].value) {
        return false; // 垂直方向有可合并的单元格
      }
    }
  }
  
  return true; // 游戏结束
};

// 检查是否获胜
const checkWin = () => {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid.value[y][x].value >= 2048) {
        return true;
      }
    }
  }
  return false;
};

// 更新分数
const updateScore = (points: number) => {
  score.value += points;
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    localStorage.setItem('2048-best-score', bestScore.value.toString());
  }
};

// 移动逻辑
const moveLeft = (): boolean => {
  let moved = false;
  clearFlags();
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = 1; x < gridSize; x++) {
      if (grid.value[y][x].value !== 0) {
        let currentX = x;
        
        // 向左移动直到遇到非空单元格或边缘
        while (currentX > 0 && grid.value[y][currentX - 1].value === 0) {
          grid.value[y][currentX - 1].value = grid.value[y][currentX].value;
          grid.value[y][currentX].value = 0;
          currentX--;
          moved = true;
        }
        
        // 检查是否可以合并
        if (currentX > 0 && 
            grid.value[y][currentX - 1].value === grid.value[y][currentX].value && 
            !grid.value[y][currentX - 1].merged) {
          // 合并单元格
          grid.value[y][currentX - 1].value *= 2;
          grid.value[y][currentX - 1].merged = true;
          grid.value[y][currentX].value = 0;
          
          // 更新分数
          updateScore(grid.value[y][currentX - 1].value);
          
          moved = true;
        }
      }
    }
  }
  
  return moved;
};

const moveRight = (): boolean => {
  let moved = false;
  clearFlags();
  
  for (let y = 0; y < gridSize; y++) {
    for (let x = gridSize - 2; x >= 0; x--) {
      if (grid.value[y][x].value !== 0) {
        let currentX = x;
        
        // 向右移动直到遇到非空单元格或边缘
        while (currentX < gridSize - 1 && grid.value[y][currentX + 1].value === 0) {
          grid.value[y][currentX + 1].value = grid.value[y][currentX].value;
          grid.value[y][currentX].value = 0;
          currentX++;
          moved = true;
        }
        
        // 检查是否可以合并
        if (currentX < gridSize - 1 && 
            grid.value[y][currentX + 1].value === grid.value[y][currentX].value && 
            !grid.value[y][currentX + 1].merged) {
          // 合并单元格
          grid.value[y][currentX + 1].value *= 2;
          grid.value[y][currentX + 1].merged = true;
          grid.value[y][currentX].value = 0;
          
          // 更新分数
          updateScore(grid.value[y][currentX + 1].value);
          
          moved = true;
        }
      }
    }
  }
  
  return moved;
};

const moveUp = (): boolean => {
  let moved = false;
  clearFlags();
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 1; y < gridSize; y++) {
      if (grid.value[y][x].value !== 0) {
        let currentY = y;
        
        // 向上移动直到遇到非空单元格或边缘
        while (currentY > 0 && grid.value[currentY - 1][x].value === 0) {
          grid.value[currentY - 1][x].value = grid.value[currentY][x].value;
          grid.value[currentY][x].value = 0;
          currentY--;
          moved = true;
        }
        
        // 检查是否可以合并
        if (currentY > 0 && 
            grid.value[currentY - 1][x].value === grid.value[currentY][x].value && 
            !grid.value[currentY - 1][x].merged) {
          // 合并单元格
          grid.value[currentY - 1][x].value *= 2;
          grid.value[currentY - 1][x].merged = true;
          grid.value[currentY][x].value = 0;
          
          // 更新分数
          updateScore(grid.value[currentY - 1][x].value);
          
          moved = true;
        }
      }
    }
  }
  
  return moved;
};

const moveDown = (): boolean => {
  let moved = false;
  clearFlags();
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = gridSize - 2; y >= 0; y--) {
      if (grid.value[y][x].value !== 0) {
        let currentY = y;
        
        // 向下移动直到遇到非空单元格或边缘
        while (currentY < gridSize - 1 && grid.value[currentY + 1][x].value === 0) {
          grid.value[currentY + 1][x].value = grid.value[currentY][x].value;
          grid.value[currentY][x].value = 0;
          currentY++;
          moved = true;
        }
        
        // 检查是否可以合并
        if (currentY < gridSize - 1 && 
            grid.value[currentY + 1][x].value === grid.value[currentY][x].value && 
            !grid.value[currentY + 1][x].merged) {
          // 合并单元格
          grid.value[currentY + 1][x].value *= 2;
          grid.value[currentY + 1][x].merged = true;
          grid.value[currentY][x].value = 0;
          
          // 更新分数
          updateScore(grid.value[currentY + 1][x].value);
          
          moved = true;
        }
      }
    }
  }
  
  return moved;
};

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (gameOver.value) return;
  
  let moved = false;
  
  switch (event.key) {
    case 'ArrowLeft':
      moved = moveLeft();
      break;
    case 'ArrowRight':
      moved = moveRight();
      break;
    case 'ArrowUp':
      moved = moveUp();
      break;
    case 'ArrowDown':
      moved = moveDown();
      break;
  }
  
  if (moved) {
    // 移动后生成新数字
    setTimeout(() => {
      generateNewNumber();
      
      // 检查是否获胜
      if (checkWin()) {
        hasWon.value = true;
        gameOver.value = true;
      }
      
      // 检查游戏是否结束
      if (checkGameOver()) {
        gameOver.value = true;
      }
    }, 100);
  }
};

// 触摸滑动支持
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (gameOver.value) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // 确定滑动方向（以绝对值较大的方向为准）
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // 水平滑动
    if (diffX > 50) {
      moveRight();
    } else if (diffX < -50) {
      moveLeft();
    } else {
      return; // 滑动距离太小，忽略
    }
  } else {
    // 垂直滑动
    if (diffY > 50) {
      moveDown();
    } else if (diffY < -50) {
      moveUp();
    } else {
      return; // 滑动距离太小，忽略
    }
  }
  
  // 移动后生成新数字
  setTimeout(() => {
    generateNewNumber();
    
    // 检查是否获胜
    if (checkWin()) {
      hasWon.value = true;
      gameOver.value = true;
    }
    
    // 检查游戏是否结束
    if (checkGameOver()) {
      gameOver.value = true;
    }
  }, 100);
};

// 重新开始游戏
const restartGame = () => {
  grid.value = initGrid();
  score.value = 0;
  gameOver.value = false;
  hasWon.value = false;
  
  // 初始生成两个数字
  generateNewNumber();
  generateNewNumber();
};

// 从localStorage加载最高分
const loadBestScore = () => {
  const savedBestScore = localStorage.getItem('2048-best-score');
  if (savedBestScore) {
    bestScore.value = parseInt(savedBestScore);
  }
};

// 主题相关
const { isDarkMode } = useThemeManager();

// 组件挂载时初始化游戏
onMounted(() => {
  loadBestScore();
  restartGame();
  
  // 添加键盘事件监听
  window.addEventListener('keydown', handleKeydown);
  
  // 添加触摸事件监听
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
});

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchend', handleTouchEnd);
});
</script>

<style scoped lang="scss">
.game-2048-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.game-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0;
  color: #776e65;
}

.game-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.score-container,
.best-container {
  background-color: #bbada0;
  padding: 10px 20px;
  border-radius: 5px;
  text-align: center;
  min-width: 80px;
}

.score-label {
  color: #eee4da;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: bold;
}

.score-value {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.restart-button {
  background-color: #8f7a66;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.restart-button:hover {
  background-color: #9f8b77;
}

.game-grid-container {
  background-color: #bbada0;
  border-radius: 6px;
  padding: 15px;
  position: relative;
}

.game-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 15px;
  width: 100%;
  aspect-ratio: 1;
}

.game-cell {
  background-color: #cdc1b4;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: #776e65;
  transition: all 0.2s;
}

// 不同数字的样式
.tile-2 {
  background-color: #eee4da;
  color: #776e65;
}

.tile-4 {
  background-color: #ede0c8;
  color: #776e65;
}

.tile-8 {
  background-color: #f2b179;
  color: #f9f6f2;
}

.tile-16 {
  background-color: #f59563;
  color: #f9f6f2;
}

.tile-32 {
  background-color: #f67c5f;
  color: #f9f6f2;
}

.tile-64 {
  background-color: #f65e3b;
  color: #f9f6f2;
}

.tile-128 {
  background-color: #edcf72;
  color: #f9f6f2;
  font-size: 28px;
}

.tile-256 {
  background-color: #edcc61;
  color: #f9f6f2;
  font-size: 28px;
}

.tile-512 {
  background-color: #edc850;
  color: #f9f6f2;
  font-size: 28px;
}

.tile-1024 {
  background-color: #edc53f;
  color: #f9f6f2;
  font-size: 24px;
}

.tile-2048 {
  background-color: #edc22e;
  color: #f9f6f2;
  font-size: 24px;
}

// 动画效果
.tile-new {
  animation: appear 0.2s ease-in-out;
}

.tile-merged {
  animation: merge 0.2s ease-in-out;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes merge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.game-controls {
  margin-top: 20px;
}

.game-instructions {
  background-color: #eee4da;
  padding: 15px;
  border-radius: 5px;
  color: #776e65;
}

.game-instructions p {
  margin: 5px 0;
  font-size: 14px;
}

.game-over-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.game-over-message {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.game-over-message h2 {
  color: #776e65;
  margin-bottom: 20px;
}

// 响应式设计
@media (max-width: 480px) {
  .game-2048-container {
    padding: 10px;
  }
  
  .game-title {
    font-size: 36px;
  }
  
  .game-cell {
    font-size: 24px;
  }
  
  .tile-128,
  .tile-256,
  .tile-512 {
    font-size: 20px;
  }
  
  .tile-1024,
  .tile-2048 {
    font-size: 18px;
  }
}

// 暗黑模式适配
:global(.dark-theme) .game-title {
  color: #eee4da;
}

:global(.dark-theme) .game-2048-container {
  color: #eee4da;
}

:global(.dark-theme) .score-container,
:global(.dark-theme) .best-container {
  background-color: #5d5045;
}

:global(.dark-theme) .restart-button {
  background-color: #7f6a56;
}

:global(.dark-theme) .restart-button:hover {
  background-color: #8f7b67;
}

:global(.dark-theme) .game-grid-container {
  background-color: #5d5045;
}

:global(.dark-theme) .game-cell {
  background-color: #7d7064;
  color: #eee4da;
}

:global(.dark-theme) .game-instructions {
  background-color: #7d7064;
  color: #eee4da;
}

:global(.dark-theme) .game-over-message {
  background-color: #333;
}

:global(.dark-theme) .game-over-message h2 {
  color: #eee4da;
}
</style>