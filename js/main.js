/**
 * Neuraleap主要JavaScript文件
 * 负责网站交互、导航和视觉效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if dropdowns were already initialized by the component
    if (!window.dropdownsInitialized) {
        // Initialize navigation menus and dropdowns
        initNavigation();
    }
    
    // 初始化神经网络背景效果（如果存在）
    initNeuralBackground();
    
    // 初始化页面动画效果
    initAnimations();
    
    // 初始化响应式设计相关功能
    initResponsiveFeatures();
    
    // 初始化表单验证
    initFormValidation();
    
    // 确保外部链接在新标签中打开
    initExternalLinks();
    
    // 添加Dark模式支持
    initDarkMode();
});

/**
 * 导航菜单初始化
 */
function initNavigation() {
    // Set flag to prevent double initialization
    window.dropdownsInitialized = true;
    
    // Mobile menu toggle - only initialize if not already done by the component
    if (!document.querySelector('.mobile-menu.initialized')) {
        // Use event delegation for the mobile menu button to handle dynamically loaded elements
        document.addEventListener('click', function(event) {
            // Check if the clicked element or its parent is the mobile menu button
            const mobileMenuButton = event.target.closest('#mobile-menu-button');
            if (mobileMenuButton) {
                // Find the mobile menu
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                    mobileMenu.classList.toggle('hidden');
                }
            }
        });
        
        // Mark all mobile menus as initialized
        document.querySelectorAll('.mobile-menu').forEach(menu => {
            menu.classList.add('initialized');
        });
    }
    
    // Skip dropdown initialization if the header component is using CSS hover
    if (document.querySelector('.dropdown:hover .dropdown-menu')) {
        console.log("Skipping JS dropdown initialization - using CSS hover");
    } else {
        // Use event delegation for dropdowns to handle dynamically loaded elements
        document.addEventListener('click', function(event) {
            // Check if the clicked element is a dropdown toggle
            if (event.target.closest('.dropdown-toggle')) {
                const toggle = event.target.closest('.dropdown-toggle');
                event.preventDefault();
                event.stopPropagation();
                
                // Close all other dropdown menus
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    if (menu !== toggle.nextElementSibling) {
                        // Check what class is being used (show or hidden)
                        if (menu.classList.contains('show')) {
                            menu.classList.remove('show');
                        } else {
                            menu.classList.add('hidden');
                        }
                    }
                });
                
                // Toggle current dropdown menu
                const dropdownMenu = toggle.nextElementSibling;
                // Check if we're using show/hide or hidden classes
                if (dropdownMenu) {
                    if (dropdownMenu.classList.contains('show') || dropdownMenu.classList.contains('hidden')) {
                        dropdownMenu.classList.toggle('show');
                        dropdownMenu.classList.toggle('hidden');
                    } else {
                        // Default fallback
                        dropdownMenu.classList.toggle('hidden');
                    }
                }
            }
        });
        
        // Close dropdown menus when clicking elsewhere on the page
        document.addEventListener('click', function(event) {
            // Only run if not clicking on a dropdown toggle
            if (!event.target.closest('.dropdown-toggle')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    // Check what class is being used
                    if (menu.classList.contains('show')) {
                        menu.classList.remove('show');
                    } else {
                        menu.classList.add('hidden');
                    }
                });
            }
        });
    }
    
    // Handle mobile dropdown toggles
    document.addEventListener('click', function(event) {
        const mobileToggle = event.target.closest('.mobile-dropdown button');
        if (mobileToggle) {
            const dropdownMenu = mobileToggle.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('mobile-dropdown-menu')) {
                dropdownMenu.classList.toggle('hidden');
                
                // Rotate the toggle icon
                const icon = mobileToggle.querySelector('svg');
                if (icon) {
                    icon.style.transform = dropdownMenu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
                }
            }
        }
    });
    
    // Highlight current page in navigation
    highlightCurrentPageInNav();
}

/**
 * 高亮显示当前页面在导航中的链接
 */
function highlightCurrentPageInNav() {
    const currentPath = window.location.pathname;
    
    // 处理桌面导航
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/index.html') {
            item.classList.add('text-cyan-400');
            item.classList.add('glow-effect');
        }
    });
    
    // 处理移动导航
    document.querySelectorAll('.mobile-menu a').forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/index.html') {
            item.classList.add('bg-cyan-900');
            item.classList.add('text-white');
        }
    });
}

/**
 * 神经网络背景效果初始化
 */
