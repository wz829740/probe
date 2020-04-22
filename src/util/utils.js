/**
 * 判断dom元素是否在可视区内
 */

export function isEleVisible(element) {
    let elRect = element.getBoundingClientRect();
    let intersect = false;
    intersect = {
        top: Math.max(elRect.top, 0),
        left: Math.max(elRect.left, 0),
        bottom: Math.min(elRect.bottom, (window.innerHeight || document.documentElement.clientHeight)),
        right: Math.min(elRect.right, (window.innerWidth || document.documentElement.clientWidth))
    };
    if (intersect.bottom <= intersect.top || intersect.right <= intersect.left) {
        intersect = false;
    } else {
        intersect = (intersect.bottom - intersect.top) * (intersect.right - intersect.left);
    }
    return intersect;
}

// 获取首屏元素
export function getVisibleRects() {
    let elements = document.getElementsByTagName('*'); // 避免递归
    let useless = ['META', 'HEAD', 'HTML', 'SCRIPT', 'STYLE'];
    elements = [...elements].filter(({ tagName }) => !useless.includes(tagName));
    let visibleRects = [];
    for (let i = 0; i < elements.length; i++) {
        let el = elements[i];
        let area = isEleVisible(el);
        // 在可视区域内
        if (area) {
            let style = window.getComputedStyle(el);
            let isHide = style.display === 'none'; // 元素不可见
            if (isHide) {
                return;
            }
            if (el.tagName === 'IMG') {
                visibleRects.push(el.src);
            }
            let imgStr = style && (style['background-image'] || style['background']);
            if (imgStr) {
                let re = /http[^'"\)]+/g;
                let matches = imgStr.match(re);
                if (matches && matches.length > 0) {
                    let address = matches[0];
                    visibleRects.push(address);
                }
            }
            if (el.tagName === 'IFRAME' && area) {
                visibleRects.push(el.src);
            }
        }
    }
    return visibleRects;
}

/**
 * 
 * 分辨率算法：pc直接取宽高，移动端*dpr
 */
export function getResolution(metrics) {
    let screen = window && window.screen;
    let { width, height } = screen;
    return {width, height};
}