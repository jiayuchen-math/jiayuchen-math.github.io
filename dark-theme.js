// 全站黑夜模式统一管理
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('siteTheme');

// 读取本地保存的上次主题
if(savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerText = '☀️ 日间模式';
}

// 切换逻辑
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    let currentTheme = 'light';
    if(document.body.classList.contains('dark-mode')){
        themeToggle.innerText = '☀️ 日间模式';
        currentTheme = 'dark';
    } else {
        themeToggle.innerText = '🌙 黑夜模式';
    }
    // 自动记忆主题，下次打开页面自动沿用上次设置
    localStorage.setItem('siteTheme', currentTheme);
});
