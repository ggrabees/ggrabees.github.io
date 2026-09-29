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
    return (cats ? cats + ' · ' : '') + (p.year || '');
  }

  function media(p, ratio, label) {
    if (p.cover) {
      return '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" style="width:100%;aspect-ratio:' + ratio + ';object-fit:cover;border:1px solid var(--line);display:block" />';
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
          '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:24px;border-top:1px solid var(--line);padding-top:14px">' +
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
          '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:24px;border-top:1px solid var(--line);padding-top:14px">' +
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
          out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(32px,4vw,56px)">' + row.join('') + '</div>';
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
      return '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" style="width:100%;aspect-ratio:16/9;object-fit:cover;border:1px solid var(--line);display:block" />';
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

    projectGallery: function (data) {
      var p = data.__project;
      if (!p || !(p.gallery || []).length) return HIDE;
      return p.gallery.map(function (src) {
        return '<img src="' + esc(src) + '" alt="' + esc(p.title) + '" style="width:100%;object-fit:cover;border:1px solid var(--line);display:block" />';
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
        (n.cover ? '<a href="' + href + '" data-reveal="" style="display:block;position:relative;width:100%"><img src="' + esc(n.cover) + '" alt="' + esc(n.title) + '" style="width:100%;aspect-ratio:21/9;object-fit:cover;border:1px solid var(--line);display:block" /></a>' : '');
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
    if (!el.dataset.prevDisplay) return;
    el.style.display = el.dataset.prevDisplay === 'auto' ? '' : el.dataset.prevDisplay;
    delete el.dataset.prevDisplay;
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
      document.title = data.__project.title + ' · Rabees Sheikh';
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
        el.innerHTML = html;
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
