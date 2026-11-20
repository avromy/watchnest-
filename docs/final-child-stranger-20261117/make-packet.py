from pathlib import Path
import html
root=Path(__file__).parent
screens=[
('01-entry.png','Profile chooser','Older Ari; direct /watch.','Large ownership cards, PIN badges and secondary Parent Mode are understandable.','No confusion at blind first impression.','Keep as is'),
('02-library.png','Older child Home','Picker → Ari → synthetic 1234.','Clear resume, library, favorite and request routes.','Some repeated entrances, but useful hierarchy.','Keep as is'),
('03-all-videos.png','Library first viewport','Home → Library.','Clear search and filters.','Collection tile pushes every video below the first landscape viewport. Strong recommendation C01: compact entry or stronger continuation cue.','Founder should judge'),
('04-favorites.png','Favorites','Heart on rocket → Favorites.','One saved item, correct local count.','No observed defect; durable backend persistence unproven.','Keep as is'),
('05-empty-search.png','Favorites no match','Search Favorites: zzzz.','Recovery offers all-library search.','No observed defect.','Keep as is'),
('06-search.png','Approved-library search','Search all videos → fox.','One matching approved card.','No external result.','Keep as is'),
('07-collection.png','Collection','Clear search → Little Makers.','Two-item scope, scoped search and back-out.','No observed defect.','Keep as is'),
('08-player.png','Safe player failure','Approved rocket card; provider blocked by harness.','Explains safe startup failure and offers recovery.','This is recovery evidence, not playback evidence.','Keep as is'),
('09-ask-parent.png','Ask Parent form','Back to Library → Ask Parent.','Parent-decision explanation and content type choices.','Reading required for younger child.','Keep as is'),
('10-request-sent.png','Request sent','Moon rovers → Send request.','Explicit Sent to Parent with Send another.','Delivery is a synthetic mutation only.','Keep as is'),
('11-switch.png','Profile switch chooser','Identity/switch button from child surface.','Returns to clear chooser.','Real authentication/isolation unproven.','Keep as is'),
('12-simple.png','Younger Benny portrait','Fresh simple fixture 768×1024 → Benny.','Large readable tiles, warm coherent system.','C02: nonreader independent use remains observational.','Later/beta observation'),
('13-hidden.png','Empty Hidden','Benny Library → Hidden.','Explains what appears here.','No observed defect.','Keep as is'),
('14-switched-ari.png','Shared-device Ari','Benny switch → Ari → PIN.','Correct identity and changed supplied library scope.','Stateful synthetic routes only; real isolation unproven.','Keep as is'),
('15-library-miss.png','Library missing search','Ari Library search moon.','Offers Ask Parent for exact query.','No observed defect.','Keep as is'),
('16-search-to-request.png','Search request handoff','Click Ask Parent for moon.','Textarea retains moon (inputValue observed).','No observed defect.','Keep as is'),
('17-discover-entry.png','Discover entry','Fresh enabled fixture → Discover.','Drawing boundary and parent explanation.','No observed defect.','Keep as is'),
('18-discover-result.png','Discover nonplayable result','Type fox → Search; settled final recapture.','Request control, no result player/external link.','Synthetic catalog, no live provider acceptance.','Keep as is'),
('20-stateful-request.png','Discovery waiting state','Actual Ask Parent click; stateful POST/GET fixture.','Waiting for Parent appears on result and My requests.','In-memory request persistence only.','Keep as is'),
('21-hidden-item.png','Hidden item','More options → Hide → Hidden.','Explicit hidden confirmation and Undo.','Informed follow-up after contract inspection; not blind discovery.','Keep as is'),
('22-restored.png','Restored library','Hidden item More options → Restore → All videos.','Rocket back among three videos.','Synthetic local mutation only.','Keep as is'),
('23-timeup.png','Time up','Fresh context; supplied expired access.','Calm clear explanation; Choose profile exit.','Remote audiovisual stop unproven.','Keep as is'),
('24-timeup-picker.png','Time-up exit','Choose profile; settled after navigation.','Picker reached.','No observed defect.','Keep as is')]
css='body{margin:0;background:#f7f5ef;color:#173d33;font:16px system-ui}header{padding:24px}article{display:grid;grid-template-columns:minmax(400px,2fr) minmax(280px,1fr);gap:24px;padding:24px;border-top:1px solid #bcc9c0}img{max-width:100%;height:auto;border:1px solid #ccd6cf}aside{background:white;padding:24px;border-radius:16px;align-self:start}label{display:block;margin:10px 0}textarea{width:95%;min-height:80px}small{color:#536a60}@media(max-width:800px){article{display:block}aside{margin-top:16px}}'
parts=[f'<!doctype html><meta charset="utf-8"><title>Child Stranger visual packet</title><style>{css}</style><header><h1>WatchNest child/shared-device review</h1><p>Bounded synthetic interaction PASS. Candidate382 source/build mapping and limits are in FinalChildStranger-20261117.md. Independent observations; no P0 objective defects.</p></header>']
for f,title,route,works,concerns,disposition in screens:
 assert (root/f).exists(),f
 parts.append('<article><div><img src="'+f+'" alt="'+html.escape(title)+'"></div><aside><h2>'+html.escape(title)+'</h2><p><b>Reach / persona:</b> '+html.escape(route)+'</p><p><b>Purpose:</b> child library/request/profile operation.</p><p><b>Works:</b> '+html.escape(works)+'</p><p><b>Confusion / objective defects / recommendations:</b> '+html.escape(concerns)+'</p><p><b>Disposition:</b> '+html.escape(disposition)+'</p><p>Founder decision (local review field):</p>'+''.join('<label><input type="radio" name="'+f+'"> '+x+'</label>' for x in ['Approve as is','Approve recommendation','Reject recommendation','Modify/comment'])+'<textarea aria-label="Comment for '+html.escape(title)+'"></textarea><p><small>'+f+' · Current actual browser screenshot</small></p></aside></article>')
(root/'visual-packet.html').write_text(''.join(parts))
print(f'{len(screens)} screenshot review units verified')