function initNeuralBackground() {
    const neuralNetwork = document.getElementById('neural-network');
    if (!neuralNetwork) return;
    
    // 神经网络节点数量
    const nodeCount = 15;
    // 节点数组
    const nodes = [];
    
    // 创建神经网络节点
    for (let i = 0; i < nodeCount; i++) {
        // 创建节点元素
        const node = document.createElement('div');
        node.classList.add('neural-node');
        
        // 随机位置
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        node.style.left = `${x}%`;
        node.style.top = `${y}%`;
        
        // 添加到容器
        neuralNetwork.appendChild(node);
        
        // 保存节点信息
        nodes.push({
            element: node,
            x: x,
            y: y,
            connections: []
        });
    }
    
    // 创建连接线
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            // 计算节点间距离
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 只连接一定距离内的节点
            if (distance < 40) {
                // 创建连接线
                const line = document.createElement('div');
                line.classList.add('neural-line');
                
                // 设置线的位置和旋转角度
                const x1 = nodes[i].x;
                const y1 = nodes[i].y;
                const x2 = nodes[j].x;
                const y2 = nodes[j].y;
                
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                
                line.style.width = `${distance}%`;
                line.style.left = `${x1}%`;
                line.style.top = `${y1}%`;
                line.style.transform = `rotate(${angle}deg)`;
                
                neuralNetwork.appendChild(line);
                
                // 保存连接信息
                nodes[i].connections.push({ to: j, element: line });
                nodes[j].connections.push({ to: i, element: line });
            }
        }
    }
    
    // 添加脉冲动画效果
    let activeNodeIndex = Math.floor(Math.random() * nodes.length);
    
    setInterval(() => {
        // 获取当前活跃节点
        const activeNode = nodes[activeNodeIndex];
        
        // 高亮显示活跃节点
        activeNode.element.style.transform = 'scale(1.5)';
        activeNode.element.style.opacity = '1';
        
        // 激活连接节点
        activeNode.connections.forEach(conn => {
            conn.element.style.opacity = '0.8';
            
            // 连接到的节点也高亮显示
            setTimeout(() => {
                nodes[conn.to].element.style.transform = 'scale(1.2)';
                nodes[conn.to].element.style.opacity = '0.8';
            }, 200);
        });
        
        // 重置之前的活跃节点
        setTimeout(() => {
            activeNode.element.style.transform = '';
            activeNode.element.style.opacity = '';
            
            activeNode.connections.forEach(conn => {
                conn.element.style.opacity = '';
                nodes[conn.to].element.style.transform = '';
                nodes[conn.to].element.style.opacity = '';
            });
            
            // 随机选择下一个活跃节点
            activeNodeIndex = Math.floor(Math.random() * nodes.length);
        }, 1000);
    }, 2000);
}

/**
 * 初始化动画效果
 */
function initAnimations() {
    // 为具有data-animate属性的元素添加入场动画
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (animatedElements.length > 0) {
        // 创建交叉观察器，当元素进入视口时添加动画
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animation = el.getAttribute('data-animate');
                    el.classList.add(animation);
                    
                    // 如果设置了只播放一次，则取消观察
                    if (el.hasAttribute('data-animate-once')) {
                        observer.unobserve(el);
                    }
                } else if (!entry.target.hasAttribute('data-animate-once')) {
                    // 如果元素离开视口且不是只播放一次，则移除动画类
                    const el = entry.target;
                    const animation = el.getAttribute('data-animate');
                    el.classList.remove(animation);
                }
            });
        }, {
            threshold: 0.1 // 当元素有10%进入视口时触发
        });
        
        // 观察所有具有动画的元素
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }
    
    // 添加霓虹灯效果的交互
    const neonElements = document.querySelectorAll('.neon-text, .neon-button');
    
    neonElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.classList.add('glow-effect');
        });
        
        el.addEventListener('mouseleave', () => {
            el.classList.remove('glow-effect');
        });
        
        el.addEventListener('click', () => {
            el.classList.add('click-effect');
            setTimeout(() => {
                el.classList.remove('click-effect');
            }, 300);
        });
    });
    
    // 为滚动添加平滑效果
    initSmoothScroll();
}

/**
 * 初始化平滑滚动
 */
function initSmoothScroll() {
    // 获取所有内部链接
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 获取目标元素的ID
            const targetId = this.getAttribute('href');
            
            // 确保链接不为空且目标元素存在
            if (targetId !== '#' && document.querySelector(targetId)) {
                e.preventDefault();
                
                // 滚动到目标元素
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * 初始化响应式功能
 */
function initResponsiveFeatures() {
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        // 更新响应式元素状态
        updateResponsiveElements();
    });
    
    // 初始调用一次
    updateResponsiveElements();
}

/**
 * 更新响应式元素状态
 */
function updateResponsiveElements() {
    const isMobile = window.innerWidth < 768;
    
    // 响应式处理逻辑，根据需要添加
    if (isMobile) {
        // 移动端特定逻辑
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = 'none';
        });
                } else {
        // 桌面端特定逻辑
        document.querySelectorAll('.desktop-only').forEach(el => {
            el.style.display = '';
        });
        
        // 确保移动菜单在桌面视图被隐藏
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }
}

/**
 * 初始化表单验证
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // 获取所有必填字段
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                // 如果字段为空，标记为无效
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500');
                    
                    // 显示错误信息
                    let errorMsg = field.nextElementSibling;
                    if (!errorMsg || !errorMsg.classList.contains('error-message')) {
                        errorMsg = document.createElement('p');
                        errorMsg.classList.add('error-message', 'text-red-500', 'text-sm', 'mt-1');
                        field.parentNode.insertBefore(errorMsg, field.nextSibling);
                    }
                    errorMsg.textContent = '此字段为必填项';
                } else {
                    field.classList.remove('border-red-500');
                    
                    // 清除错误信息
                    const errorMsg = field.nextElementSibling;
                    if (errorMsg && errorMsg.classList.contains('error-message')) {
                        errorMsg.textContent = '';
                    }
                }
            });
            
            // 如果表单无效，阻止提交
            if (!isValid) {
                e.preventDefault();
                }
            });
        });
    }
    
/**
 * 初始化外部链接处理
 */
function initExternalLinks() {
    // 获取所有外部链接
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    
    externalLinks.forEach(link => {
        // 检查链接是否指向外部站点
        if (!link.hostname.includes(window.location.hostname)) {
            // 设置在新标签打开
            link.setAttribute('target', '_blank');
            // 添加noopener noreferrer以提高安全性
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

/**
 * 初始化Dark模式
 */
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) {
        // 检查用户偏好
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // 检查本地存储的设置
        const storedDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 初始化Dark模式状态
        if (storedDarkMode || (prefersDark && storedDarkMode !== false)) {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        // 监听切换事件
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
}
