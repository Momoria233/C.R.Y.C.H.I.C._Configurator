let tasks = [];

function addTask() {
  const task = {
    type: "command",
    id: "Task" + (tasks.length + 1),
    start: false,
    nextTasks: [],
    command: [],
    timeout: [],
    keys: [],
    bodyPart: [],
    poseFile: [],
    sensetive: [],
    frames: [],
    ip: "",
    port: 0,
    extra: {}
  };
  tasks.push(task);
  renderTasks();
}

function updateTask(index, key, value) {
  if (key === "type") {
    tasks[index][key] = value.value;
    renderTask(index);
    return;
  }
  if (key === "id") {
    const oldId = tasks[index].id;
    const newId = value.value;
    for (let i = 0; i < tasks.length; i++) {
        for (let j = 0; j < tasks[i]["nextTasks"].length; j++) {
            if (tasks[i]["nextTasks"][j]["id"] == oldId) {
                tasks[i]["nextTasks"][j]["id"] = newId;
            }
        }
    }
    tasks[index][key] = newId;
    renderTasks();
    return;
  }
  if (key === "start") {
    tasks[index][key] = value.checked;
  } else if (["command", "timeout", "keys", "bodyPart", "poseFile", "sensetive", "frames"].includes(key)) {
    if (key === "keys") {
      tasks[index][key] = value.value
        .split("\n")
        .map(line => line.split(",").map(k => k.trim()).filter(Boolean));
    } else if (key === "bodyPart" && tasks[index].type === "match") {
      tasks[index][key] = value.value
        .split("\n")
        .map(line => line.split(",").map(k => k.trim()).filter(Boolean));
    } else if (["timeout", "frames", "sensetive"].includes(key)) {
      tasks[index][key] = value.value.split("\n").map(v => v.trim()).filter(Boolean);
    } else {
      tasks[index][key] = value.value.split("\n").map(v => v.trim()).filter(Boolean);
    }
  } else if (key === "extra") {
    try {
      tasks[index][key] = JSON.parse(value.value);
    } catch {
      tasks[index][key] = {};
    }
  } else {
    tasks[index][key] = value.value;
  }
    console.log(tasks);
}

function addNextTask(index) {
  tasks[index].nextTasks.push({ operate: "start", id: "" });
  renderTask(index);
}

function updateNextTask(index, ntIndex, key, value) {
  tasks[index].nextTasks[ntIndex][key] = value;
  renderTask(index);
}

function renderTasks() {
  const container = document.getElementById("task-container");
  container.innerHTML = "";
  tasks.forEach((_, index) => {
    const div = document.createElement("div");
    div.id = "task-" + index;
    container.appendChild(div);
    renderTask(index);
  });
}

function renderTask(index) {
  const task = tasks[index];
  const div = document.getElementById("task-" + index);
  div.className = "task";
  const otherTaskIds = tasks.map((t, i) => i !== index ? t.id : null).filter(Boolean);

  div.innerHTML = `
    <label>任务类型:
      <select class="task-type-select" onchange="updateTask(${index}, 'type', this)">
        <option value="command" ${task.type === "command" ? "selected" : ""}>command</option>
        <option value="keypress" ${task.type === "keypress" ? "selected" : ""}>keypress</option>
        <option value="match" ${task.type === "match" ? "selected" : ""}>match</option>
        <option value="timeout" ${task.type === "timeout" ? "selected" : ""}>timeout</option>
        <option value="detect" ${task.type === "detect" ? "selected" : ""}>detect</option>
        <option value="socketsend" ${task.type === "socketsend" ? "selected" : ""}>socketsend</option>
      </select>
    </label>
    <label>任务 ID:
      <input class="task-id-input"
        type="text"
        value="${task.id}"
        onblur="updateTask(${index}, 'id', this)" />
    </label>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
      <input type="checkbox" id="start-${index}" ${task.start ? "checked" : ""} onchange="updateTask(${index}, 'start', this)" style="width:unset" />
      <label for="start-${index}" style="margin:0;cursor:pointer;">
        初始启动
      </label>
    </div>
    <label class="next-task-label">后续任务 (nextTasks):</label>
    ${task.nextTasks.map((nt, i) => `
      <div class="next-task">
        <select onchange="updateNextTask(${index}, ${i}, 'operate', this.value)">
          <option value="start" ${nt.operate === "start" ? "selected" : ""}>start</option>
          <option value="stop" ${nt.operate === "stop" ? "selected" : ""}>stop</option>
        </select>
        <select onchange="updateNextTask(${index}, ${i}, 'id', this.value)">
          <option value="">请选择任务</option>
          ${otherTaskIds.map(id => `
            <option value="${id}" ${nt.id === id ? "selected" : ""}>${id}</option>
          `).join("")}
        </select>
      </div>
    `).join("") || "<p style='color:#999;margin-top:8px;'>暂无 nextTasks</p>"}
    <button onclick="addNextTask(${index})" style="margin-top:8px;">+ 添加 nextTask</button>
    ${renderTaskFields(task, index)}
  `;
}

