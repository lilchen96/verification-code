import type {
  VerificationCodeOptions,
  VerificationCodeVerifyOptions,
  Location,
} from './type';
import {
  composeImage,
  loadImage,
  originLocationToArea,
  checkLocationInArea,
} from './utils.js';

export default class VerificationCode {
  private selector: string;
  private container: Element | null;
  public options: VerificationCodeOptions = {
    width: 300,
    height: 150,
    targetWidth: 30,
    targetHeight: 30,
  };
  private canvas: HTMLCanvasElement;
  private renderContext: CanvasRenderingContext2D | null = null;

  private targetLocations: Location[] = [];
  private clickLocations: Location[] = [];

  constructor(selector: string, options?: VerificationCodeOptions) {
    try {
      this.selector = selector;
      this.container = document.querySelector(this.selector);
      if (!this.selector || !this.container) {
        throw new Error('invalid selector!');
      }
      if (options) {
        this.options = {
          ...this.options,
          ...options,
        };
      }

      // 创建canvas并初始化
      this.canvas = document.createElement('canvas');
      this.canvas.width = this.options.width;
      this.canvas.height = this.options.height;
      this.container.append(this.canvas);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // 验证码生成
  public async verify(verifyOptions: VerificationCodeVerifyOptions) {
    // 先取消点击事件监听，避免重复监听
    // this.canvas.removeEventListener('click');
    this.renderContext = this.canvas.getContext('2d');
    if (!this.renderContext) return;
    // 获取合成图片
    const { url: composeImageBase64, targetLocations } = await composeImage(
      this.canvas,
      this.options.targetWidth,
      this.options.targetHeight,
      verifyOptions.background,
      verifyOptions.targets
    );
    let composeImageFile;
    if (composeImageBase64) {
      composeImageFile = await loadImage(composeImageBase64);
    } else {
      composeImageFile = await loadImage(verifyOptions.background);
    }
    // 设置目标坐标集合和点击坐标集合
    this.targetLocations = targetLocations;
    this.clickLocations = [];
    // 绘制整个图片
    this.renderContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderContext.drawImage(
      composeImageFile,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    return new Promise((resolve, reject) => {
      // 监听点击事件
      this.canvas.addEventListener('click', (e: Event) =>
        this.addClickLocation(e, resolve, reject)
      );
    });
  }

  //   新增点击坐标
  private addClickLocation(
    e: Event,
    resolve: (value: unknown) => void,
    reject: (reason?: any) => void
  ) {
    const next = this.clickLocations.length + 1;
    // 点击次数已用完
    if (next > this.targetLocations.length) {
      return;
    } else {
      const event = e as PointerEvent;
      if (!this.renderContext) return;
      //   绘画数字
      this.renderContext.beginPath();
      this.renderContext.arc(event.offsetX, event.offsetY, 10, 0, 2 * Math.PI);
      this.renderContext.fillStyle = '#1296db';
      this.renderContext.fill();

      this.renderContext.font = 'bold 15px Arial';
      this.renderContext.fillStyle = '#ffffff';
      this.renderContext.textAlign = 'center';
      this.renderContext.textBaseline = 'middle';
      this.renderContext.fillText(
        next + '',
        event.offsetX,
        event.offsetY + 2.5
      );
      //   点击坐标集合添加坐标
      this.clickLocations.push({
        x: event.offsetX,
        y: event.offsetY,
      });
      //   是否是最后一次点击
      if (this.clickLocations.length === this.targetLocations.length) {
        console.log(this.clickLocations);

        //   检查是否点击正确
        const isPass = this.clickLocations.reduce((pre, cur, index) => {
          const targetLocation = this.targetLocations[index];
          const targetArea = originLocationToArea(
            targetLocation,
            this.options.targetWidth,
            this.options.targetHeight
          );
          console.log(checkLocationInArea(cur, targetArea));
          return checkLocationInArea(cur, targetArea) && pre;
        }, true);
        if (isPass) {
          resolve(true);
        } else {
          reject();
        }
      }
    }
  }
}
