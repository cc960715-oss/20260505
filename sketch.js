let facemesh;
let video;
let predictions = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 初始化 facemesh 模型
  facemesh = ml5.facemesh(video, () => console.log("Model Ready"));
  facemesh.on("predict", results => {
    predictions = results;
  });
}

function draw() {
  background('#e7c6ff');

  let vW = width * 0.5; // 影像寬度為畫布50%
  let vH = height * 0.5; // 影像高度為畫布50%
  let vX = (width - vW) / 2; // 置中 X 座標
  let vY = (height - vH) / 2; // 置中 Y 座標

  // 1. 顯示文字：置中於畫布上方，不在影像內
  fill(0);
  noStroke();
  textSize(32);
  textAlign(CENTER, BOTTOM);
  text("414730035", width / 2, vY - 20);

  // 2. 處理影像鏡像與繪製
  push();
  // 移至影像顯示區域的右上角，準備做鏡像翻轉
  translate(vX + vW, vY);
  scale(-1, 1); 
  image(video, 0, 0, vW, vH);

  // 3. 繪製 FaceMesh 點位連線
  if (predictions.length > 0) {
    let keypoints = predictions[0].scaledMesh;

    // 定義臉部最外層輪廓點位
    let faceSilhouette = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 
      400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
    ];

    // 繪製遮罩：用顏色 #fdf0d5 填滿輪廓外的區域
    push();
    fill('#fdf0d5');
    noStroke();
    beginShape();
    // 外部矩形（涵蓋整個影像顯示區域）
    vertex(0, 0);
    vertex(vW, 0);
    vertex(vW, vH);
    vertex(0, vH);
    // 內部孔洞（臉部輪廓）
    beginContour();
    for (let i = 0; i < faceSilhouette.length; i++) {
      let p = keypoints[faceSilhouette[i]];
      vertex(map(p[0], 0, video.width, 0, vW), map(p[1], 0, video.height, 0, vH));
    }
    endContour();
    endShape(CLOSE);
    pop();

    // 第一組點位 (粗細 15)
    stroke(255, 0, 0);
    strokeWeight(15);
    noFill();
    let set1 = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    drawLines(keypoints, set1, vW, vH);

    // 第二組點位 (粗細 1)
    strokeWeight(1);
    let set2 = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
    drawLines(keypoints, set2, vW, vH);

    // 4. 繪製右眼 (黑眼圈效果：灰色偏黑, 粗細 15)
    stroke(50); 
    strokeWeight(15);
    let rightEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 130];
    drawLines(keypoints, rightEyeOuter, vW, vH);
    strokeWeight(1);
    let rightEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33];
    drawLines(keypoints, rightEyeInner, vW, vH);

    // 5. 繪製左眼 (黑眼圈效果)
    strokeWeight(15);
    let leftEyeOuter = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 359];
    drawLines(keypoints, leftEyeOuter, vW, vH);
    strokeWeight(1);
    let leftEyeInner = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249, 263];
    drawLines(keypoints, leftEyeInner, vW, vH);

    // 6. 繪製臉部最外層輪廓 (螢光藍色, 粗細 2)
    stroke(0, 255, 255);
    strokeWeight(2);
    drawLines(keypoints, faceSilhouette, vW, vH);
  }
  pop();
}

// 繪製連線的輔助函式
function drawLines(points, indices, displayW, displayH) {
  for (let i = 0; i < indices.length - 1; i++) {
    let p1 = points[indices[i]];
    let p2 = points[indices[i + 1]];
    
    // 將原始影像座標映射到目前的顯示寬高
    line(
      map(p1[0], 0, video.width, 0, displayW),
      map(p1[1], 0, video.height, 0, displayH),
      map(p2[0], 0, video.width, 0, displayW),
      map(p2[1], 0, video.height, 0, displayH)
    );
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
