/* site-data.js — loads data/site.json and fills the pages that opt in.
   Static markup stays in the HTML as the instant-paint version; this
   replaces it once the data file arrives. Content is edited in Admin. */
(function () {
  var WORDS = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function yearsSince(iso) {
    if (!iso) return 0;
    var p = String(iso).split('-');
    var start = new Date(Number(p[0]), (Number(p[1]) || 1) - 1, Number(p[2]) || 1);
    var now = new Date();
    var y = now.getFullYear() - start.getFullYear();
    var m = now.getMonth() - start.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < start.getDate())) y--;
    return Math.max(0, y);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function get(obj, path) {
    return String(path).split('.').reduce(function (o, k) { return (o == null ? undefined : o[k]); }, obj);
  }

  function tokens(data) {
    var y = yearsSince(get(data, 'meta.experienceStart'));
    return {
      years: String(y),
      yearsWord: cap(WORDS[y] || String(y)),
      nowYear: String(new Date().getFullYear()),
      indexStartYear: String(get(data, 'meta.indexStartYear') || 2020)
    };
  }

  function fill(str, t) {
    return String(str == null ? '' : str).replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, k) {
      return t[k] != null ? t[k] : m;
    });
  }

  var S = {
    mono: 'font-family:ui-monospace,SFMono-Regular,Menlo,monospace',
    hatch: 'background:var(--bg);background-image:repeating-linear-gradient(135deg,var(--line) 0px,var(--line) 1px,transparent 1px,transparent 9px);border:1px solid var(--line)'
  };

  var HIDE = HIDE;

  function num(i) { return (i + 1 < 10 ? '0' : '') + (i + 1); }

  function metaLine(p) {
    var cats = (p.cats || []).join(' · ');
    return [cats, p.year].filter(Boolean).join(' · ');
  }

  function media(p, ratio, label) {
    if (p.cover) {
      return '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" style="width:100%;aspect-ratio:' + ratio + ';object-fit:contain;background:#171717;border:1px solid var(--line);display:block" />';
    }
    return '<div style="position:relative;width:100%;aspect-ratio:' + ratio + ';' + S.hatch + ';display:flex;align-items:flex-end;padding:16px">' +
      '<span style="' + S.mono + ';font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:var(--fg-45)">' + esc(p.placeholder || label) + '</span></div>';
  }

  function projectHref(p) {
    return p.link ? p.link : 'project.html?p=' + encodeURIComponent(p.id || '');
  }

  var render = {
    workChips: function (data) {
      var cats = ['All'].concat(data.categories || []);
      var current = 'All';
      var live = document.querySelector('[data-filter][data-active="1"]');
      if (live) current = live.getAttribute('data-filter');
      return cats.map(function (c) {
        var on = c === current;
        return '<button type="button" data-filter="' + esc(c) + '"' + (on ? ' data-active="1"' : '') + ' style="cursor:pointer;font-family:inherit;background:transparent;border:1px solid ' +
          (on ? 'var(--fg)' : 'var(--line-strong)') + ';border-radius:999px;padding:7px 16px;font-size:13px;color:' +
          (on ? 'var(--fg)' : 'var(--fg-60)') + ';transition:border-color .2s, color .2s">' + esc(c) + '</button>';
      }).join('');
    },

    workGrid: function (data) {
      return (data.projects || []).filter(function (p) { return p.published !== false; }).map(function (p, i) {
        return '<a href="' + esc(projectHref(p)) + '" data-reveal="" data-cats="' + esc((p.cats || []).join('|')) + '" style="display:flex;flex-direction:column;gap:18px;color:var(--fg)">' +
          media(p, '4/3', 'Case image') +
          '<div class="project-card-caption" style="display:flex;align-items:baseline;justify-content:space-between;gap:24px;border-top:1px solid var(--line);padding-top:14px">' +
            '<div style="display:flex;align-items:baseline;gap:14px"><span style="' + S.mono + ';font-size:12px;color:var(--fg-45)">' + num(i) + '</span>' +
            '<span style="font-size:clamp(17px,1.8vw,22px);font-weight:500;letter-spacing:-0.02em">' + esc(p.title) + '</span></div>' +
            '<span style="font-size:13px;color:var(--fg-50);white-space:nowrap">' + esc(metaLine(p)) + '</span>' +
          '</div></a>';
      }).join('');
    },

    featured: function (data) {
      var list = (data.projects || []).filter(function (p) { return p.published !== false && p.featured; });
      if (!list.length) return '';
      function card(p, i, ratio) {
        return '<a href="' + esc(projectHref(p)) + '" data-reveal="" style="display:flex;flex-direction:column;gap:18px;color:var(--fg)">' +
          media(p, ratio, 'Case image') +
          '<div class="project-card-caption" style="display:flex;align-items:baseline;justify-content:space-between;gap:24px;border-top:1px solid var(--line);padding-top:14px">' +
            '<div style="display:flex;align-items:baseline;gap:14px"><span style="' + S.mono + ';font-size:12px;color:var(--fg-45)">' + num(i) + '</span>' +
            '<span style="font-size:clamp(18px,2vw,24px);font-weight:500;letter-spacing:-0.02em">' + esc(p.featuredTitle || p.title) + '</span></div>' +
            '<span style="font-size:13px;color:var(--fg-50);white-space:nowrap">' + esc(metaLine(p)) + '</span>' +
          '</div></a>';
      }
      var out = card(list[0], 0, '16/9');
      var rest = list.slice(1), row = [];
      rest.forEach(function (p, k) {
        row.push(card(p, k + 1, '4/3'));
        if (row.length === 2 || k === rest.length - 1) {
          out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:clamp(32px,4vw,56px)">' + row.join('') + '</div>';
          row = [];
        }
      });
      return out;
    },

    homeIntro: function (data, t) {
      return (get(data, 'home.introParas') || []).map(function (p) {
        return '<p style="font-size:clamp(15px,1.5vw,18px);line-height:1.7;color:var(--fg-60);text-wrap:pretty">' + esc(fill(p, t)) + '</p>';
      }).join('');
    },

    homeStats: function (data, t) {
      return (get(data, 'home.stats') || []).map(function (s) {
        return '<div style="background:var(--bg);box-shadow:0 0 0 1px var(--line);padding:32px 28px;display:flex;flex-direction:column;gap:10px">' +
          '<span style="font-size:clamp(28px,3vw,40px);font-weight:500;letter-spacing:-0.03em">' + esc(fill(s.value, t)) + '</span>' +
          '<span style="font-size:13px;line-height:1.6;color:var(--fg-50)">' + esc(fill(s.label, t)) + '</span></div>';
      }).join('');
    },

    aboutIntro: function (data, t) {
      return (get(data, 'about.intro') || []).map(function (p) {
        return '<p style="font-size:clamp(15px,1.6vw,18px);line-height:1.7;color:var(--fg-60);text-wrap:pretty">' + esc(fill(p, t)) + '</p>';
      }).join('');
    },

    experience: function (data) {
      var rows = get(data, 'about.experience') || [];
      return rows.map(function (r, i) {
        var last = i === rows.length - 1;
        return '<div data-reveal="" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:clamp(16px,3vw,48px);border-top:1px solid var(--line);' +
          (last ? 'border-bottom:1px solid var(--line);' : '') + 'padding:clamp(26px,3.5vh,40px) 0">' +
          '<span style="font-size:14px;color:var(--fg-50)">' + esc(r.period) + '</span>' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            '<h3 style="font-size:clamp(19px,2.2vw,26px);font-weight:500;letter-spacing:-0.02em">' + esc(r.role) + '</h3>' +
            '<span style="font-size:14px;color:var(--fg-60)">' + esc(r.org) + '</span></div>' +
          '<p style="font-size:15px;line-height:1.7;color:var(--fg-60);text-wrap:pretty">' + esc(r.body) + '</p></div>';
      }).join('');
    },

    recognition: function (data) {
      return (get(data, 'about.recognition') || []).map(function (r) {
        return '<div style="display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--line);padding:clamp(18px,2.5vh,24px) 0">' +
          '<span style="font-size:14px;color:var(--fg-50)">' + esc(r.date) + '</span>' +
          '<p style="font-size:15px;line-height:1.7;color:var(--fg-80);text-wrap:pretty">' + esc(r.body) + '</p></div>';
      }).join('');
    },

    languages: function (data) {
      return (get(data, 'about.languages') || []).map(function (r) {
        return '<div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:12px 24px;border-top:1px solid var(--line);padding:16px 0">' +
          '<span style="font-size:16px;color:var(--fg)">' + esc(r.name) + '</span>' +
          '<span style="font-size:14px;color:var(--fg-50)">' + esc(r.level) + '</span></div>';
      }).join('');
    },

    skills: function (data) {
      return (data.skills || []).map(function (s, i) {
        return '<div style="background:var(--bg);box-shadow:0 0 0 1px var(--line);padding:clamp(26px,3vw,38px);display:flex;flex-direction:column;gap:14px">' +
          '<span style="' + S.mono + ';font-size:12px;color:var(--fg-45)">' + num(i) + '</span>' +
          '<h3 style="font-size:clamp(19px,2.1vw,25px);font-weight:500;letter-spacing:-0.02em">' + esc(s.title) + '</h3>' +
          '<p style="font-size:15px;line-height:1.65;color:var(--fg-60);text-wrap:pretty">' + esc(s.body) + '</p>' +
          '<span style="margin-top:4px;font-size:12px;line-height:1.7;color:var(--fg-45)">' + esc(s.tags) + '</span></div>';
      }).join('');
    },

    software: function (data) {
      return (data.software || []).map(function (s) {
        return '<div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:12px 24px;border-top:1px solid var(--line);padding:16px 0">' +
          '<span style="font-size:16px;color:var(--fg)">' + esc(s.name) + '</span>' +
          '<span style="font-size:14px;color:var(--fg-50);text-align:right;text-wrap:pretty">' + esc(s.note) + '</span></div>';
      }).join('');
    },

    services: function (data) {
      return (data.services || []).map(function (s, i) {
        return '<div style="display:flex;align-items:baseline;gap:14px;border-top:1px solid var(--line);padding:16px 0">' +
          '<span style="' + S.mono + ';font-size:12px;color:var(--fg-45)">' + num(i) + '</span>' +
          '<span style="font-size:16px;color:var(--fg-80)">' + esc(s) + '</span></div>';
      }).join('');
    },

    toolGroups: function (data) {
      var groups = data.toolGroups || [], out = '', pair = [];
      groups.forEach(function (g, i) {
        pair.push('<div style="background:var(--bg);box-shadow:0 0 0 1px var(--line);padding:clamp(26px,3vw,36px);display:flex;flex-direction:column;gap:18px">' +
          '<span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--fg-45)">' + esc(g.label) + '</span>' +
          '<div style="display:flex;flex-direction:column;gap:10px;font-size:15px;color:var(--fg-80)">' +
            (g.items || []).map(function (it) { return '<span>' + esc(it) + '</span>'; }).join('') +
          '</div></div>');
        if (pair.length === 2 || i === groups.length - 1) {
          out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1px">' + pair.join('') + '</div>';
          pair = [];
        }
      });
      return out;
    },

    socials: function (data) {
      var arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';
      return (get(data, 'contact.socials') || []).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noreferrer" style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:16px;border-top:1px solid var(--line);padding:clamp(18px,3vh,26px) 0;color:var(--fg);transition:color .2s ease">' +
          '<span style="font-size:clamp(20px,2.6vw,30px);font-weight:500;letter-spacing:-0.02em">' + esc(s.label) + '</span>' +
          '<span style="display:inline-flex;align-items:center;gap:10px;padding-right:8px;font-size:14px;color:var(--fg-50)">' + esc(s.handle) + arrow + '</span></a>';
      }).join('');
    },

    socialsList: function (data) {
      var arrow = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>';
      return (get(data, 'contact.socials') || []).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noreferrer" style="display:flex;align-items:baseline;justify-content:space-between;gap:16px;border-top:1px solid var(--line);padding:14px 0;color:var(--fg)">' +
          '<span style="font-size:16px">' + esc(s.label) + '</span>' +
          '<span style="display:inline-flex;align-items:center;gap:10px;padding-right:8px;font-size:14px;color:var(--fg-50)">' + esc(s.handle) + arrow + '</span></a>';
      }).join('');
    },

    projectHero: function (data) {
      var p = data.__project;
      if (!p) return '<div style="display:flex;flex-direction:column;gap:18px"><h1 style="font-size:clamp(32px,6vw,68px);font-weight:500;line-height:1.08;letter-spacing:-0.03em">This project is not published.</h1></div>';
      var kicker = metaLine(p);
      var head = '<div style="display:flex;flex-direction:column;gap:18px">' +
        (kicker ? '<span style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-45)">' + esc(kicker) + '</span>' : '') +
        '<h1 style="font-size:clamp(32px,6vw,68px);font-weight:500;line-height:1.08;letter-spacing:-0.03em;text-wrap:pretty">' + esc(p.title || 'Untitled project') + '</h1></div>';
      var sum = p.summary ? '<p style="font-size:clamp(15px,1.6vw,18px);line-height:1.7;color:var(--fg-60);max-width:460px;text-wrap:pretty">' + esc(p.summary) + '</p>' : '';
      return head + sum;
    },

    projectHeroImage: function (data) {
      var p = data.__project;
      if (!p || !p.cover) return HIDE;
      return '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" style="width:100%;aspect-ratio:16/9;object-fit:contain;background:#171717;border:1px solid var(--line);display:block" />';
    },

    projectMeta: function (data) {
      var p = data.__project;
      if (!p) return HIDE;
      var cells = [
        ['Client', p.client],
        ['Year', p.year],
        ['Categories', (p.cats || []).join(' · ')],
        ['Role', p.role]
      ].filter(function (c) { return c[1]; });
      if (!cells.length) return HIDE;
      return cells.map(function (c) {
        return '<div style="background:var(--bg);box-shadow:0 0 0 1px var(--line);padding:clamp(24px,3vw,32px);display:flex;flex-direction:column;gap:8px">' +
          '<span style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:var(--fg-45)">' + esc(c[0]) + '</span>' +
          '<span style="font-size:16px;color:var(--fg-80)">' + esc(c[1]) + '</span></div>';
      }).join('');
    },

    projectBody: function (data) {
      var p = data.__project;
      if (!p || !p.body) return HIDE;
      return String(p.body).split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) {
        return '<p style="font-size:clamp(15px,1.5vw,18px);line-height:1.7;color:var(--fg-60);text-wrap:pretty">' + esc(s) + '</p>';
      }).join('');
    },

    projectEventStudy: function (data) {
      var p = data.__project;
      if (!p || !p.eventStudy) return HIDE;
      var study = p.eventStudy;
      var viewer = '';
      if (study.modelViewer) {
        var v = study.modelViewer;
        var uid = /^[a-f0-9]{32}$/.test(v.sketchfabUid || '') ? v.sketchfabUid : '';
        var modelImage = '<img src="' + esc(v.poster) + '" width="1600" height="1000" alt="Cropped isometric view of the D5 event footprint" loading="eager" decoding="async">';
        var surface = uid ? '<iframe src="https://sketchfab.com/models/' + uid + '/embed?autostart=1&amp;preload=1&amp;ui_infos=0&amp;ui_controls=0&amp;ui_general_controls=0&amp;ui_annotations=0&amp;ui_animations=0&amp;camera=0&amp;ui_stop=0&amp;ui_inspector=0&amp;ui_help=0&amp;ui_settings=0&amp;ui_vr=0&amp;ui_fullscreen=0&amp;ui_hint=0&amp;ui_theme=dark" title="YaLLa Compass D5 interactive event model" loading="eager" allow="fullscreen; xr-spatial-tracking" allowfullscreen></iframe>' : modelImage;
        viewer = '<section class="event-chapter" id="event-model"><div class="case-heading"><span class="case-kicker">D5 / EVENT FOOTPRINT</span><h2>The event, in perspective.</h2><p>The stage, audience and surrounding event zones presented as one compact spatial model. The unused floor extension and outer room shell are removed for a clear view.</p></div><figure class="event-model-viewer">' + surface + (uid ? '' : '<figcaption>Isometric view from the original D5 model · Original event artwork and materials, adapted for the web.</figcaption>') + '</figure></section>';
      }
      function imageFigure(image) {
        return '<figure class="event-figure"><a href="' + esc(image.src) + '" target="_blank" rel="noopener" aria-label="View full size: ' + esc(image.caption) + '"><img src="' + esc(image.src) + '" width="' + esc(image.width) + '" height="' + esc(image.height) + '" alt="' + esc(image.caption) + '" loading="eager" decoding="async"></a><figcaption>' + esc(image.caption) + '</figcaption></figure>';
      }
      var journey = '<section class="event-chapter" id="event-journey"><div class="case-heading"><span class="case-kicker">02 / SPECTATOR EXPERIENCE</span><h2>Think in moments, not just meters.</h2><p>The visitor’s experience connects the surrounding event spaces to the match. This overview makes that relationship visible.</p></div><ol class="event-journey">' + study.journey.map(function (step, index) {
        return '<li><span class="event-step">0' + (index + 1) + '</span><img src="' + esc(step.image.src) + '" alt="' + esc(step.title) + ' design reference" loading="eager" decoding="async"><h3>' + esc(step.title) + '</h3><p>' + esc(step.body) + '</p>' + (index < study.journey.length - 1 ? '<span class="event-arrow" aria-hidden="true">→</span>' : '') + '</li>';
      }).join('') + '</ol><p class="case-source">' + esc(study.journeyNote) + '</p></section>';
      var chapters = study.chapters.map(function (chapter, index) {
        var notes = (chapter.notes || []).map(function (note) { return '<div><h3>' + esc(note.title) + '</h3><p>' + esc(note.body) + '</p></div>'; }).join('');
        return '<section class="event-chapter" id="event-' + esc(chapter.id) + '"><div class="case-heading"><span class="case-kicker">' + esc(chapter.kicker) + '</span><h2>' + esc(chapter.title) + '</h2><p>' + esc(chapter.body) + '</p></div><div class="event-image-grid">' + chapter.images.map(imageFigure).join('') + '</div>' + (notes ? '<div class="event-decisions">' + notes + '</div>' : '') + '</section>' + (index === 0 ? journey + viewer : '');
      }).join('');
      var models = study.sourceModels.map(function (model) {
        var title = model.file.split('/').pop().replace('.blend', '').replace('Satge', 'Stage');
        return '<figure><a href="' + esc(model.preview) + '" target="_blank" rel="noopener" aria-label="View full model render: ' + esc(title) + '"><img src="' + esc(model.preview) + '" width="1280" height="720" alt="Clay render from original Blender model: ' + esc(title) + '" loading="eager" decoding="async"></a><figcaption>' + esc(title) + ' · Geometry study</figcaption></figure>';
      }).join('');
      return '<div class="event-study"><section class="event-intro"><span class="case-kicker">SPATIAL DESIGN / STAGE DESIGN / VISITOR EXPERIENCE</span><h2>A stage is only part of the experience.</h2><p>' + esc(study.context) + '</p><div class="event-scope"><div><span>MY CONTRIBUTION</span><p>Venue study, spectator experience planning, stage design, spatial layouts and 3D visualisation.</p></div><div><span>PROJECT MATERIAL</span><p>Original drawings, dimensioned studies, archived Blender previews and rendered design iterations.</p></div></div></section><nav class="event-index" aria-label="Case study chapters">' + study.chapters.map(function (c) { return '<a href="#event-' + esc(c.id) + '">' + esc(c.id === 'supporting' ? 'Supporting spaces' : c.id === 'alternate' ? 'Alternate venue' : cap(c.id)) + '</a>'; }).join('') + (study.modelViewer ? '<a href="#event-model">Event model</a>' : '') + '<a href="#event-journey">Visitor journey</a></nav>' + chapters + '<section class="event-chapter"><div class="case-heading"><span class="case-kicker">PROCESS ARCHIVE</span><h2>The files behind the space.</h2><p>Seven numbered stage revisions, two alternate stage models, a group-stage room and a vendor-zone study.</p></div><details class="event-model-archive"><summary>Explore all 11 Blender model renders <span aria-hidden="true">＋</span></summary><p class="case-source">New clay renders made from the original Blender models. Neutral surfaces reveal the geometry, proportions and spatial arrangement beneath the finished materials. Select a render to view it full size.</p><div class="event-model-grid">' + models + '</div></details></section></div>';
    },

    projectSections: function (data) {
      var p = data.__project;
      if (!p || !(p.sections || []).length) return HIDE;
      return p.sections.map(function (section) {
        var steps = (section.steps || []).map(function (step, i) {
          return '<li style="flex:1;min-width:150px;background:#102522;border:1px solid #1bdd8640;border-radius:16px;padding:20px;list-style:none"><span style="display:block;color:#1bdd86;font-size:12px;margin-bottom:12px">' + (i + 1) + '</span>' + esc(step) + '</li>';
        }).join('');
        return '<article class="' + (p.process ? 'case-decision' : '') + '" style="padding:clamp(24px,4vw,48px);border:1px solid var(--line);border-radius:20px"><h2 style="font-size:clamp(22px,3vw,32px);line-height:1.2;margin-bottom:20px">' + esc(section.title) + '</h2><p style="max-width:850px;line-height:1.8;color:var(--fg-60)">' + esc(section.body) + '</p>' + (steps ? '<ol aria-label="' + esc(section.title) + '" style="display:flex;flex-wrap:wrap;gap:12px;padding:0;margin:28px 0 0;color:#fff">' + steps + '</ol>' : '') + '</article>';
      }).join('');
    },

    projectBrand: function (data) {
      var p = data.__project;
      if (!p || !p.brand) return HIDE;
      return '<section class="case-study-block brand-story"><div class="case-heading"><span class="case-kicker">01 / BRAND IDENTITY</span><h2>Built for the thrill of play.</h2><p>An angular wordmark, an electric green accent and deep ink backgrounds give DICEON a recognisable identity across games, rewards and account experiences.</p></div><div class="brand-logo-stage"><img src="' + esc(p.brand.logo) + '" alt="Original DICEON angular wordmark"><span>PLAY &amp; WIN</span></div><div class="brand-foundations"><div class="brand-swatch" style="background:#21e786;color:#081319"><span>Electric green</span><strong>#21E786</strong></div><div class="brand-swatch" style="background:#081319;color:#fff"><span>Deep ink</span><strong>#081319</strong></div><div class="brand-swatch" style="background:#f3f7f4;color:#081319"><span>Soft white</span><strong>#F3F7F4</strong></div></div><div class="brand-type"><span class="case-kicker">TYPE / ROBOTO</span><h3>Play. Win. Repeat.</h3><p>Clear sans-serif typography supports the expressive wordmark. Bold headings lead; quiet labels keep the interface readable.</p><span class="brand-alphabet">Aa Bb Cc Dd Ee Ff Gg · 0123456789</span></div><figure class="brand-application"><img src="' + esc(p.brand.image) + '" alt="DICEON identity applied to membership cards, stationery and a tote" loading="eager" decoding="async"><figcaption>Brand application study · New mockups created for this case study with AI assistance.</figcaption></figure></section>';
    },

    projectJourney: function (data) {
      var p = data.__project;
      if (!p || !p.journey) return HIDE;
      var j = p.journey;
      if (j.visualFlows) {
        var flows = j.visualFlows.map(function (flow) {
          var paths = flow.paths.map(function (path) {
            return '<ol class="case-flow-path" aria-label="' + esc(flow.title) + '">' + path.map(function (screen, i) {
              return '<li class="case-flow-node"><a href="' + esc(screen.src) + '" target="_blank" rel="noopener" aria-label="View ' + esc(screen.label) + ' full size"><img src="' + esc(screen.src) + '" alt="DICEON ' + esc(screen.label) + '" width="720" height="1600" loading="eager" decoding="async"></a><span>' + esc(screen.label) + '</span></li>' + (i < path.length - 1 ? '<li class="case-flow-arrow" aria-hidden="true">→</li>' : '');
            }).join('') + '</ol>';
          }).join('');
          return '<article class="case-flow"><header><h3>' + esc(flow.title) + '</h3><p>' + esc(flow.body) + '</p></header>' + paths + '</article>';
        }).join('');
        return '<section class="case-study-block"><div class="brand-divider"><img src="' + esc(p.brand.logo) + '" alt="DICEON wordmark"><span>THE IDENTITY, IN MOTION.</span></div><div class="case-heading"><span class="case-kicker">USER JOURNEY / VISUAL OVERVIEW</span><h2>From first tap to play.</h2><p>A curated view of the core experience: ' + j.selectedScreens + ' distinct screens, connected in compact visual paths. Select a screen to inspect the interface.</p></div><div class="case-flow-board">' + flows + '</div><p class="case-source">Simplified experience paths based on the archived XD prototype. Intermediate loading, animation frames, repeated variants and device captures are omitted. Arrows summarise the journey rather than every recorded transition.</p></section>';
      }
      return '<section class="case-study-block"><div class="case-heading"><span class="case-kicker">THE FULL XD PROTOTYPE</span><h2>Every branch. Every state.</h2><p>' + j.boards + ' artboards and ' + j.connections + ' recorded connections, extracted from the dev-team file. Follow onboarding, discovery, game entry, matchmaking, tournaments, wallet, vouchers and support.</p></div><div class="case-journey-grid">' + j.groups.map(function (g) { return '<div><span>' + g.count + ' states</span><h3>' + esc(g.name) + '</h3></div>'; }).join('') + '</div><a class="case-journey-link" href="diceon-journey.html">Explore the complete user journey ↗</a><p class="case-source">Actual XD interaction data. Includes alternative and unconnected states. All 68 screens are shown below and in the connected journey explorer. Rendered from original XD layers; typography and effects may differ slightly from native XD exports.</p></section>';
    },

    projectProcess: function (data) {
      var p = data.__project;
      if (!p || !p.process) return HIDE;
      var study = p.process;
      var wires = study.wireframes.map(function (wire) {
        return '<figure class="case-wire"><img loading="eager" decoding="async" src="' + esc(wire.src) + '" alt="Reconstructed DICEON ' + esc(wire.label) + ' wireframe"/><figcaption>' + esc(wire.label) + '</figcaption></figure>';
      }).join('');
      return '<section class="case-study-block"><div class="case-heading"><span class="case-kicker">01 / SKETCH EXPLORATIONS</span><h2>' + esc(study.title) + '</h2><p>' + esc(study.body) + '</p></div><figure class="case-sketch"><img loading="eager" decoding="async" src="' + esc(study.sketch) + '" alt="Reconstructed pencil explorations of DICEON entry, discovery and rewards layouts"/><figcaption>Reconstructed exploration · Created for this case study using AI assistance.</figcaption></figure></section><section class="case-study-block"><div class="case-heading"><span class="case-kicker">02 / LOW-FIDELITY STRUCTURE</span><h2>Hierarchy before styling.</h2><p>Account actions, game choices and reward activities reduced to their essential layout. Neutral blocks make spacing and priority easier to compare.</p></div><div class="case-wire-grid">' + wires + '</div><p class="case-source">Reconstructed wireframes based on archived screens.</p></section>';
    },

    projectScreens: function (data) {
      var p = data.__project;
      if (p && p.brand) return '<section class="brand-finale"><img src="' + esc(p.brand.logo) + '" alt="DICEON wordmark"><h2>One identity.<br>Every touchpoint.</h2></section>';
      if (!p || !(p.screenGroups || []).length) return HIDE;
      return p.screenGroups.map(function (group) {
        var screens = group.screens.map(function (screen) {
          return '<figure style="margin:0;width:min(100%,270px);min-width:0"><a href="' + esc(screen.src) + '" target="_blank" rel="noopener" aria-label="View full ' + esc(screen.label) + ' screen" style="display:block;border:7px solid #263330;border-radius:30px;overflow:hidden;box-shadow:0 24px 60px #0006;background:#081319"><img src="' + esc(screen.src) + '" alt="DICEON ' + esc(screen.label) + ' interface" loading="eager" decoding="async" style="display:block;width:100%;height:auto" /></a><figcaption style="margin-top:20px;color:#fff;font-size:15px;line-height:1.5">' + esc(screen.label) + '<span style="display:block;margin-top:6px;font-size:11px;color:#a4b7b0">' + esc(screen.source) + ' · Click to view full size</span></figcaption></figure>';
        }).join('');
        return '<article style="background:linear-gradient(145deg,#0d2420,#080f13);padding:clamp(24px,5vw,64px);border-radius:24px;border:1px solid #274039;margin-bottom:32px"><div style="max-width:660px;margin-bottom:40px"><span style="font-size:11px;letter-spacing:.12em;color:#21e786">' + esc(group.eyebrow) + '</span><h2 style="font-size:clamp(26px,4vw,42px);font-weight:500;letter-spacing:-.03em;line-height:1.12;color:#fff;margin:16px 0">' + esc(group.title) + '</h2><p style="font-size:15px;line-height:1.8;color:#a4b7b0">' + esc(group.body) + '</p></div><div style="display:flex;justify-content:center;align-items:start;flex-wrap:wrap;gap:clamp(24px,5vw,72px)">' + screens + '</div></article>';
      }).join('');
    },

    projectMedia: function (data) {
      var p = data.__project;
      if (!p || !p.media) return HIDE;
      var items = p.media.map(function (m) {
        if (m.presentation === 'breakdown') {
          var notes = (m.notes || []).map(function (note, index) {
            return '<div class="breakdown-note"><span>0' + (index + 1) + '</span><h3>' + esc(note.title) + '</h3><p>' + esc(note.body) + '</p></div>';
          });
          return '<article class="broadcast-breakdown"><header><span class="case-kicker">BEHIND THE VISUAL</span><h2>Key Visual Breakdown</h2><p>From individual layers to a complete world. A closer look at how this campaign visual comes together.</p></header><div class="breakdown-layout"><aside class="breakdown-notes">' + notes.slice(0, 2).join('') + '</aside><figure class="broadcast-image"><img class="broadcast-motion" src="' + esc(m.poster) + '" data-motion-src="' + esc(m.src) + '" data-motion-poster="' + esc(m.poster) + '" alt="' + esc(m.label) + '" loading="eager" decoding="async"><figcaption>' + esc(m.label) + ' · Layer by layer</figcaption></figure><aside class="breakdown-notes">' + notes.slice(2).join('') + '</aside></div></article>';
        }
        if (m.type === 'motion') return '<figure class="broadcast-image"><img class="broadcast-motion" src="' + esc(m.poster) + '" data-motion-src="' + esc(m.src) + '" data-motion-poster="' + esc(m.poster) + '" alt="' + esc(m.label) + '" loading="eager" decoding="async"><figcaption>' + esc(m.label) + '</figcaption></figure>';
        if (m.type === 'image') return '<figure class="broadcast-image"><img src="' + esc(m.src) + '" alt="' + esc(m.label) + '" loading="eager" decoding="async"></figure>';
        var src = m.type === 'youtube' ? 'https://www.youtube.com/embed/' + encodeURIComponent(m.id) + '?rel=0' : 'https://player.vimeo.com/video/' + encodeURIComponent(m.id);
        return '<figure class="broadcast-video"><iframe src="' + src + '" title="' + esc(m.label) + '" loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe><figcaption>' + esc(m.label) + '</figcaption></figure>';
      }).join('');
      var credits = Object.keys(p.credits || {}).map(function (key) { return '<div><dt>' + esc(key) + '</dt><dd>' + esc(p.credits[key]) + '</dd></div>'; }).join('');
      return '<section class="case-study-block"><div class="case-heading"><span class="case-kicker">CAMPAIGN / BROADCAST / MOTION</span><h2>A galaxy built for competition.</h2><p>The complete published project, with original artwork, animated assets and both motion showcases in their Behance sequence.</p></div><div class="broadcast-media">' + items + '</div><dl class="broadcast-credits">' + credits + '</dl><a class="case-journey-link" href="' + esc(p.sourceUrl) + '" target="_blank" rel="noopener">View the original Behance project ↗</a></section>';
    },

    projectGallery: function (data) {
      var p = data.__project;
      if (!p || !(p.gallery || []).length) return HIDE;
      return p.gallery.map(function (src, index) {
        var caption = (p.galleryCaptions || [])[index];
        return '<figure style="margin:0;min-width:0"><img loading="eager" decoding="async" src="' + esc(src) + '" alt="' + esc(p.title) + '" style="width:100%;object-fit:contain;background:#171717;border:1px solid var(--line);display:block" />' + (caption ? '<figcaption style="font-size:13px;line-height:1.6;color:var(--fg-60);padding-top:12px">' + esc(caption) + '</figcaption>' : '') + '</figure>';
      }).join('');
    },

    projectNext: function (data) {
      var list = (data.projects || []).filter(function (x) { return x.published !== false; });
      var p = data.__project;
      if (!p || list.length < 2) return HIDE;
      var i = 0;
      for (var k = 0; k < list.length; k++) if (list[k].id === p.id) i = k;
      var n = list[(i + 1) % list.length];
      var href = 'project.html?p=' + encodeURIComponent(n.id);
      var arrow = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
      return '<span data-reveal="" style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-45)">Next project</span>' +
        '<div data-reveal="" style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:20px;border-top:1px solid var(--line);padding:clamp(24px,4vh,40px) 0;color:var(--fg)">' +
          '<span style="font-size:clamp(24px,4vw,44px);font-weight:500;letter-spacing:-0.03em">' + esc(n.title) + '</span>' +
          '<a href="' + href + '" style="display:inline-flex;align-items:center;gap:10px;padding-right:8px;font-size:14px;color:var(--fg-50)">' + esc(metaLine(n)) + arrow + '</a></div>' +
        (n.cover ? '<a href="' + href + '" data-reveal="" style="display:block;position:relative;width:100%"><img src="' + esc(n.cover) + '" alt="' + esc(n.title) + '" style="width:100%;aspect-ratio:21/9;object-fit:contain;background:#171717;border:1px solid var(--line);display:block" /></a>' : '');
    },

    socialsInline: function (data) {
      return (get(data, 'contact.socials') || []).filter(function (s) { return s.url && s.url !== '#'; }).map(function (s) {
        return '<a href="' + esc(s.url) + '" target="_blank" rel="noreferrer" style="font-size:13px;color:var(--fg-60)">' + esc(s.label) + '</a>';
      }).join('');
    }
  };

  function currentProject(data) {
    var id = null;
    try { id = new URLSearchParams(location.search).get('p'); } catch (e) {}
    var list = (data.projects || []).filter(function (p) { return p.published !== false; });
    if (!list.length) return null;
    if (!id) return list[0];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function restore(el) {
    if (el.dataset.prevDisplay) {
      el.style.display = el.dataset.prevDisplay === 'auto' ? '' : el.dataset.prevDisplay;
      delete el.dataset.prevDisplay;
    }
    var sec = el.closest('section');
    if (sec && sec.dataset.prevDisplay) {
      sec.style.display = sec.dataset.prevDisplay === 'auto' ? '' : sec.dataset.prevDisplay;
      delete sec.dataset.prevDisplay;
    }
  }

  function apply(data) {
    var t = tokens(data);
    data.__project = currentProject(data);
    if (data.__project && /project\.html/i.test(location.pathname)) {
      document.title = 'Rabees Sheikh — Portfolio';
    }
    document.querySelectorAll('[data-bind-text]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-bind-text'));
      if (v != null && v !== '') el.textContent = fill(v, t);
    });
    document.querySelectorAll('[data-bind-html-text]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-bind-html-text'));
      if (v != null && v !== '') el.textContent = fill(v, t);
    });
    document.querySelectorAll('[data-bind-src]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-bind-src'));
      if (v == null || v === '' || el.getAttribute('src') === v) return;
      el.setAttribute('src', v);
      if (el.tagName === 'VIDEO') { try { el.load(); el.play(); } catch (e) {} }
    });
    document.querySelectorAll('[data-bind-href]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-bind-href'));
      if (v != null && v !== '') el.setAttribute('href', fill(v, t));
    });
    document.querySelectorAll('[data-bind-mailto]').forEach(function (el) {
      var v = get(data, el.getAttribute('data-bind-mailto'));
      if (v) el.setAttribute('href', 'mailto:' + v);
    });
    document.querySelectorAll('[data-render]').forEach(function (el) {
      var name = el.getAttribute('data-render');
      var fn = render[name];
      if (!fn) return;
      if (el.hasAttribute('data-render-once') && el.dataset.rendered === '1') return;
      var html = fn(data, t);
      if (html === HIDE) {
        el.innerHTML = '';
        delete el._siteMarkup;
        if (!el.dataset.prevDisplay) el.dataset.prevDisplay = el.style.display || 'auto';
        el.style.display = 'none';
        document.querySelectorAll('[data-hide-with="' + name + '"]').forEach(function (c) {
          if (!c.dataset.prevDisplay) c.dataset.prevDisplay = c.style.display || 'auto';
          c.style.display = 'none';
        });
        var sec = el.closest('section');
        if (sec) {
          var hasText = (sec.innerText || '').trim() !== '';
          var hasMedia = Array.prototype.some.call(sec.querySelectorAll('img,video,svg'), function (m) {
            return m.offsetParent !== null || m.getClientRects().length > 0;
          });
          if (!hasText && !hasMedia) {
            if (!sec.dataset.prevDisplay) sec.dataset.prevDisplay = sec.style.display || 'auto';
            sec.style.display = 'none';
          }
        }
        return;
      }
      if (html) {
        el.dataset.rendered = '1';
        restore(el);
        document.querySelectorAll('[data-hide-with="' + name + '"]').forEach(restore);
        // Re-applying data must preserve mounted videos and embedded players.
        if (el._siteMarkup !== html) {
          el.innerHTML = html;
          el._siteMarkup = html;
        }
      }
    });
    document.dispatchEvent(new CustomEvent('sitedata', { detail: data }));
  }

  var promise = null;
  function load() {
    if (promise) return promise;
    promise = fetch('data/site.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('site.json ' + r.status); return r.json(); })
      .catch(function () { return null; });
    return promise;
  }

  function boot() {
    load().then(function (data) {
      if (!data) return;
      window.SiteData.data = data;
      window.SiteData.years = yearsSince(get(data, 'meta.experienceStart'));
      apply(data);
      // DC markup mounts after this file runs; re-apply as it lands
      [80, 200, 450, 900, 1600, 2600].forEach(function (ms) {
        setTimeout(function () { apply(data); }, ms);
      });
      window.addEventListener('load', function () { apply(data); });
    });
  }

  window.SiteData = { load: load, apply: apply, yearsSince: yearsSince, tokens: tokens, render: render, fill: fill, data: null };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
