import VerificationCode from './index.js';

const verificationCode = new VerificationCode('#app');

const background =
  'http://47.103.111.219:8000/file/download/646437ef716c603c2604e4d4.jpg';
const targets = [
  'http://47.103.111.219:8000/file/download/646439e5716c603c2604e4d8.png',
  'http://47.103.111.219:8000/file/download/646439e5716c603c2604e4d9.png',
  'http://47.103.111.219:8000/file/download/646439e5716c603c2604e4da.png',
];

renderHeader(targets);
verificationCode
  .verify({
    background: background,
    targets: targets,
  })
  .then(() => {
    console.log('success!');
  })
  .catch(() => {
    console.log('fail!');
  });

function renderHeader(targets: string[]) {
  const tipEl = document.createElement('div');
  tipEl.className = ['vc-verification-code__header__tip'].join(' ');
  const innerHTML = `<span>请依次点击：</span>${targets
    .map(
      (item) =>
        `<img style='width:${verificationCode.options.targetWidth}px;height:${verificationCode.options.targetHeight}px;margin-right:10px' src='${item}'/>`
    )
    .join('')}`;
  tipEl.innerHTML = innerHTML;
  document.querySelector('#app')?.appendChild(tipEl);
}
