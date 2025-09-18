const container = document.querySelector(".container");
const addCourseBtn = document.querySelector(".add-course-btn");
const deleteCourseBtn = document.querySelector(".delete-course-btn");
const cancelBtn = document.querySelector(".cancel-btn");
const coursesMask = document.querySelector(".delete-mask");
const coursesArea = document.querySelector(".courses");

// 顏色選擇器元素
const TimeDayBgColor = document.querySelector("#TimeDayBgColor");
const ABBgColor = document.querySelector("#ABBgColor");
const TimeBgColor = document.querySelector("#TimeBgColor");
const Time2BgColor = document.querySelector("#Time2BgColor");
const tableBgColor = document.querySelector("#tableBgColor");
const resetColorBtn = document.querySelector("#resetColorBtn");

const courseDialog = document.getElementById("courseDialog");
const closeModal = document.getElementById("closeModal");
const courseForm = document.getElementById("courseForm");

const coursesSection = document.querySelector(".courses-scroll");
const courseList = [];
for (let i = 0; i < coursesSection.children.length; i++) {
  const courseName = coursesSection.children[i].innerHTML
    .split("<br>")[0]
    .trim();
  courseList.push(courseName);
}

const noTimeCourse = document.querySelector(".no-time");
const noTimeCourseList = [];
for (let i = 1; i < noTimeCourse.children.length; i++) {
  const courseName = noTimeCourse.children[i].innerHTML.split("<br>")[0].trim();
  noTimeCourseList.push(courseName);
}

let course;
let courseName;
// 托拽開始的元素
container.ondragstart = (e) => {
  e.dataTransfer.effectAllowed = e.target.dataset.effect; // 設置拖拽的效果
  course = e.target; // 獲取拖拽的元素
  courseName = course.innerHTML.split("<br>")[0].trim();

  if (course.dataset.effect === "move") {
    coursesMask.classList.remove("hide");
  }

  // 自訂拖曳影像 (預設「拖曳預覽圖像」不會保留 CSS 樣式（如 border-radius、陰影、透明度等）)
  const dragGhost = course.cloneNode(true);
  dragGhost.style.position = "absolute";
  dragGhost.classList.add("drag-ghost");
  dragGhost.style.top = "-9999px"; // 放到畫面外
  dragGhost.style.borderRadius = "0.5rem"; // 圓角
  course.parentNode.appendChild(dragGhost);

  const rect = dragGhost.getBoundingClientRect();
  const offsetX = rect.width / 2;
  const offsetY = rect.height / 2;
  e.dataTransfer.setDragImage(dragGhost, offsetX, offsetY); // 設定為拖曳圖像（可調整偏移量）

  // 拖曳結束後
  container.ondragend = () => {
    coursesMask.classList.add("hide");
    clearDropOver();
    dragGhost.remove();

    setTimeout(() => {
      setCoursesScrollHeight();
    }, 0); // 延遲0毫秒，確保 DOM 更新完成
  };
};

// 托拽懸停的元素(頻繁觸發)
container.ondragover = (e) => {
  e.preventDefault(); // 阻止默認行為，否則無法觸發 ondrop 事件
};

// 清除類樣式
function clearDropOver() {
  container
    .querySelectorAll(".drop-over-copy, .drop-over-move")
    .forEach((e) => {
      e.classList.remove("drop-over-copy", "drop-over-move");
    });
}

// 找尋節點(先確認 node 是否為一個有效的 DOM 節點，再去存取 dataset)
function getDropNode(node) {
  while (node) {
    if (node.dataset && node.dataset.allow) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

// 拖拽進入的元素
container.ondragenter = (e) => {
  clearDropOver();
  const node = getDropNode(e.target);
  if (!node) return;
  if (course.dataset.effect === node.dataset.allow) {
    if (node.dataset.allow === "copy") {
      node.classList.add("drop-over-copy");
    } else if (node.dataset.allow === "move") {
      node.classList.add("drop-over-move");
    }
  }
};

// 拖拽結束的所在元素
container.ondrop = (e) => {
  coursesMask.classList.add("hide");
  clearDropOver();
  const node = getDropNode(e.target);
  if (!node) return;
  if (course.dataset.effect !== node.dataset.allow) return;
  if (node.dataset.allow === "copy" && node.classList.contains("no-time")) {
    if (noTimeCourseList.includes(courseName)) {
      return;
    }
    node.innerHTML += `<div data-effect="move" draggable="true" class="course">${courseName}</div>`;
    noTimeCourseList.push(courseName);
  } else if (
    node.dataset.allow === "copy" &&
    !node.classList.contains("no-time")
  ) {
    node.innerHTML = "";
    const clone = course.cloneNode(true);
    clone.dataset.effect = "move";
    node.appendChild(clone);
  } else {
    if (noTimeCourseList.includes(courseName)) {
      noTimeCourseList.splice(noTimeCourseList.indexOf(courseName), 1);
    }
    course.remove();
    container.querySelectorAll(".drag-ghost").forEach((ghost) => {
      ghost.remove();
    });
  }
  setTimeout(() => {
    setCoursesScrollHeight();
  }, 0); // 延遲0毫秒，確保 DOM 更新完成
};

// 表單送出：新增課程卡片
courseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("courseName").value;
  const classroom = document.getElementById("classroom").value;

  if (courseList.includes(name)) {
    alert("此課程已存在");
    return;
  }

  const courseEl = document.createElement("div");
  courseEl.className = "course";
  courseEl.setAttribute("data-effect", "copy");
  courseEl.setAttribute("draggable", "true");
  if (classroom !== "") {
    courseEl.innerHTML = `${name}<br /><span class="classroom">${classroom}</span>`;
  } else {
    courseEl.innerHTML = `${name}`;
  }

  coursesSection.appendChild(courseEl);
  courseList.push(name);

  // 清空與關閉表單
  courseForm.reset();
  courseDialog.close();
});

