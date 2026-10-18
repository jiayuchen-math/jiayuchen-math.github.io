import {fileURLToPath} from 'node:url';
import {loadDirectionIntroductions,renderDirectionIntroduction,readingPracticePage} from './study-content.mjs';
import {translatedRoute,translatedRouteTopics,translatedRouteNodes,translatedDirectionIntroduction,translateRouteLabels} from './route-translations.mjs';
// Goal-oriented editorial routes reuse existing library subjects and preparation
// checks. Stages indicate progress within one direction, not a ranking of fields.
const stage=(title,subjects,note)=>({title,subjects,note});
export const goalPaths=[
 {id:'algebraic-geometry',title:'Toward algebraic geometry',goal:'Understand schemes, sheaves and the tools needed to choose a first research-level geometry text.',stages:[
  stage('Foundation: proof and algebra',['proofs','linear-algebra','abstract-algebra'],'Build confidence with quotients, field extensions and modules.'),
  stage('Bridge: local algebra and gluing',['commutative-algebra','point-set-topology','sheaves'],'Commutative algebra and topology can be studied alongside each other; sheaves connect local data with global objects.'),
  stage('Core: varieties and schemes',['algebraic-geometry'],'Choose a first course and work through examples before selecting specialist material.'),
  stage('Further branches',['homological-algebra','category-theory'],'Choose cohomology, stacks, arithmetic geometry or derived methods according to the prerequisites of a specific text; these are branches, not a compulsory final sequence.') ]},
 {id:'representation-theory',title:'Toward representation theory',goal:'Move from linear maps and group actions to representations and Lie-theoretic reading.',stages:[
  stage('Foundation: linear structures',['proofs','linear-algebra'],'Become comfortable with invariant subspaces and changes of basis.'),
  stage('Bridge: abstract algebra',['abstract-algebra'],'Use groups, modules and quotient constructions.'),
  stage('Core: representations and Lie theory',['representation-theory'],'Begin with concrete finite-dimensional examples, then select the group or Lie-algebra branch.'),
  stage('Further tools',['category-theory','homological-algebra'],'Add categorical or homological methods when your chosen representation-theory text uses them.') ]},
 {id:'analysis-pde',title:'Toward functional analysis and PDE',goal:'Reach functional-analytic and weak-solution methods from a first rigorous analysis course.',stages:[
  stage('Foundation: rigorous analysis',['calculus','proofs','linear-algebra','real-analysis'],'Calculation and proof are complementary; review only the skills that are missing.'),
  stage('Bridge: integration and function spaces',['measure-theory','functional-analysis'],'Study convergence theorems and Banach/Hilbert spaces before using them in estimates.'),
  stage('Core: differential equations',['differential-equations'],'Start with examples, then study distributions, weak derivatives and Sobolev spaces in the subject reading guide.'),
  stage('Further branches',['harmonic-analysis'],'Choose elliptic, evolution or nonlinear problems; Fourier and harmonic methods provide tools for some, not all, branches.') ]},
 {id:'complex-harmonic-analysis',title:'Toward complex and harmonic analysis',goal:'Build a foundation for Fourier methods, complex variables and advanced analytic estimates.',stages:[
  stage('Foundation: real variables',['calculus','proofs','linear-algebra','real-analysis'],'Develop convergence arguments and quantitative estimates.'),
  stage('Bridge: two parallel languages',['complex-analysis','measure-theory'],'Complex analysis and measure theory are complementary branches, not interchangeable prerequisites.'),
  stage('Core: operators and Fourier analysis',['functional-analysis','harmonic-analysis'],'Study Lp estimates, bounded operators and Fourier transforms.'),
  stage('Further reading',['complex-analysis','harmonic-analysis'],'Choose several complex variables or an advanced harmonic-analysis topic from the existing subject guides.') ]},
 {id:'geometry',title:'Toward differential and symplectic geometry',goal:'Progress from multivariable calculus to manifolds, curvature and a chosen geometric branch.',stages:[
  stage('Foundation: local calculations and topology',['linear-algebra','calculus','point-set-topology'],'Coordinate calculations and topological arguments are both needed.'),
  stage('Core: smooth geometry',['differential-geometry'],'Work with tangent spaces, forms, metrics and explicit manifold examples.'),
  stage('Bridge: global invariants',['algebraic-topology'],'Use homology and cohomology when the geometric problem requires global information.'),
  stage('Further branch: symplectic geometry',['symplectic-geometry'],'Start with symplectic forms and Hamiltonian dynamics; check additional analysis before Floer-theoretic reading.') ]},
 {id:'topology',title:'Toward algebraic topology and homotopy',goal:'Connect topological spaces with algebraic invariants and higher homotopical methods.',stages:[
  stage('Foundation: spaces and algebra',['proofs','point-set-topology','abstract-algebra'],'Quotient spaces and group constructions should become usable examples, not just definitions.'),
  stage('Core: fundamental groups and homology',['algebraic-topology'],'Learn covering spaces, cellular examples, homology and cohomology.'),
  stage('Bridge: complexes and categorical language',['homological-algebra','category-theory'],'Return to these tools alongside computations in topology.'),
  stage('Further reading: homotopy theory',['algebraic-topology','category-theory'],'Choose stable homotopy or higher-categorical references from the subject guides; check the chosen source’s preparation.') ]},
 {id:'number-theory',title:'Toward advanced number theory',goal:'Start with elementary arithmetic, then choose algebraic, analytic or modular directions.',stages:[
  stage('Foundation: arithmetic and proof',['proofs','elementary-number-theory'],'Work with divisibility, congruences and reciprocity examples.'),
  stage('Algebraic branch',['abstract-algebra','commutative-algebra','algebraic-number-theory'],'Move through fields and ideals toward local and global arithmetic.'),
  stage('Analytic branch',['real-analysis','complex-analysis','analytic-number-theory'],'This branch runs in parallel with algebraic number theory; it need not follow it.'),
  stage('Connecting branch: modular forms',['modular-forms'],'Use the relevant algebraic or analytic preparation; choose arithmetic geometry only after adding its geometric prerequisites.') ]},
 {id:'logic',title:'Toward logic, set theory and model theory',goal:'Move from mathematical language to formal systems and a chosen foundations specialization.',stages:[
  stage('Foundation: mathematical language',['proofs'],'Become fluent with quantifiers and proof methods.'),
  stage('Core: logic and sets',['logic','set-theory'],'Syntax, semantics and axioms give two complementary perspectives.'),
  stage('Bridge: algebraic examples',['abstract-algebra'],'This is useful preparation for the model-theoretic branch, not a universal prerequisite for all logic.'),
  stage('Further branches',['model-theory','logic','set-theory'],'Choose model theory, computability or advanced set theory from the corresponding subject guide.') ]},
 {id:'probability',title:'Toward measure-theoretic probability',goal:'Connect elementary random variables with rigorous probability and stochastic-process reading.',stages:[
  stage('Foundation: calculation and random variables',['calculus','probability'],'Learn distributions, expectation and elementary conditioning.'),
  stage('Bridge: rigorous integration',['real-analysis','measure-theory'],'Measure-theoretic probability needs this language even when elementary probability is already familiar.'),
  stage('Core: rigorous probability',['probability'],'Use the subject guide to select measure-theoretic texts, limit theorems and conditional expectation.'),
  stage('Further branches',['probability','functional-analysis'],'Choose martingales, stochastic processes or advanced probability; functional analysis is a supplementary tool for the appropriate branch.') ]},
 {id:'dynamics',title:'Toward dynamical systems and ergodic theory',goal:'Progress from iteration and flows to invariant measures and ergodic methods.',stages:[
  stage('Foundation: analysis and spaces',['real-analysis','linear-algebra','point-set-topology'],'These tools support iteration, local behavior and topological arguments.'),
  stage('Core: maps and flows',['dynamics'],'Begin with explicit orbits, recurrence and invariant sets.'),
  stage('Bridge to the measurable branch',['measure-theory','functional-analysis'],'Measure theory is central to ergodic theory; operator methods support further study.'),
  stage('Further reading: ergodic theory',['dynamics'],'Choose topological dynamics or measure-preserving systems without treating one as a substitute for the other.') ]},
 {id:'combinatorics',title:'Toward advanced combinatorics',goal:'Build from counting and graph arguments toward algebraic, extremal or probabilistic methods.',stages:[
  stage('Foundation: discrete proof',['proofs','combinatorics'],'Practice counting, recurrences and concrete graph arguments.'),
  stage('Choose supporting tools',['linear-algebra','abstract-algebra','probability'],'Select the tools for your branch; this is not a requirement to finish all three first.'),
  stage('Core and further branches',['combinatorics'],'Use the subject guide to select enumerative, algebraic, extremal, additive or probabilistic combinatorics.') ]},
 {id:'higher-categories',title:'Toward categories and higher structures',goal:'Move from concrete universal properties toward homotopical and higher-categorical reading.',stages:[
  stage('Foundation: algebraic examples',['linear-algebra','abstract-algebra'],'Learn constructions that supply examples of functors and universal properties.'),
  stage('Core: ordinary categories',['category-theory'],'Work with natural transformations, representability, limits and adjunctions.'),
  stage('Homotopical bridge',['algebraic-topology','homological-algebra'],'Topological and homological examples motivate higher constructions; the needed depth depends on the chosen source.'),
  stage('Further reading: higher structures',['category-theory'],'Choose the higher-categorical or homotopical references in the library; a first category-theory course alone is not the entire preparation.') ]},
];

