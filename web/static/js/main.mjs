(() => {
  function p(r, n = 5, t = navigator.hardwareConcurrency || 1) {
    return (
      console.debug("fast algo"),
      new Promise((e, o) => {
        let s = URL.createObjectURL(
            new Blob(["(", y(), ")()"], { type: "application/javascript" }),
          ),
          a = [];
        for (let i = 0; i < t; i++) {
          let c = new Worker(s);
          (c.onmessage = (d) => {
            a.forEach((u) => u.terminate()), c.terminate(), e(d.data);
          }),
            (c.onerror = (d) => {
              c.terminate(), o();
            }),
            c.postMessage({ data: r, difficulty: n, nonce: i, threads: t }),
            a.push(c);
        }
        URL.revokeObjectURL(s);
      })
    );
  }
  function y() {
    return function () {
      let r = (t) => {
        let e = new TextEncoder().encode(t);
        return crypto.subtle.digest("SHA-256", e.buffer);
      };
      function n(t) {
        return Array.from(t)
          .map((e) => e.toString(16).padStart(2, "0"))
          .join("");
      }
      addEventListener("message", async (t) => {
        let e = t.data.data,
          o = t.data.difficulty,
          s,
          a = t.data.nonce,
          i = t.data.threads;
        for (;;) {
          let c = await r(e + a),
            d = new Uint8Array(c),
            u = !0;
          for (let m = 0; m < o; m++) {
            let l = Math.floor(m / 2),
              g = m % 2;
            if (((d[l] >> (g === 0 ? 4 : 0)) & 15) !== 0) {
              u = !1;
              break;
            }
          }
          if (u) {
            (s = n(d)), console.log(s);
            break;
          }
          a += i;
        }
        postMessage({ hash: s, data: e, difficulty: o, nonce: a });
      });
    }.toString();
  }
  function f(r, n = 5, t = 1) {
    return (
      console.debug("slow algo"),
      new Promise((e, o) => {
        let s = URL.createObjectURL(
            new Blob(["(", b(), ")()"], { type: "application/javascript" }),
          ),
          a = new Worker(s);
        (a.onmessage = (i) => {
          a.terminate(), e(i.data);
        }),
          (a.onerror = (i) => {
            a.terminate(), o();
          }),
          a.postMessage({ data: r, difficulty: n }),
          URL.revokeObjectURL(s);
      })
    );
  }
  function b() {
    return function () {
      let r = (n) => {
        let t = new TextEncoder().encode(n);
        return crypto.subtle.digest("SHA-256", t.buffer).then((e) =>
          Array.from(new Uint8Array(e))
            .map((o) => o.toString(16).padStart(2, "0"))
            .join(""),
        );
      };
      addEventListener("message", async (n) => {
        let t = n.data.data,
          e = n.data.difficulty,
          o,
          s = 0;
        do o = await r(t + s++);
        while (o.substring(0, e) !== Array(e + 1).join("0"));
        (s -= 1), postMessage({ hash: o, data: t, difficulty: e, nonce: s });
      });
    }.toString();
  }
  var L = { fast: p, slow: f },
    w = (r = "", n = {}) => {
      let t = new URL(r, window.location.href);
      return (
        Object.entries(n).forEach((e) => {
          let [o, s] = e;
          t.searchParams.set(o, s);
        }),
        t.toString()
      );
    },
    h = (r, n) =>
      w(`/.within.website/x/cmd/anubis/static/img/${r}.png`, {
        cacheBuster: n,
      });
  (async () => {
    let r = document.getElementById("status"),
      n = document.getElementById("image"),
      t = document.getElementById("title"),
      e = document.getElementById("spinner"),
      o = JSON.parse(document.getElementById("anubis_version").textContent);
    r.innerHTML = "Calculating...";
    let { challenge: s, rules: a } = await fetch(
        "/.within.website/x/cmd/anubis/api/make-challenge",
        { method: "POST" },
      )
        .then((l) => {
          if (!l.ok) throw new Error("Failed to fetch config");
          return l.json();
        })
        .catch((l) => {
          throw (
            ((t.innerHTML = "Oh no!"),
            (r.innerHTML = `Failed to fetch config: ${l.message}`),
            (n.src = h("sad", o)),
            (e.innerHTML = ""),
            (e.style.display = "none"),
            l)
          );
        }),
      i = L[a.algorithm];
    if (!i) {
      (t.innerHTML = "Oh no!"),
        (r.innerHTML =
          "Failed to resolve check algorithm. You may want to reload the page."),
        (n.src = h("sad", o)),
        (e.innerHTML = ""),
        (e.style.display = "none");
      return;
    }
    r.innerHTML = `Calculating...<br/>Difficulty: ${a.report_as}`;
    let c = Date.now(),
      { hash: d, nonce: u } = await i(s, a.difficulty),
      m = Date.now();
    console.log({ hash: d, nonce: u }),
      (t.innerHTML = "Success!"),
      (r.innerHTML = `Done! Took ${m - c}ms, ${u} iterations`),
      (n.src = h("happy", o)),
      (e.innerHTML = ""),
      (e.style.display = "none"),
      setTimeout(() => {
        let l = window.location.href;
        window.location.href = w(
          "/.within.website/x/cmd/anubis/api/pass-challenge",
          { response: d, nonce: u, redir: l, elapsedTime: m - c },
        );
      }, 250);
  })();
})();
//# sourceMappingURL=main.mjs.map