// 刪除課程卡片事件
function handleCourseClickToDelete(course) {
  course.currentTarget.remove();
  const courseName = course.currentTarget.innerHTML.split("<br>")[0].trim();
  courseList.splice(courseList.indexOf(courseName), 1);
}

// 刪除課程卡片
deleteCourseBtn.addEventListener("click", () => {
  addCourseBtn.classList.add("hide");
  deleteCourseBtn.classList.add("hide");
  cancelBtn.classList.remove("hide");
  coursesSection.querySelectorAll(".course").forEach((course, index) => {
    course.draggable = false;
    if (index % 2 === 0) {
      course.style.animation = "shaking 0.5s linear infinite forwards";
    } else {
      course.style.animation = "shaking 0.5s linear infinite forwards reverse";
    }
    course.addEventListener("click", handleCourseClickToDelete);
  });
});

// 取消刪除課程卡片
cancelBtn.addEventListener("click", () => {
  addCourseBtn.classList.remove("hide");
  deleteCourseBtn.classList.remove("hide");
  cancelBtn.classList.add("hide");
  coursesSection.querySelectorAll(".course").forEach((course) => {
    course.draggable = true;
    course.style.animation = "none";
    course.removeEventListener("click", handleCourseClickToDelete);
  });
  if (coursesSection.children.length === 0) {
    coursesSection.innerHTML = `<div data-effect="copy" draggable="true" class="course">
            嘗試新增課程<br /><span class="classroom">托拽可自訂課表</span>
          </div>`;
    courseList.push("嘗試新增課程");
  }
});

// 顏色選擇器
document.querySelectorAll(".color-controls input").forEach((input) => {
  input.addEventListener("input", (e) => {
    // 取得 input 的 id 變更，例如: TimeDayBgColor -> TimeDay-bgc
    const id = input.id;
    if (id.endsWith("BgColor")) {
      const propertyName = id.replace("BgColor", "-bgc");
      // 變更對應 property 的元素
      document.documentElement.style.setProperty(
        `--${propertyName}`,
        e.target.value
      );
    }
  });
});

// 重置顏色
resetColorBtn.addEventListener("click", () => {
  // 預設值
  const defaultColors = {
    TimeDayBgc: "#ae2300",
    TimeBgc: "#cccc99",
    Time2Bgc: "#ffcc66",
    ABBgc: "#c6d3de",
    tableBgc: "#e4e4e4",
  };

  // 重置顏色
  document.querySelectorAll(".color-controls input").forEach((input) => {
    // 取得 input 的 id 變更，例如: TimeDayBgColor -> TimeDay-bgc
    const id = input.id;
    if (id.endsWith("BgColor")) {
      const propertyName = id.replace("BgColor", "-bgc");
      // 變更對應 property 的元素
      document.documentElement.style.setProperty(
        `--${propertyName}`,
        defaultColors[id.replace("BgColor", "Bgc")]
      );
      // 同時更新 input 的值
      input.value = defaultColors[id.replace("BgColor", "Bgc")];
    }
  });
});

// 下載課表圖片
document
  .getElementById("download-schedule-btn")
  .addEventListener("click", () => {
    const schedule = document.querySelector(".schedule");

    html2canvas(schedule).then((canvas) => {
      const link = document.createElement("a");
      link.download = "我的課表.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });

// 動態調整 courses-scroll 高度以匹配 schedule 高度
function setCoursesScrollHeight() {
  const schedule = document.querySelector(".schedule");
  coursesArea.classList.add("hide");

  if (schedule) {
    // 獲取 schedule 的實際高度
    const scheduleHeight = schedule.offsetHeight;

    // 設置 courses-scroll 的最大高度
    coursesArea.style.setProperty("--coursesHeight", `${scheduleHeight}px`);
    coursesArea.classList.remove("hide");
  }
}

// 頁面載入時執行
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    setCoursesScrollHeight();
  }, 0); // 延遲0毫秒，確保 DOM 更新完成
});

// 窗口大小改變時重新計算
window.addEventListener("resize", function () {
  setTimeout(() => {
    setCoursesScrollHeight();
  }, 0); // 延遲0毫秒，確保 DOM 更新完成
});
