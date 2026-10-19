// Optional self-marking only. Never hides links, unlocks study or stores a profile.
document.querySelectorAll('[data-path-choice]').forEach(choice=>{
 const update=()=>{const node=choice.closest('.path-node');node.classList.toggle('already-familiar',choice.checked);const text=node.querySelector('[data-path-state]');if(text){text.hidden=!choice.checked;text.textContent=choice.checked?(document.documentElement.dataset.interfaceLanguage==='zh'?'已标记为熟悉。':'Marked familiar.'):' ';}};
 choice.addEventListener('change',update);update();
 document.addEventListener('interface-language-change',update);
});
