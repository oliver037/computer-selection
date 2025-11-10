// 电脑选择系统主要JavaScript功能
// 包含动画效果、页面交互和用户体验增强

class ComputerSelectionSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalAnimations();
        this.setupNavigationEffects();
        this.setupFormValidation();
        this.setupResponsiveFeatures();
    }

    // 全局动画设置
    setupGlobalAnimations() {
        // 页面加载时的淡入效果
        anime({
            targets: 'body',
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutQuad'
        });

        // 滚动时的视差效果
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // 导航和页面切换效果
    setupNavigationEffects() {
        // 平滑页面过渡
        document.querySelectorAll('a[href^="./"], button[data-navigate]').forEach(element => {
            element.addEventListener('click', this.handleNavigation.bind(this));
        });

        // 返回按钮功能
        document.querySelectorAll('#backBtn, .back-button').forEach(button => {
            button.addEventListener('click', this.handleBackNavigation.bind(this));
        });
    }

    // 表单验证功能
    setupFormValidation() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
        });

        const buttons = document.querySelectorAll('button[id$="Btn"]');
        buttons.forEach(button => {
            button.addEventListener('click', this.handleButtonClick.bind(this));
        });
    }

    // 响应式功能设置
    setupResponsiveFeatures() {
        // 触摸设备的手势支持
        if ('ontouchstart' in window) {
            this.setupTouchGestures();
        }

        // 键盘导航支持
        this.setupKeyboardNavigation();

        // 窗口大小变化处理
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // 滚动处理
    handleScroll() {
        const scrollY = window.scrollY;
        const elements = document.querySelectorAll('.floating, .card-hover');
        
        elements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    // 导航处理
    handleNavigation(event) {
        event.preventDefault();
        const target = event.currentTarget.getAttribute('href') || 
                      event.currentTarget.getAttribute('data-navigate');
        
        if (target) {
            this.transitionToPage(target);
        }
    }

    // 返回导航
    handleBackNavigation(event) {
        event.preventDefault();
        
        // 添加返回动画
        anime({
            targets: event.currentTarget,
            scale: [1, 0.9, 1],
            duration: 200,
            easing: 'easeInOutQuad',
            complete: () => {
                window.history.back();
            }
        });
    }

    // 页面过渡效果
    transitionToPage(url) {
        // 淡出当前页面
        anime({
            targets: 'main, .container',
            opacity: [1, 0],
            translateX: [0, -50],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                window.location.href = url;
            }
        });
    }

    // 复选框变化处理
    handleCheckboxChange(event) {
        const checkbox = event.target;
        const relatedButton = document.getElementById('confirmBtn') || 
                             document.getElementById('submitBtn');
        
        if (relatedButton) {
            relatedButton.disabled = !checkbox.checked;
            
            if (checkbox.checked) {
                anime({
                    targets: relatedButton,
                    scale: [1, 1.02, 1],
                    duration: 300,
                    easing: 'easeOutBack'
                });
            }
        }

        // 复选框动画
        anime({
            targets: checkbox,
            scale: [1, 1.1, 1],
            duration: 200,
            easing: 'easeOutBack'
        });
    }

    // 按钮点击处理
    handleButtonClick(event) {
        const button = event.currentTarget;
        
        // 按钮点击动画
        anime({
            targets: button,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeInOutQuad'
        });

        // 添加点击波纹效果
        this.createRippleEffect(event);
    }

    // 创建波纹效果
    createRippleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        anime({
            targets: ripple,
            scale: [0, 2],
            opacity: [0.6, 0],
            duration: 600,
            easing: 'easeOutQuad',
            complete: () => {
                ripple.remove();
            }
        });
    }

    // 触摸手势设置
    setupTouchGestures() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // 水平滑动检测
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // 右滑 - 返回
                    this.handleSwipeRight();
                } else {
                    // 左滑 - 前进
                    this.handleSwipeLeft();
                }
            }
        });
    }

    // 右滑处理
    handleSwipeRight() {
        if (window.history.length > 1) {
            window.history.back();
        }
    }

    // 左滑处理
    handleSwipeLeft() {
        // 根据当前页面决定前进方向
        const currentPage = window.location.pathname.split('/').pop();
        
        switch(currentPage) {
            case 'index.html':
                this.transitionToPage('selection.html');
                break;
            case 'selection.html':
                // 根据选择决定前进方向
                break;
            default:
                // 默认行为
                break;
        }
    }

    // 键盘导航设置
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.handleSwipeRight();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.handleSwipeLeft();
                    break;
                case 'Escape':
                    e.preventDefault();
                    // 关闭模态框或返回
                    const modal = document.querySelector('.fixed.inset-0:not(.hidden)');
                    if (modal) {
                        modal.classList.add('hidden');
                    }
                    break;
            }
        });
    }

    // 窗口大小变化处理
    handleResize() {
        // 重新计算布局
        this.adjustLayoutForScreenSize();
    }

    // 根据屏幕尺寸调整布局
    adjustLayoutForScreenSize() {
        const isMobile = window.innerWidth < 768;
        const containers = document.querySelectorAll('.container, .max-w-md, .max-w-4xl');
        
        containers.forEach(container => {
            if (isMobile) {
                container.classList.add('px-4');
            } else {
                container.classList.remove('px-4');
            }
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuad'
        });
        
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    notification.remove();
                }
            });
        }, 3000);
    }

    // 页面可见性变化处理
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停动画
            anime.running.forEach(animation => {
                animation.pause();
            });
        } else {
            // 页面显示时恢复动画
            anime.running.forEach(animation => {
                animation.play();
            });
        }
    }
}

// 初始化系统
document.addEventListener('DOMContentLoaded', () => {
    window.computerSelectionSystem = new ComputerSelectionSystem();
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
        window.computerSelectionSystem.handleVisibilityChange();
    });
});

// 全局工具函数
window.utils = {
    // 格式化日期
    formatDate(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },
    
    // 生成随机ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};