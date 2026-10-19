import {trimCopy} from './concise-copy.mjs';
// Presentation-only changes: source records, mathematical prose, dates and badges
// remain intact. General caveats belong on the single site disclaimer page.
const paragraphs=[
 ['The reading choices are editorial, supported by the linked works', 'Choose a branch below and follow its suggested reading.'],
 ['These are personal notes from my study of pure mathematics.', 'Personal notes from my undergraduate mathematics courses.'],
 ['Dates are reviewed records, not a live portal check.', 'Choose a date type and range. Entries without known dates remain visible until you apply a date filter.'],
 ['Check the access badge before opening a title:', 'Access badges distinguish direct PDFs, online texts, institutional access and source pages.'],
 ['Reference tools, lectures, research communities and personal expository writing. Inclusion', 'Reference tools, lectures, research communities and personal expository writing.'],
 ['All programmes are shown initially.', 'Browse by destination, degree, subject and application time.'],
 ['Verified = the stated official fact,', 'Evidence labels: Verified · Partially verified · Historical · Not published · Not verified.'],
 ['No location detection, account, upload or automatic saving.', 'Choose any background fields that help you explore routes.'],
 ['Editorial planning guidance, reviewed October 11, 2026.', 'Preparation and application guides · reviewed October 11, 2026.'],
 ['Fee status is not determined by a student visa alone.', 'Fee-status reference rules · reviewed October 11, 2026.'],
 ['Prerequisite and skip advice are editorial,', 'Select a subject to explore its suggested preparation.'],
 ['Source links and review dates accompany new entries.', 'Source links and review dates accompany entries.'],
 ['A source-linked starting directory, not a complete faculty database.', 'Search researchers by institution, country and mathematical topic.'],
 ['A faculty listing or published email does not establish', ''],
 ['A current academic listing or public email does not establish', ''],
 ['A listed affiliation or email is not evidence', ''],
 ['No current student vacancy is asserted.', ''],
 ['The source verifies membership of these departmental research groups,', ''],
 ['Present listing is corroborated by the current institutional faculty directory.', ''],
 ['Skip review if these skills are secure;', 'Skip familiar material, review uncertain sections, or follow a bridge resource.'],
 ['No qualifying public student event verified in this review.', 'No public student record listed for this review window.'],
 ['No separate universal research prerequisite is imposed here.', 'See the preparation listed with each advanced resource.'],
 ['Editorial route reviewed October 11, 2026.', 'Reading route reviewed October 11, 2026.'],
 ['Links point to author, university, publisher or authorized academic sources,', 'Use each resource’s access badge to choose a reading option.'],
 ['Existing print-only references are retained separately under', 'Print references are listed under “Further print reading”.'],
 ['Levels are relative to the subject:', 'Each entry includes its suggested level and preparation.'],
];
const sentences=[
 [' A faculty reply is not an admission or funding offer. No messages are sent by this website.',''],
 [' A conversation with a professor is not an admission offer or guaranteed funding.',''],
 [' A research thesis does not automatically provide a PhD position.',''],
 [' This website does not automatically monitor or send alerts for jobs.',''],
 [' Unverified fields are explicitly marked; this is not an admissions prediction.',''],
 [' Published contact is not a vacancy announcement.',''],
 [' This verifies the listed affiliation, not every possible concurrent appointment.',''],
 ['. A completion is not a recruitment/start event. No public record does not imply that the researcher is not accepting students. Public records do not establish current availability.','.'],
 ['Professional email not verified in this review. Use the linked official profile; no address is inferred from the researcher’s name.','Email: not verified.'],
 ['Destination: not verified; no current job is inferred.','Destination: not verified.'],
 ['Applies to the stated rule, not guaranteed funding or admission.',''],
 [' This is self-assessment, not a test or certification.',''],
 ['This is an editorial reading route, not a compulsory curriculum. Each resource’s own stated prerequisites take priority.','Choose an entry point that fits your preparation.'],
 ['The source establishes membership of this research team, not personal expertise in every team topic. An English group-name translation is provided for searching. ',''],
 ['The official source verifies laboratory membership. A French research-director rank does not by itself identify the employer as CNRS or the university; that employer is not inferred.','Affiliation: laboratory membership.'],
 ['I2M is a jointly affiliated laboratory. The shared laboratory label does not mean that every member is employed directly by Aix-Marseille Université or CNRS.','Affiliation: I2M joint laboratory.'],
 ['This is not a national faculty census or a ranking. Country refers to the indexed affiliation location, not citizenship. Counts do not establish supervision eligibility or current student places. A large single-school roster is still a single-institution sample.','Country denotes the indexed affiliation location.'],
 ['; it is not a list of every country in the world.','.'],
 [' No national denominator or recruitment rate is estimated.',''],
 ['Zero means a directory gap, not an absence of mathematicians or graduate programmes in the country.','No researchers indexed for this country yet.'],
 [' The Library and Reading Notes are independent sections of Mathematics Resources.',''],
];
export function cleanPageCopy(html,file){
 const name=file.replaceAll('\\','/');
 if(name==='disclaimer.html')return html;
 // Course bodies, PDF archives and authored notes are outside this copy edit.
 if(!(name.startsWith('resources/')||name.startsWith('notes/reading-notes/library')||name==='notes/mathematical-notes/page.html'))return html;
 // No record means a status, not an expandable section. Preserve its wording
 // and review window without inviting a click to an empty student list.
 html=html.replace(/<details><summary>Recent publicly documented student records \(0\)<\/summary>([\s\S]*?)<\/details>/g,
  '<div class="student-record-status">$1</div>');
 html=html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g,'<footer>© 2026 Jiayu Chen</footer>');
 html=html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g,(whole,attrs,body)=>{
  const plain=body.replace(/<[^>]*>/g,'').trim();
  if(plain.startsWith('JavaScript is off:'))return `<p${attrs}>JavaScript is off: all entries are shown. Use your browser’s Find command.</p>`;
  if(/^[\d,]+ source-linked researchers across/.test(plain)){
   const counts=plain.match(/^([\d,]+) source-linked researchers across ([\d,]+) countries\/territories/);
   const emails=plain.match(/([\d,]+) records include explicitly published professional emails/);
   return `<p${attrs}>${counts[1]} researchers across ${counts[2]} countries/territories${emails?'; '+emails[1]+' public professional emails':''}. Search by research topics, affiliation and contact information. Source dates appear with each entry.</p>`;
  }
  for(const [prefix,replacement] of paragraphs)if(plain.startsWith(prefix))return replacement?`<p${attrs}>${replacement}</p>`:'';
  let result=body;
  for(const [before,after] of sentences)result=result.split(before).join(after);
  return result.trim()?`<p${attrs}>${result}</p>`:'';
 });
 return trimCopy(html);
}
