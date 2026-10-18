# Chinese versions of the existing study guides

Translation date: 2026-10-18. English source revision:
`a89574f789399ede17c169c476a5eaa9778813ac`.

Eight existing guides are translated in full: Reading a mathematics text, the
five study guides and the two connecting essays. This includes their summaries,
paragraphs, proofs, examples, related-subject links, reference locators, page
contents and authorship/reuse information. Source dates are not changed to the
translation date. Original Markdown and source metadata remain unchanged.

The Chinese versions use direct explanations and short, descriptive headings,
without invented personal experience, jokes or promises about learning outcomes.
No recommendations, arguments or distinctive wording are copied from outside
Chinese articles. The optional AI-assisted drafting disclosure is retained and
translated, not removed to suggest human-only authorship.

Reading for tone, not new mathematical evidence or endorsement:

- [A Chinese discussion of learning linear algebra](https://www.zhihu.com/tardis/sogou/qus/36282065).
- [Xinyi Yuan, 学习代数几何的建议, v2](https://faculty.hfut.edu.cn/_resources/group1/M00/00/1F/rB_zSGnvYiGAYd3xAARoeoHlGWI281.pdf).

The translated Markdown is under `content/guide-translations-zh/`. Metadata is in
`data/translations/guides.mjs`. Both views use the original renderer and share
every canonical heading ID. The existing per-page language-switch mechanism is
reused; no global interface assets or original subject translations are changed.

The localization test now checks eight translations, 116 rendered paragraphs
and 164 mathematical expressions, as well as all reference/navigation URLs,
authorship, dates, heading IDs and exact committed payloads. Fixed English input
digests make later source changes require translation review, rather than silently
claiming the Chinese is still current. English remains complete without JavaScript.

This release does not claim that encyclopedic articles, admission records or
catalogue descriptions have all been translated.