const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const base='/en/resources/library-paths/';
export function goalPathPages({topics,nodes,root=fileURLToPath(new URL('../',import.meta.url)),locale='en'}) {
 const chinese=locale==='zh',routes=chinese?goalPaths.map(translatedRoute):goalPaths;
 if(chinese){topics=translatedRouteTopics(topics);nodes=translatedRouteNodes(nodes)}
 const introductions=loadDirectionIntroductions(root);
 const topicFor=id=>topics.find(t=>t.id===(nodes[id]?.topic||id));
 const label=id=>nodes[id]?.title||topicFor(id)?.title;
 const subjectLink=id=>`<a href="/en/notes/reading-notes/library/${escape(topicFor(id).route)}">${escape(label(id))}</a>`;
 const pages=new Map();
 for(const route of routes) {
  for(const s of route.stages)for(const id of s.subjects)if(!nodes[id]||!topicFor(id))throw Error('Missing route subject '+id);
  const sections=route.stages.map((s,i)=>`<section class="route-stage" id="stage-${i+1}"><h2>${i+1}. ${escape(s.title)}</h2><p>${escape(s.note)}</p><ul>${s.subjects.map(id=>`<li>${subjectLink(id)}<details><summary>Preparation &amp; skip guidance</summary><p>${escape(nodes[id].skip)}</p><a href="${base}${id==='sheaves'?'algebraic-geometry.html#sheaves--intro':id+'.html'}">Open the prerequisite review</a></details></li>`).join('')}</ul></section>`).join('');
  const body=`<p><a href="${base}">← All goal-oriented paths</a> · <a href="#stage-1">Start at the foundations</a></p><p class="route-goal">${escape(route.goal)}</p><nav class="route-spine" aria-label="Stages in this route"><ol>${route.stages.map((s,i)=>`<li><a href="#stage-${i+1}">${escape(s.title)}</a></li>`).join('')}</ol></nav><p>Enter at the first unfamiliar stage. Follow a branch that matches your goal, and use the preparation checks only when you need a review.</p>${sections}<p><a href="/en/notes/reading-notes/library.html">Browse the library by subject cards</a> · <a href="/en/notes/reading-notes/library/catalogue.html">Search all resources</a></p>`;
  const introduction=chinese?translatedDirectionIntroduction(introductions[route.id],route.id,root,renderDirectionIntroduction):renderDirectionIntroduction(introductions[route.id],route.id);
  pages.set(`resources/library-paths/routes/${route.id}.html`,{title:route.title,body:body.replace('<nav class="route-spine"',introduction.html+'<nav class="route-spine"'),contents:introduction.contents,kind:'article'});
 }
 const cards=routes.map(r=>`<article class="goal-card"><h2><a href="${base}routes/${r.id}.html">${escape(r.title)}</a></h2><p>${escape(r.goal)}</p><p class="route-preview">${r.stages.map(s=>escape(s.title)).join(' → ')}</p></article>`).join('');
 const body=`<p>Choose a destination, then follow a connected route from foundations through core study to more advanced branches.</p><p><a href="#goal-routes">Choose a direction</a> · <a href="#subject-reviews">Review a single prerequisite</a> · <a href="/en/notes/reading-notes/library.html">Library cards</a></p><p><a href="${base}reading-a-text.html">Reading a mathematics text</a> — choosing a book, working through proofs, and using hints without losing the problem.</p><div class="goal-grid" id="goal-routes">${cards}</div><details id="subject-reviews"><summary>Individual subject preparation — all ${topics.length} reviews</summary><p>These are the smaller building blocks used by the routes above, not additional end-to-end paths.</p><ul>${topics.map(t=>`<li><a href="${base}${t.id}.html">${escape(t.title)}</a></li>`).join('')}</ul></details>`;
 pages.set('resources/library-paths/index.html',{title:chinese?'学习路线':'Learning Paths',body,kind:'directory'});
 pages.set('resources/library-paths/reading-a-text.html',readingPracticePage(root,locale));
 if(chinese)for(const page of pages.values())page.body=translateRouteLabels(page.body);
 return pages;
}
