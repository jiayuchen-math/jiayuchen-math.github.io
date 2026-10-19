// The landing page contains real entrances only. Keep unpublished reading
// notes as plain text; the separate URL is retained for existing bookmarks.
export function personalNotesPage(){
 const english={title:'Personal Notes',body:`<div class="notes-landing">
<p class="notes-intro">My notes from coursework and mathematical reading.</p>
<section class="notes-section" id="course-notes"><h2><a href="/en/notes/mathematical-notes/page.html">Course notes</a></h2><p>Calculus and linear algebra, organized by week.</p></section>
<section class="notes-section" id="reading-notes"><h2>Reading notes</h2><p>No reading notes have been posted yet.</p></section>
<p class="notes-formats">PDF versions can be downloaded or printed; HTML versions are for reading online. Exercise links are listed separately.</p>
</div>`};
 const chinese={title:'个人笔记',body:`<div class="notes-landing">
<p class="notes-intro">课程学习与数学阅读中的个人笔记。</p>
<section class="notes-section" id="course-notes"><h2><a href="/en/notes/mathematical-notes/page.html">课程笔记</a></h2><p>微积分与线性代数，按周整理。</p></section>
<section class="notes-section" id="reading-notes"><h2>读书笔记</h2><p>目前还没有发布读书笔记。</p></section>
<p class="notes-formats">PDF 可下载或打印，HTML 适合在线阅读；习题入口另列。</p>
</div>`};
 // Page-local rules: no change to course pages or the global UI stylesheet.
 const head=`<style>
body.portal-personal-notes .portal-layout { max-width:760px; }
.notes-landing .notes-intro { margin-bottom:30px; }
.notes-landing .notes-section { padding:0 0 22px; margin:26px 0; border-bottom:1px solid var(--line); }
.notes-landing .notes-section h2 { margin-top:0; }
.notes-landing .notes-section p { margin-bottom:0; }
.notes-landing .notes-formats { margin-top:28px; font-size:15px; color:var(--muted); }
</style>`;
 return {english,chinese,head};
}