function renderTaskFields(task, index) {
  let taskFields = "";
  switch (task.type) {
    case "command":
      taskFields = `
        <label>命令列表:
          <textarea oninput="updateTask(${index}, 'command', this)">${task.command.join("\n")}</textarea>
        </label>
        <label>超时（秒）:
          <textarea oninput="updateTask(${index}, 'timeout', this)">${task.timeout.join("\n")}</textarea>
        </label>
      `;
      break;

    case "keypress":
      taskFields = `
        <label>按键组合（用逗号分隔）:
          <textarea oninput="updateTask(${index}, 'keys', this)">${task.keys.map(k => k.join(",")).join("\n")}</textarea>
        </label>
      `;
      break;

    case "match":
      taskFields = `
        <label>身体部位（每行一组，用逗号分隔）:
          ${task.bodyPart.map((parts, i) => `
            <div>
                <input type="checkbox" ${task.start ? "checked" : ""} onchange="updateTask(${index}, 'start', this.parentElement.parentElement)" style="width:unset" />
                <label for="start-${index}" style="margin:0;cursor:pointer;">初始启动</label>
                <input type="checkbox" ${task.start ? "checked" : ""} onchange="updateTask(${index}, 'start', this.parentElement.parentElement)" style="width:unset" />
                <input type="checkbox" ${task.start ? "checked" : ""} onchange="updateTask(${index}, 'start', this.parentElement.parentElement)" style="width:unset" />
                <input type="checkbox" ${task.start ? "checked" : ""} onchange="updateTask(${index}, 'start', this.parentElement.parentElement)" style="width:unset" />
            </div>`)} 
          <textarea oninput="updateTask(${index}, 'bodyPart', this)">${task.bodyPart.map(k => Array.isArray(k) ? k.join(",") : k).join("\n")}</textarea>
        </label>
        <label>姿态文件路径:
          <textarea oninput="updateTask(${index}, 'poseFile', this)">${task.poseFile.join("\n")}</textarea>
        </label>
        <label>敏感度:
          <textarea oninput="updateTask(${index}, 'sensetive', this)">${task.sensetive.join("\n")}</textarea>
        </label>
        <label>帧数:
          <textarea oninput="updateTask(${index}, 'frames', this)">${task.frames.join("\n")}</textarea>
        </label>
      `;
      break;

    case "timeout":
      taskFields = `
        <label>延迟时间（毫秒）:
          <input type="number" oninput="updateTask(${index}, 'timeout', this)" value="${task.timeout}" />
        </label>
      `;
      break;

    case "detect":
      taskFields = `
        <label>检测身体部位:
          <textarea oninput="updateTask(${index}, 'bodyPart', this)">${task.bodyPart.join("\n")}</textarea>
        </label>
        <label>检测帧数:
          <input type="number" oninput="updateTask(${index}, 'frames', this)" value="${task.frames}" />
        </label>
      `;
      break;

    case "socketsend":
      taskFields = `
        <label>目标 IP:
          <input type="text" oninput="updateTask(${index}, 'ip', this)" value="${task.ip}" />
        </label>
        <label>目标端口:
          <input type="number" oninput="updateTask(${index}, 'port', this)" value="${task.port}" />
        </label>
        <label>额外数据（JSON）:
          <textarea oninput="updateTask(${index}, 'extra', this)">${JSON.stringify(task.extra, null, 2)}</textarea>
        </label>
      `;
      break;
  }
  return taskFields;
}

function exportConfig() {
  const typeFields = {
    command: ["type", "id", "start", "nextTasks", "command", "timeout", "extra"],
    keypress: ["type", "id", "start", "nextTasks", "keys", "extra"],
    match: ["type", "id", "start", "nextTasks", "bodyPart", "poseFile", "sensetive", "frames", "extra"],
    timeout: ["type", "id", "start", "nextTasks", "timeout", "extra"],
    detect: ["type", "id", "start", "nextTasks", "bodyPart", "frames", "extra"],
    socketsend: ["type", "id", "start", "nextTasks", "ip", "port", "extra"]
  };

  const filteredTasks = tasks.map(task => {
    const fields = typeFields[task.type] || [];
    const obj = {};
    fields.forEach(f => obj[f] = task[f]);
    return obj;
  });

  const blob = new Blob([JSON.stringify(filteredTasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "config.json";
  a.click();
  URL.revokeObjectURL(url);
}

// 初始化第一个任务
addTask();