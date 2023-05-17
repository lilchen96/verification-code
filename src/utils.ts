import type { RadomAvoidArea, Location, Area } from './type';

// 获取合成图片
export async function composeImage(
  canvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  backgroundImg: string,
  targetImgs: string[]
) {
  const context = canvas.getContext('2d');
  if (!context) return { url: '', targetLocations: [] };

  // 获取背景图，目标图
  const [backgroundImgElement, ...targetImgElements] = await Promise.all([
    loadImage(backgroundImg),
    ...targetImgs.map((item) => loadImage(item)),
  ]);

  // 画原图
  context.drawImage(backgroundImgElement, 0, 0, canvas.width, canvas.height);
  context.save();

  // 画目标
  const targetLocations: Location[] = await arrangeTargets(
    targetImgElements.length,
    targetWidth,
    targetHeight,
    canvas.width,
    canvas.height
  );
  targetImgElements.forEach((imgElement, index) => {
    context.drawImage(
      imgElement,
      targetLocations[index].x,
      targetLocations[index].y,
      targetWidth,
      targetHeight
    );
  });

  // 导出合成图和目标坐标集合
  return { url: canvas.toDataURL('image/jpeg', 1), targetLocations };
}

// 排列多目标的坐标，避免坐标冲突
async function arrangeTargets(
  num: number,
  targetWidth: number,
  targetHeight: number,
  canvasWidth: number,
  canvasHeight: number
) {
  // 计算目标图片的坐标下限和上限
  const xLowerLimit = 0;
  const xUpperLimit = canvasWidth - targetWidth;
  const yLowerLimit = 0;
  const yUpperLimit = canvasHeight - targetHeight;

  // 目标图片坐标的禁止取值范围，已被前面的目标图片占用的坐标范围
  const xAvoidAreas: RadomAvoidArea[] = [];
  const yAvoidAreas: RadomAvoidArea[] = [];

  const targetLocations = [];
  for (let i = 0; i < num; i++) {
    // 获得目标图片的坐标
    const targetX = randomNumFilterAvoid(xUpperLimit, xLowerLimit, xAvoidAreas);
    const targetY = randomNumFilterAvoid(yUpperLimit, yLowerLimit, yAvoidAreas);
    xAvoidAreas.push({
      lowerLimit: targetX - targetWidth,
      upperLimit: targetX + targetWidth,
    });
    // 只要保证x或y不重叠即可，因实际情况多为x>y，所以y不做重叠校验，增加可选范围
    // yAvoidAreas.push({
    //   lowerLimit: targetY - targetHeight,
    //   upperLimit: targetY + targetHeight,
    // });
    targetLocations.push({
      x: targetX,
      y: targetY,
    });
  }
  return targetLocations;
}

// 获取随机整数，过滤指定的禁止区域
function randomNumFilterAvoid(
  upperLimit: number,
  lowerLimit: number,
  avoidAreas: RadomAvoidArea[]
): number {
  // 可取整数的集合
  const numDistribution = [];
  // 过滤禁止区域后的整数集合
  for (let i = lowerLimit; i <= upperLimit; i++) {
    const isValid = avoidAreas.reduce(
      (pre, cur) =>
        pre &&
        ((i as number) < cur.lowerLimit || (i as number) > cur.upperLimit),
      true
    );
    if (isValid) {
      numDistribution.push(i);
    }
  }
  // 在整数集合中随机取一个整数
  let radomIndex = Math.floor(Math.random() * numDistribution.length);
  if (radomIndex === numDistribution.length) {
    radomIndex = radomIndex - 1;
  }
  return numDistribution[radomIndex];
}

// 加载图片
export function loadImage(url: string): Promise<HTMLImageElement> {
  const image = new Image();
  // 支持匿名跨域
  image.crossOrigin = 'anonymous';
  image.src = url;
  return new Promise((resolve, reject) => {
    image.onload = function () {
      resolve(image);
    };
  });
}

// 检查某点是否在某区域内
export function checkLocationInArea(location: Location, area: Area) {
  const xRange = [area.topLeft.x, area.topRight.x];
  const yRange = [area.topLeft.y, area.bottomLeft.y];
  const flag =
    location.x > xRange[0] &&
    location.x < xRange[1] &&
    location.y > yRange[0] &&
    location.y < yRange[1];
  return flag;
}

// 原点坐标转化为区域
export function originLocationToArea(
  location: Location,
  width: number,
  height: number
) {
  return {
    topLeft: location,
    topRight: {
      x: location.x + width,
      y: location.y,
    },
    bottomLeft: { x: location.x, y: location.y + height },
    bottomRight: { x: location.x + width, y: location.y + height },
  };
}
