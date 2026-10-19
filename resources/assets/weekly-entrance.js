const courses={
 "calculus":{name:"Calculus",weeks:{1:{pdf:"MAweek1.pdf",html:"MAweek1.html",exercises:"Homework1.pdf"},2:{pdf:"week2.pdf",html:"MAweek2.html",exercises:"Homework2.pdf"}}},
 "linear-algebra":{name:"Linear Algebra",weeks:{1:{pdf:"LAweek1.pdf",html:"LAweek1.html",exercises:"LAexercises1.pdf"},2:{exercises:"LAexercises2.pdf"}}}
};
const params=new URLSearchParams(location.search),course=params.get("course")||"calculus",type=params.get("type")||"pdf",data=courses[course];
if(!data){location.replace("/en/notes/mathematical-notes/page.html");}
if(data){
 const base="/en/notes/mathematical-notes/"+(course==="calculus"?"calculus/":"linear-algebra/"),weeks=document.getElementById("weeks");
 for(let week=1;week<=12;week++){const files=data.weeks[week]||{},link=document.createElement("a");link.className="week";link.dataset.week=String(week);link.href=files[type]?base+files[type]:"#";if(files[type]&&type!=="html"){link.target="_blank";link.rel="noopener"}weeks.appendChild(link)}
 let previousLanguage;
 const render=()=>{
  const language=document.documentElement.dataset.interfaceLanguage||new URLSearchParams(location.search).get('lang')||'en';if(language===previousLanguage)return;previousLanguage=language;
  const zh=language==='zh',courseName=zh?(course==='calculus'?'微积分':'线性代数'):data.name,typeName=type==='html'?'HTML':type==='exercises'?(zh?'习题':'Exercises'):'PDF';
  document.title=courseName+' · '+typeName+' · Jiayu Chen';
  document.getElementById('title').textContent=courseName;document.getElementById('subtitle').textContent=typeName+' · '+(zh?'每周资料':'Weekly materials');
  document.getElementById('heading').textContent=zh?'可用周次':'Available weeks';document.getElementById('empty').textContent=zh?'这类资料暂未上传。':'No materials are available for this category yet.';
  for(const link of weeks.querySelectorAll('[data-week]'))link.textContent=zh?'第 '+link.dataset.week+' 周':'Week '+link.dataset.week;
 };
 document.addEventListener('interface-language-change',render);
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-interface-language']});render();
}
